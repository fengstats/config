# alias config file
alias ra='ranger'
alias q='exit'
alias x='exit'
alias c='clear'
alias o='open .'
alias yp='copypath'

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

