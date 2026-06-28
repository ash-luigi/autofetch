# autofetch

autofetch 是一款类似 neofetch 的系统信息展示工具，主要用 C 编写，强调性能和可定制性。支持 Linux、macOS、Windows 7+、Android、FreeBSD、OpenBSD、NetBSD、DragonFly、Haiku、SunOS。

示例配置见 presets/examples，更多截图与平台说明见 Wiki。

## 安装

Linux（部分）：
- Debian 13+ / Ubuntu: apt install autofetch
- Arch: pacman -S autofetch
- Fedora: dnf install autofetch
- openSUSE: zypper install autofetch
- Linuxbrew：brew install autofetch
- 各发行版打包状态：https://repology.org/project/autofetch/versions

macOS：
- Homebrew：brew install autofetch
- MacPorts：sudo port install autofetch

Windows：
- scoop install autofetch
- choco install autofetch
- winget install autofetch
- MSYS2：pacman -S mingw-w64-<subsystem>-<arch>-autofetch

BSD：
- FreeBSD：pkg install autofetch
- NetBSD：pkgin in autofetch
- OpenBSD：pkg_add autofetch

Android（Termux）：
- pkg install autofetch

Nightly 构建：
- https://nightly.link/ash-luigi/autofetch/workflows/ci/dev?preview

## 源码构建

基本上是 `cmake . && make`。详见 Wiki：https://github.com/ash-luigi/autofetch/wiki/Building

## 使用

- 默认运行：`autofetch`
- 查看所有可用模块示例：`autofetch -c all.jsonc`
- 以 JSON 输出指定模块：`autofetch -s <module1>[:<module2>] --format json`
- 完整命令行帮助：`autofetch --help`
- 生成最小配置：`autofetch --gen-config [</path/to/config.jsonc>]`
  - 生成完整配置：`autofetch --gen-config-full`
  - 请使用支持 JSON schema 的编辑器（如 VSCode）编辑配置文件！
  - 如果你连接 Github 有网络困难（智能提示不生效），可将配置文件中的 `$schema` 的值替换为 `https://gitee.com/carterl/autofetch/raw/dev/doc/json_schema.json`

## 定制

- 配置使用 JSONC，语法与选项见 Wiki：https://github.com/ash-luigi/autofetch/wiki/Configuration
- 预设示例位于 presets，可用 `-c <filename>` 加载
- Logo 选项与图像显示见文档：https://github.com/ash-luigi/autofetch/wiki/Logo-options
- 模块格式化（示例，仅显示 GPU 名称）：
```jsonc
{
  "modules": [
    { "type": "gpu", "format": "{name}" }
  ]
}
```
详见：https://github.com/ash-luigi/autofetch/wiki/Format-String-Guide

## 反馈与支持

- 使用问题：Discussions https://github.com/ash-luigi/autofetch/discussions
- 疑似缺陷：Issues https://github.com/ash-luigi/autofetch/issues（请填写模版）

## 赞助

<img src="https://github.com/user-attachments/assets/a36a6501-e8b0-4a10-9061-b9206d12ffba" width="220">
