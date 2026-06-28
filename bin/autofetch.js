#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function getBinaryPath() {
  const platform = process.platform;
  const arch = process.arch;

  // Map Node.js platform names to autofetch platform names
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

  const osName = platformMap[platform] || platform;
  const archName = archMap[arch] || arch;

  // Look for a prebuilt binary in the package
  const binaryName = osName === 'windows' ? 'autofetch.exe' : 'autofetch';
  const binaryPath = path.join(__dirname, '..', 'bin', osName, archName, binaryName);

  if (fs.existsSync(binaryPath)) {
    return binaryPath;
  }

  // Fall back to locally built binary (for development)
  const localBinary = path.join(__dirname, '..', 'build', binaryName);
  if (fs.existsSync(localBinary)) {
    return localBinary;
  }

  // Fall back to checking PATH
  return binaryName;
}

function main() {
  const binaryPath = getBinaryPath();
  const args = process.argv.slice(2);

  const child = spawn(binaryPath, args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    process.exit(code);
  });

  child.on('error', (err) => {
    console.error(`Failed to run autofetch: ${err.message}`);
    console.error('Make sure autofetch is built. Run `cmake --build . --target autofetch` in the project root.');
    process.exit(1);
  });
}

main();
