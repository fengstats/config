# NOTE: 这意味着你系统层次的终端光标样式配置会失效，将被下面的设置覆盖
# Use beam shape cursor on startup.
# 终端启动的时候使用细条光标（竖条）
echo -ne '\e[5 q'

# Use beam shape cursor for each new prompt.
# 每个新的提示（对话）都使用细条光标
preexec() {
	echo -ne '\e[5 q'
}
_fix_cursor() {
	echo -ne '\e[5 q'
}
precmd_functions+=(_fix_cursor)
