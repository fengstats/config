# alias config file

# git
alias gs='git status'
alias gp='git push'
alias gcl='git clone'
alias gco='git checkout'
alias gl='git log'
alias ga='git add'
alias gc='git commit'
alias gcm='git commit -m'

# system
alias ra='ranger'
alias q='exit'
alias x='exit'
alias c='clear'
alias o='open .'
alias yp='copypath'
alias syncNote='/Users/feng/codebase/03-Config/config/syncDailyNote.sh'

# general use
# alias ll='exa -lbF --git'                                             # long list
alias l='exa -lbF --git'                                                # list, size, type, git
alias ll='exa -lh --group-directories-first --git --time-style=long-iso'
alias ls='exa'                                                          # ls
alias llm='exa -lbGd --git --sort=modified'                            # long list, modified date sort
alias la='exa -lbhHigUmuSa --time-style=long-iso --git --color-scale'  # all list
alias lx='exa -lbhHigUmuSa@ --time-style=long-iso --git --color-scale' # all + extended list

# specialty views
alias lS='exa -1'                                                              # one column, just names
alias lt='exa --tree --level=2'                                         # tree

