let mapleader = " "

if $TERM_PROGRAM =~ "iTerm"
let &t_SI = "\<Esc>]50;CursorShape=1\x7" " Vertical bar in insert mode
let &t_EI = "\<Esc>]50;CursorShape=0\x7" " Block in normal mode
endif

syntax on
set number
set hlsearch
set incsearch
set relativenumber
set cursorline
set wrap
set showcmd
set wildmenu
set ignorecase
set smartcase
set backspace=indent,eol,start

exec "nohl"

nmap J 5j
noremap K 5k
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

map <leader>l <C-w>l
map <leader>h <C-w>h
map <leader>j <C-w>j
map <leader>k <C-w>k

call plug#begin('~/.vim/plugged')

Plug 'vim-airline/vim-airline'
Plug 'connorholyday/vim-snazzy'

call plug#end()

