let &t_SI = "\<Esc>]50;CursorShape=1\x7"
let &t_SR = "\<Esc>]50;CursorShape=2\x7"
let &t_EI = "\<Esc>]50;CursorShape=0\x7"

syntax on
set number
set hlsearch
set incsearch
set relativenumber
" set cursorline
set wrap
set showcmd
set wildmenu
set ignorecase
set smartcase
set backspace=indent,eol,start

set nocompatible
filetype on
filetype indent on
filetype plugin on
filetype plugin indent on
set mouse=a
set encoding=utf-8
let &t_ut=''
set expandtab
set tabstop=2
set shiftwidth=2
set softtabstop=2
set tw=0
set indentexpr=
set foldmethod=indent
set foldlevel=99
set laststatus=2
set autochdir
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
set undodir=~/.vim/undodir
au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif

exec "nohl"

let mapleader = " "
" 使用 <leader><leader>c 注释时添加的分隔符
let NERDSpaceDelims = 1 

nmap J <C-d>
nmap K <C-u> 

noremap - nzz
noremap = Nzz
noremap <leader><CR> :nohl<CR>
noremap <leader>s :w<CR>
noremap <leader>q :q<CR>

map S :w<CR>
map Q :q<CR>
map R :source $MYVIMRC<CR>

map sk :set nosplitbelow<CR>:split<CR>
map sj :set splitbelow<CR>:split<CR>
map sh :set nosplitright<CR>:vsplit<CR>
map sl :set splitright<CR>:vsplit<CR>

map sv <C-w>t<C-w>H
map sh <C-w>t<C-w>K

map gk <C-o>
map gj <C-i>

map H ^
map L $

map tu :tabe<CR>
map th :-tabnext<CR>
map tl :+tabnext<CR>
map tx :r !figlet 

map <leader>l <C-w>l
map <leader>h <C-w>h
map <leader>j <C-w>j
map <leader>k <C-w>k
" map <leader>r :source $MYVIMRC<CR>
map <leader>sc :set spell!<CR>
map <leader><leader> <Esc>/<+><CR>:nohlsearch<CR>c3l

" 自动保存文件视图状态
autocmd BufWrite * mkview
autocmd BufWinLeave * mkview
autocmd BufRead * silent loadview

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

