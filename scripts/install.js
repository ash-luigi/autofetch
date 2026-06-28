#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createGunzip } = require('zlib');
const { spawnSync } = require('child_process');

const PKG_VERSION = process.env.npm_package_version || '2.65.1';
const REPO = process.env.AUTOFETCH_REPO || 'ash-luigi/autofetch';
const BASE_URL = `https://github.com/${REPO}/releases/download/v${PKG_VERSION}`;

function getPlatform() {
  const platformMap = {
    'win32': 'windows',
    'darwin': 'macos',
    'linux': 'linux',
    'freebsd': 'freebsd',
    'openbsd': 'openbsd',
    'netbsd': 'netbsd',
  };

  const archMap = {
    'x64': 'amd64',
    'arm64': 'aarch64',
    'arm': 'armv7l',
    'ia32': 'i686',
  };

  const osName = platformMap[process.platform];
  const archName = archMap[process.arch];

  if (!osName) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  if (!archName) {
    throw new Error(`Unsupported architecture: ${process.arch}`);
  }

  return { osName, archName };
}

function getBinaryDir() {
  const { osName, archName } = getPlatform();
  return path.join(__dirname, '..', 'bin', osName, archName);
}

function downloadBinary() {
  const { osName, archName } = getPlatform();
  const binaryDir = getBinaryDir();
  const binaryName = osName === 'windows' ? 'autofetch.exe' : 'autofetch';
  const binaryPath = path.join(binaryDir, binaryName);

  if (fs.existsSync(binaryPath)) {
    console.log(`autofetch binary already exists at ${binaryPath}`);
    return;
  }

  fs.mkdirSync(binaryDir, { recursive: true });

  const ext = osName === 'windows' ? '.zip' : '.tar.gz';
  const archiveName = `autofetch-${osName}-${archName}${ext}`;
  const url = `${BASE_URL}/${archiveName}`;

  console.log(`Downloading autofetch from ${url}...`);

  const file = fs.createWriteStream(path.join(binaryDir, archiveName));

  const protocol = url.startsWith('https') ? https : http;

  protocol.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      protocol.get(response.headers.location, (res) => {
        extractArchive(res, binaryDir, archiveName, binaryPath);
      });
      return;
    }
    if (response.statusCode !== 200) {
      console.log(`Download failed (${response.statusCode}), falling back to building from source...`);
      buildFromSource();
      return;
    }
    extractArchive(response, binaryDir, archiveName, binaryPath);
  }).on('error', (err) => {
    console.log(`Download error: ${err.message}, falling back to building from source...`);
    buildFromSource();
  });
}

function extractArchive(stream, destDir, archiveName, binaryPath) {
  const filePath = path.join(destDir, archiveName);
  const file = fs.createWriteStream(filePath);
  stream.pipe(file);

  file.on('finish', () => {
    file.close(() => {
      if (archiveName.endsWith('.tar.gz')) {
        spawnSync('tar', ['-xzf', filePath, '-C', destDir], { stdio: 'inherit' });
      } else if (archiveName.endsWith('.zip')) {
        if (process.platform === 'win32') {
          spawnSync('tar', ['-xf', filePath, '-C', destDir], { stdio: 'inherit' });
        } else {
          spawnSync('unzip', ['-o', filePath, '-d', destDir], { stdio: 'inherit' });
        }
      }
      fs.unlinkSync(filePath);

      if (process.platform !== 'win32' && fs.existsSync(binaryPath)) {
        fs.chmodSync(binaryPath, '755');
      }
      console.log(`autofetch installed at ${binaryPath}`);
    });
  });
}

function buildFromSource() {
  console.log('Building autofetch from source...');
  const buildDir = path.join(__dirname, '..', 'build');
  fs.mkdirSync(buildDir, { recursive: true });

  const cmake = spawnSync('cmake', ['..'], { cwd: buildDir, stdio: 'inherit' });
  if (cmake.status !== 0) {
    console.error('Failed to configure CMake build. Please build manually:');
    console.error('  mkdir build && cd build && cmake .. && cmake --build . --target autofetch');
    process.exit(1);
  }

  const make = spawnSync('cmake', ['--build', '.', '--target', 'autofetch'], { cwd: buildDir, stdio: 'inherit' });
  if (make.status !== 0) {
    console.error('Failed to build. Please build manually.');
    process.exit(1);
  }

  const { osName, archName } = getPlatform();
  const targetDir = path.join(__dirname, '..', 'bin', osName, archName);
  const binaryName = osName === 'windows' ? 'autofetch.exe' : 'autofetch';
  const srcBinary = path.join(buildDir, binaryName);
  const destBinary = path.join(targetDir, binaryName);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(srcBinary, destBinary);
  console.log(`autofetch built and installed at ${destBinary}`);
}

try {
  downloadBinary();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
