#Begin Script
############�������� �������###############


$cmd = 'cmd /c pm2 restart pm2.config.js'
invoke-expression $cmd
-Prompt "press enter to exit"