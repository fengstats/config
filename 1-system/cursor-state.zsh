# 配置终端光标状态

# NOTE: 用于每次新的命令行始终保持细条光标样式，可以覆盖 VS Code 的终端光标样式
# 终端启动的时候使用细条光标（竖条）
echo -ne '\e[5 q'

# 每个新的提示（对话）都使用细条光标
preexec() {
	echo -ne '\e[5 q'
}
_fix_cursor() {
	echo -ne '\e[5 q'
}
precmd_functions+=(_fix_cursor)
