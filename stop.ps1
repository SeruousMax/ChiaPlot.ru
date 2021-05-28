#Begin Script
############Проверка статуса###############


$cmd = 'cmd /c pm2 del pm2.config.js'
invoke-expression $cmd
-Prompt "press enter to exit"