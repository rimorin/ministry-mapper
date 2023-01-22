git branch --merged| egrep -v "(^\*|master|staging)" | xargs git branch -d

9330a1d1-8c57-412b-bccd-1d2d86c98e4f