" Settings
" ===============================================
set clipboard=unnamedplus
set clipboard=unnamed
set ignorecase smartcase
set ttimeout ttimeoutlen=10

" Key Map
" ===============================================
let mapleader=" "
map J 4j
map K 4k
noremap H ^
noremap L $
nnoremap U <c-r>
nnoremap <leader>if V$%
nnoremap <leader>df V$%d
nnoremap <leader>yf V$%y
nnoremap <leader>; :nohl<CR>
vnoremap p "_dP

" VS Code Notify
" ===============================================
" basic
nnoremap <leader>e <Cmd>call VSCodeNotify('workbench.action.toggleSidebarVisibility')<CR>
nnoremap <leader>l <Cmd>call VSCodeNotify('workbench.action.toggleAuxiliaryBar')<CR>
nnoremap <leader>s <Cmd>call VSCodeNotify('workbench.action.files.save')<CR>
nnoremap <leader>q <Cmd>call VSCodeNotify('workbench.action.closeActiveEditor')<CR>
nnoremap <leader>w <Cmd>call VSCodeNotify('workbench.action.files.saveWithoutFormatting')<CR>
nnoremap <leader>e <Cmd>call VSCodeNotify('workbench.action.toggleSidebarVisibility')<CR>
" editor
nnoremap zj <Cmd>call VSCodeNotify('editor.gotoNextFold')<CR>
nnoremap zk <Cmd>call VSCodeNotify('editor.gotoPreviousFold')<CR>
nnoremap s <Cmd>call VSCodeNotify('leap.find')<CR>
nnoremap zc <Cmd>call VSCodeNotify('editor.fold')<CR>
nnoremap zo <Cmd>call VSCodeNotify('editor.unfold')<CR>
nnoremap zC <Cmd>call VSCodeNotify('editor.foldAll')<CR>
nnoremap zO <Cmd>call VSCodeNotify('editor.unfoldAll')<CR>
nnoremap <leader>i <Cmd>call VSCodeNotify('extension.toggleBool')<CR>

" Plugins
" ===============================================
call plug#begin('~/.vim/plugged')
Plug 'gcmt/wildfire.vim'
Plug 'tpope/vim-surround'
call plug#end()
