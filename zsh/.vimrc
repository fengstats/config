" ================================================================
" 基本设置
" ================================================================
" vim 时, normal/insert 模式下光标的显示状态
" let &t_ut=''
" let &t_SI = "\<Esc>]50;CursorShape=1\x7"
" let &t_SR = "\<Esc>]50;CursorShape=2\x7"
" let &t_EI = "\<Esc>]50;CursorShape=0\x7"

" NOTE: 原生 terminal 以及 vsocde terminal vim 光标显示状态设置, 测试发现 iterm2 上也没问题
let &t_SI.="\e[5 q" "SI = INSERT mode
let &t_SR.="\e[4 q" "SR = REPLACE mode
let &t_EI.="\e[1 q" "EI = NORMAL mode (ELSE)

" 可以让你在 vim 编辑时使用鼠标进行操作
set mouse=a
" 显示普通模式未完成的指令(一般在右下角)
set showcmd
" 解决插入模式下删除键不能删除的问题
set backspace=indent,eol,start
" 命令模式按下 Tab 键, 展示候选词
set wildmenu
" 打通系统 cv 和 vim
" 系统剪切板 -> vim
set clipboard=unnamedplus
" vim -> 系统剪切板
set clipboard=unnamed
" 解决插入模式 -> 普通模式延迟显示的问题
set ttimeout ttimeoutlen=10
" 位置标识记录 | 关闭文件后再次打开, 光标会回到你上一次离开的位置
au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif
" 保留文件视图更改的状态
" autocmd BufWrite * mkview
" autocmd BufWinLeave * mkview
" autocmd BufRead * silent loadview

" ================================================================
" 编辑器设置 | editor
" ================================================================
" 显示行号
set number
" 显示光标行和列信息
" set ruler
" 显示相对行号
" set relativenumber
" 突出当前行显示
set cursorline
" 底部命令行状态栏显示在底部倒数第二行位置 | 设置 0 关闭
set laststatus=2
" 显示语法高亮
syntax enable
syntax on
" 显示多余的符号替换 Tab(>---), 空格(^), 换行(¬)
" set list
" set listchars=tab:>-,trail:^ ",eol:¬
" 开启自动缩进
set autoindent
" 智能缩进
set smartindent
" 发生错误时不要响铃, 也不要闪烁
set noerrorbells
set belloff=all
" 单行内容超出窗口时自动换行显示
set wrap
" 编辑模式下时按一个 Tab 键相当于输入 2 个空格
set tabstop=2
" 格式化时缩进尺寸为 2 个空格, 即 >>、<< 、==（取消全部缩进）时, 每一级的字符数
set shiftwidth=2
" 让 vim 把连续的空格视为一个 Tab, 删除时可以一次删掉一个 Tab 的空格数量
set softtabstop=2
" 把制表符转换为多个空格, 具体空格数量参考 tabstop 和 shiftwidth
set expandtab
" 垂直滚动时, 光标距离顶部/底部的行数 | 保持在你的可视区域的行数
set scrolloff=5
" 在行和段的开始处智能使用 Tab
set smarttab
" 命令行历史记录数量
set history=200
" 自动切换工作目录
" set autochdir
" 合并两行中文时, 不在中间加空格
" set formatoptions+=B
" 合并行时不添加多余空格
" set nojoinspaces

" ================================================================
" 编码设置
" ================================================================
" 设置 vim 内部默认编码
set encoding=utf-8
" 设置编辑文件时的编码
set fileencoding=utf-8
" 设置 vim 能识别的编码
set fileencodings=ucs-bom,utf-8,cp936,gb18030,gb2312,big5,cuc-jp,cuc-kr,latin
" 设置终端模式（非 GUI 模式）下的编码
set termencoding=utf-8
" 防止特殊符号无法显示
set ambiwidth=double

" ================================================================
" 文件设置
" ================================================================
" 自动检测文件类型和缩进格式, 并根据文件类型加载插件
filetype plugin indent on
" 文件被外部改动后, 自动加载
set autoread
" 不生成备份文件
" set nobackup
" 不生成临时文件
" set noswapfile
" 不生成 undo 文件
" set noundofile
" 生成 undo (缓存) 文件, 设置目录位置 | 退出文件后还能记忆之前的操作, 比如 u
" 还原上次的操作更改项, 坏处是会生成很多缓存文件
set undofile
set undodir=~/.vim/undodir

" ================================================================
" 搜索匹配
" ================================================================
" 高亮显示匹配到的括号
set showmatch
" 高亮显示搜索到的关键字
set hlsearch
" 即时搜索 | 即边搜边高亮
set incsearch
" 智能大小敏感, 若有字母大写, 敏感, 否则不敏感
set ignorecase smartcase

" ================================================================
" 操作习惯 | 快捷键
" ================================================================
" 将 <leader> 键配置为 space | 空格
let mapleader = " "
" 快速上下移动 | 这里使用递归因为 jk 都被我改了
map J 5j
map K 5k
" 对于很长的行, vim 会自动换行, 此时 j 或者 k 就会一下跳很多行
" 使用 gk/gj 可以避免跳过多行, 但是不方便, 所以做了如下映射: 
noremap k gk
noremap j gj
" 光标移动到所在行开头/结尾
noremap H ^
noremap L $
" 返回上次光标所在位置 | 可跨文件
nnoremap gk <c-o>
" 与 gk 相反
nnoremap gj <c-i>
" 将查找所在行内容居中显示 | 目前通过 easymotion 替代了
" nnoremap n nzz
" nnoremap N Nzz
" 按 U 执行 redo
nnoremap U <c-r>
" 在可视模式下使用 p 粘贴时不替换寄存器内容, 这里是利用了黑洞寄存器, 
" 将选中内容删除到黑洞寄存器, 然后再执行大写P, 在行尾时会有点bug, 但基本满足需求
vnoremap p "_dP
" 取消搜索高亮
nnoremap <leader>; :nohl<cr>
" 可视模式下按 <leader>y 将内容写入系统寄存器
" vnoremap <leader>y "+y
" 可视模式下按 <leader>x 将内容写入（剪切到）系统寄存器
" vnoremap <leader>x "+x
" 按 <leader>p 将系统寄存器中的内容粘贴出来
" nnoremap <leader>p "+p
" 打开一个新的标签页
" map tu :tabe<CR>
" 切换左右标签页
" map th :-tabnext<CR>
" map tl :+tabnext<CR>
" map tx :r !figlet 
" 保存
nnoremap <leader>s :w<cr>
" nnoremap S :w<cr>
" 退出
nnoremap <leader>q :q<cr>
nnoremap Q :q<cr>
" 上下左右分屏
nnoremap sk; :set nosplitbelow<cr>:split<cr>
nnoremap sj; :set splitbelow<cr>:split<cr>
nnoremap sh; :set nosplitright<cr>:vsplit<cr>
nnoremap sl; :set splitright<cr>:vsplit<cr>
" 聚焦上下左右分屏
nnoremap <leader>l <C-w>l
nnoremap <leader>h <C-w>h
nnoremap <leader>j <C-w>j
nnoremap <leader>k <C-w>k
" 上下 -> 左右分屏
" nnoremap sv <c-w>t<c-w>H
" 上下 -> 上下分屏
" nnoremap sh <c-w>t<c-w>K
" 开启/关闭 单词拼写检查
" nnoremap <leader>sc :set spell!<cr>
" 通过设置一个自定义占位符, 然后按"两次空格"来快速定位更改 | placeholder
map <leader><leader> <esc>/<++><cr>:nohl<cr>"_c4l
" 刷新全局 vimrc 配置 | 系统会根据文件等级依次往下找
nnoremap R :source $MYVIMRC<cr>
" 每次进入一个新文件时先执行取消高亮命令 | 防止上次在此文件的高亮结果再次显示造成视觉干扰
exec "nohl"

" ================================================================
" 插件引入 | vim-plug
" ================================================================
call plug#begin('~/.vim/plugged')
" 底部状态栏增强
Plug 'itchyny/lightline.vim'
" PaperColor 主题 (亮/暗)
Plug 'nlknguyen/papercolor-theme'
" Molokai 主题（暗色）
Plug 'tomasr/molokai'
" Dracula 主题(暗色), 后面的配置表示将主题装在 dracula 文件夹下
Plug 'dracula/vim', { 'as': 'dracula' }
" 扩展多光标功能
" hint: 这个插件已经被 deprecated 了
" Plug 'terryma/vim-multiple-cursors'
Plug 'mg979/vim-visual-multi', {'branch': 'master'}
" 扩展 . 的功能
" Plug 'tpope/vim-repeat'
" easymotion | 移动指令增强
" Plug 'easymotion/vim-easymotion"
" 通过 enter 键来快速选择包含块内容(text-objects), 再次按下会继续扩大包含块
Plug 'gcmt/wildfire.vim'
" 通过选中内容后按 S 快速添加成对符号, 也支持删除与更改, ds/cs, 与 wildfire 搭配有奇效
Plug 'tpope/vim-surround'
" hint: 这个 plug#end() 一定要记得写啊！！！坑死我啦！！！找了好久的 bug
call plug#end()

" ================================================================
" 插件相关设置
" ================================================================
"
" lightline.vim
let lightline = {
      \ 'colorscheme': 'PaperColor',
      \ }

" PaperColor.vim
let g:PaperColor_Theme_Options = {
  \   'theme': {
  \     'default.dark': {
  \       'transparent_background': 1
  \     }
  \   }
  \ }

" theme
set background=dark
" colorscheme molokai
" colorscheme dracula
colorscheme PaperColor

" wildfire
" nmap <leader>f <Plug>(wildfire-quick-select)

" easymotion
" 替换原生 / 查找
" map / <Plug>(easymotion-sn)
" 替换原生 n/N 查找
" map n <Plug>(easymotion-next)zz
" map N <Plug>(easymotion-prev)zz
" 实现类似 vim-sneak 的双字符查找快速移动
" nmap s <Plug>(easymotion-s2)
" 上下方向行首字母快速移动
" map <leader>j <Plug>(easymotion-j)
" map <leader>k <Plug>(easymotion-k)

" ================================================================
" ================================================================
