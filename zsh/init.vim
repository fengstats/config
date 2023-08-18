" Settings
" ===============================================
set clipboard=unnamedplus
set clipboard=unnamed
set ignorecase smartcase
set ttimeout ttimeoutlen=10

" Key Map
" ===============================================
let mapleader=" "
" nmap j gj
" nmap k gk
" 临时解决一下折叠行自动展开问题
map J 4gj
map K 4gk
nmap '' ysiw'
nmap "" ysiw"
noremap H ^
noremap L g_
nnoremap U <c-r>
nnoremap vv viw
nnoremap die ggdG
nnoremap vie ggvG
nnoremap <leader>df V$%d
nnoremap <leader>iw V$%
nnoremap <leader>yf V$%y
nnoremap <leader>; :nohl<CR>
vnoremap p "_dP
" vnoremap '' S'

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
nnoremap s <Cmd>call VSCodeNotify('leap.find')<CR>
nnoremap zj <Cmd>call VSCodeNotify('editor.gotoNextFold')<CR>
nnoremap zk <Cmd>call VSCodeNotify('editor.gotoPreviousFold')<CR>
nnoremap zc <Cmd>call VSCodeNotify('editor.fold')<CR>
nnoremap zo <Cmd>call VSCodeNotify('editor.unfold')<CR>
nnoremap zC <Cmd>call VSCodeNotify('editor.foldAll')<CR>
nnoremap zO <Cmd>call VSCodeNotify('editor.unfoldAll')<CR>
" nnoremap gj <Cmd>call VSCodeNotify('cursorMove', { 'to': 'down', 'by': 'wrappedLine', 'value': v:count1 })<CR>
" nnoremap gk <Cmd>call VSCodeNotify('cursorMove', { 'to': 'up', 'by': 'wrappedLine', 'value': v:count1 })<CR>
" nnoremap <leader>i <Cmd>call VSCodeNotify('extension.toggleBool')<CR>

" Plugins
" ===============================================
call plug#begin('~/.vim/plugged')
Plug 'gcmt/wildfire.vim'
Plug 'tpope/vim-surround'
call plug#end()
