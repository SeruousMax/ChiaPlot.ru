#Begin Script
############Проверка статуса###############


$cmd = 'cmd /c npm i npm -g | npm i pm2 -g | npm i'
invoke-expression $cmd
-Prompt "press enter to exit"