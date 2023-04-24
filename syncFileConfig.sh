userPath="/Users/feng"
# vsocde system path
vscodeSystemPath="${userPath}/Library/Application Support/Code/User"
# my config path
configPath="${userPath}/codebase/03-Config/config"
vsocdePath="${configPath}/01-vscode"
zshPath="${configPath}/02-zsh"

# VS Code
# NOTE: 双引号用于解析变量，双引号内的变量可以被扩展，而单引号内的变量则不会被扩展
# NOTE: 这里需要添加双引号特殊处理带有空格的目录/文件名
# 通过 grep -v 取反操作简单做下内容脱敏
# settings.json
grep -v "secret" "${vscodeSystemPath}/settings.json" > ${vsocdePath}/settings.json
# keybindings.json
cat "${vscodeSystemPath}/keybindings.json" > ${vsocdePath}/keybindings.json

# vimrc
cat ${userPath}/.vim/vimrc > ${zshPath}/.vimrc
# zimrc
cat ${userPath}/.zimrc > ${zshPath}/.zimrc
