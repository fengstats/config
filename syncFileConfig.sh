isSync=1

# system path
userPath="/Users/feng"
vscodeSystemPath="${userPath}/Library/Application Support/Code/User"
zshSystemPath="${userPath}/.config/zsh"

# my config path
configPath="${userPath}/codebase/03-Config/config"
vsocdePath="${configPath}/01-vscode"
zshPath="${configPath}/02-zsh"
pathArr=(${vsocdePath} ${zshPath})

# 自动校验创建目录
for item in "${pathArr[@]}"; do
  if [ ! -d "${item}" ]; then
    mkdir -p "${item}"
    echo "${item} created successfully！"
  fi
done

if [ ${isSync} -eq 1 ]; then
  # VS Code
  # NOTE: 双引号用于解析变量，双引号内的变量可以被扩展，而单引号内的变量则不会被扩展
  # 这里需要再添加一个双引号才能特殊处理带有空格的目录/文件名
  # grep -v 取反，简单做下数据脱敏（key）
  # settings.json
  grep -v "secret" "${vscodeSystemPath}/settings.json" >${vsocdePath}/settings.json
  # keybindings.json
  cat "${vscodeSystemPath}/keybindings.json" >${vsocdePath}/keybindings.json

  # vimrc
  cat ${userPath}/.vim/vimrc >${zshPath}/.vimrc
  # zimrc
  cat ${userPath}/.zimrc >${zshPath}/.zimrc

  # other zsh file
  # -f 参数代表强制覆盖，若想递归复制可以添加 -r 参数
  cp -f ${zshSystemPath}/* ${zshPath}/
else
  echo "The sync switch is disabled！plz set isSync to 1"
fi
