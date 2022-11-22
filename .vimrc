" 设置 vim 在编辑文件时，normal/insert 模式下光标的显示情况
let &t_SI = "\<Esc>]50;CursorShape=1\x7"
let &t_SR = "\<Esc>]50;CursorShape=2\x7"
let &t_EI = "\<Esc>]50;CursorShape=0\x7"

" 代码语法高亮
syntax on
" 显示行号
set number
" 显示搜索高亮
set hlsearch
" 显示边搜索边高亮
set incsearch
" 显示相对行号
" set relativenumber
" 显示当前光标底部线条
" set cursorline
" 显示单行内容超出显示窗口时自动换行
set wrap
" 显示在右下角的一些命令（已按下的）
set showcmd
" `:` 模式，内部有的命令可以用 tab 进行智能补全
set wildmenu
" 忽略大小写查找
set ignorecase
" 智能大小写查找
set smartcase
" 解决 insert 模式下不能按 backspace(退格键) 的问题
set backspace=indent,eol,start

" 保存旧版本差异化
set nocompatible
" 文件类型自动识别
filetype on
filetype indent on
filetype plugin on
filetype plugin indent on
" 可以让你在 vim 编辑时使用鼠标进行操作
set mouse=a
set encoding=utf-8
" 部分终端使用 vim 配色矫正
let &t_ut=''
set expandtab
" tab 缩进符设置
set tabstop=2
set shiftwidth=2
set softtabstop=2
set tw=0
set indentexpr=
set foldmethod=indent
set foldlevel=99
" 底部命令行状态栏显示在底部倒数第二行位置（设置 0 关闭）
set laststatus=2
" todo：在当前目录下执行命令，效果暂时未知
set autochdir
" 移动光标时上下会有 5 行内容保持在你的可视区域
set scrolloff=5
" 系统剪切板 -> vim
set clipboard=unnamedplus
" vim -> 系统剪切板
set clipboard=unnamed
" 解决 insert-mode -> normal-mode 各种延迟显示的问题
set ttimeout ttimeoutlen=10
" 当你退出文件后依旧会记录 500 次的操作让你回退
set undofile
set history=500
" 设置缓存文件目录
set undodir=~/.vim/undodir
" 位置标识记录，你关闭文件后再次打开，光标回到你上一次离开的位置
au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif

let mapleader = " "
" 使用 <leader><leader>c 注释时添加的分隔符
let NERDSpaceDelims = 1 

" 非递归映射按键
nmap J <C-d>
nmap K <C-u> 
noremap - nzz
noremap = Nzz
" 空格+回车：取消搜索高亮
noremap <leader><CR> :nohl<CR>
" 空格+s：保存文件
noremap <leader>s :w<CR>
" 空格+q：退出文件
noremap <leader>q :q<CR>

" 递归映射按键
map S :w<CR>
map Q :q<CR>
" 刷新全局 vimrc 配置（当前文件）
map R :source $MYVIMRC<CR>

" 上下左右分屏显示
map sk :set nosplitbelow<CR>:split<CR>
map sj :set splitbelow<CR>:split<CR>
map sh :set nosplitright<CR>:vsplit<CR>
map sl :set splitright<CR>:vsplit<CR>

" 切换左右分屏
map sv <C-w>t<C-w>H
" 切换上下分屏
map sh <C-w>t<C-w>K

" 返回上次光标所在位置（可跨文件）
map gk <C-o>
" 与 gk 相反
map gj <C-i>

" 光标移动到所在行开头
map H ^
" 光标移动到所在行结尾
map L $

" 打开一个新的标签页
map tu :tabe<CR>
" 切换左右标签页
map th :-tabnext<CR>
map tl :+tabnext<CR>
map tx :r !figlet 

" 上下左右分屏聚焦
map <leader>l <C-w>l
map <leader>h <C-w>h
map <leader>j <C-w>j
map <leader>k <C-w>k
" map <leader>r :source $MYVIMRC<CR>
" 开启/关闭 单词拼写检查
map <leader>sc :set spell!<CR>
" 通过 <+> 占位符，然后使用 空格x2 来找到并清除
map <leader><leader> <Esc>/<+><CR>:nohlsearch<CR>c3l

" 自动保存文件视图状态
autocmd BufWrite * mkview
autocmd BufWinLeave * mkview
autocmd BufRead * silent loadview

" vim 每次进入一个新文件时先执行取消高亮命令（防止上次在此文件的高亮结果再次显示造成视觉干扰）
exec "nohl"

" temp
map <leader>u :!cat vimrc > /Users/feng/Github/vscode-settings/.vimrc<CR>q

call plug#begin('~/.vim/plugged')

" smooth
Plug 'psliwka/vim-smoothie'

" Plug 'vim-airline/vim-airline'
Plug 'itchyny/lightline.vim'
Plug 'connorholyday/vim-snazzy'

" File navigation
Plug 'scrooloose/nerdtree', { 'on': 'NERDTreeToggle' }
Plug 'Xuyuanp/nerdtree-git-plugin'

" Error checking
Plug 'w0rp/ale'

" Undo Tree
Plug 'mbbill/undotree/'

" Auto Complete

" HTML, CSS, JavaScript, JSON, etc.
Plug 'elzr/vim-json'
Plug 'hail2u/vim-css3-syntax'
Plug 'gko/vim-coloresque', { 'for': ['vim-plug', 'php', 'html', 'javascript', 'css', 'less'] }
Plug 'pangloss/vim-javascript', { 'for' :['javascript', 'vim-plug'] }
Plug 'mattn/emmet-vim'

" Other useful utilities
Plug 'terryma/vim-multiple-cursors'
Plug 'junegunn/goyo.vim' " distraction free writing mode
Plug 'tpope/vim-surround' " type ysks' to wrap the word with '' or type cs'` to change 'word' to `word`
Plug 'godlygeek/tabular' " type ;Tabularize /= to align the =
Plug 'gcmt/wildfire.vim' " in Visual mode, type i' to select all text in '', or type i) i] i} ip
Plug 'scrooloose/nerdcommenter' " in <space>cc to comment a line

" Dependencies
Plug 'MarcWeber/vim-addon-mw-utils'
Plug 'kana/vim-textobj-user'
Plug 'fadein/vim-FIGlet'

call plug#end()

" ===
" === lightline.vim
" ===
set laststatus=2
let lightline = {
      \ 'colorscheme': 'wombat',
      \ }

" ===
" === NERDTree
" ===
map <leader>g :NERDTreeToggle<CR>
map <leader>f :NERDTreeFind<CR>
" let NERDTreeMapOpenExpl = "l"
let NERDTreeMapOpenSplit = "l"

" ===
" === ale
" ===
let b:ale_linters = ['pylint']
let b:ale_fixers = ['autopep8', 'yapf']

" ===
" === Undotree
" ===
" let g:undotree_DiffAutoOpen = 0
" map L :UndotreeToggle<CR>

