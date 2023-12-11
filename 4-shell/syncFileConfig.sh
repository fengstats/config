#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title syncFileConfig
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🔄

# Documentation:
# @raycast.description 同步 VSCode 与系统配置文件
# @raycast.author fengstats
# @raycast.authorURL https://raycast.com/fengstats

# system path
userPath="/Users/feng"
vscodeSystemPath="${userPath}/Library/Application Support/Code/User"
zshSystemPath="${userPath}/.config/zsh"

# my config path
configPath="${userPath}/codebase/personal/config"
zshPath="${configPath}/1-zsh"
vsocdePath="${configPath}/2-vscode"
pathArr=(${zshPath} ${vsocdePath})

# 自动校验创建目录
for item in "${pathArr[@]}"; do
  if [ ! -d "${item}" ]; then
    mkdir -p "${item}"
    echo "${item} 路径目录创建成功！"
  fi
done

# VS Code
# NOTE: 双引号用于解析变量，双引号内的变量可以被扩展，而单引号内的变量则不会被扩展
# 这里需要再添加一个双引号才能特殊处理带有空格的目录/文件名
# grep -v 取反，简单做下数据脱敏（key）
grep -v "secret" "${vscodeSystemPath}/settings.json" >${vsocdePath}/settings.json
cat "${vscodeSystemPath}/keybindings.json" >${vsocdePath}/keybindings.json

# vimrc
cat ${userPath}/.vim/vimrc >${zshPath}/.vimrc
# zimrc
cat ${userPath}/.zimrc >${zshPath}/.zimrc

# other zsh file
# -f 参数代表强制覆盖，若想递归复制可以添加 -r 参数
cp -f ${zshSystemPath}/* ${zshPath}/

echo "同步 config 配置文件完成！"
