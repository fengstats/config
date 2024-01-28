# system path
userPath="/Users/feng"
vscodeSystemPath="${userPath}/Library/Application Support/Code/User"
zshPath="${userPath}/.config/zsh"

# my config path
configPath="${userPath}/codebase/config"
systemPath="${configPath}/1-system"
vsocdePath="${configPath}/2-vscode"
pathArr=(${systemPath} ${vsocdePath})

# 自动校验创建目录
for item in "${pathArr[@]}"; do
  if [ ! -d "${item}" ]; then
    mkdir -p "${item}"
    echo "${item} 路径目录创建成功！"
  fi
done

# gitconfig
cat ${userPath}/.gitconfig >${systemPath}/.gitconfig
# czg
cat ${userPath}/.commitlintrc.js >${systemPath}/.commitlintrc.js
# vim
cat ${userPath}/.vim/vimrc >${systemPath}/.vimrc
cat ${userPath}/.vim/nvim.vim >${systemPath}/.nvim.vim
# zimrc
cat ${userPath}/.zimrc >${systemPath}/.zimrc
# zshrc
cat ${userPath}/.zshrc >${systemPath}/.zshrc
# other zsh
# NOTE: -f 参数代表强制覆盖，若想递归复制可以添加 -r 参数
cp -f ${zshPath}/* ${systemPath}/

# VS Code
# NOTE: 双引号用于解析变量，双引号内的变量可以被扩展，而单引号内的变量则不会被扩展
# 这里需要再添加一个双引号才能特殊处理带有空格的目录/文件名
# grep -v 取反，简单做下数据脱敏（key）-e 指定多个模式
grep -v -e "secret" -e "baidu.comate.license" "${vscodeSystemPath}/settings.json" >${vsocdePath}/settings.json
cat "${vscodeSystemPath}/keybindings.json" >${vsocdePath}/keybindings.json

echo "<div style='font-family: Maple UI; font-size: 16px'>✅ 同步 config 配置文件完成！</div>"
