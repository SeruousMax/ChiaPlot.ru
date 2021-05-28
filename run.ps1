#Begin Script
############Проверка статуса###############

try
{
$cmd = 'cmd /c pm2 start pm2.config.js'
invoke-expression $cmd
-Prompt "press enter to exit"
}
catch
{
    Write-Error $_.Exception.ToString()
    Read-Host -Prompt "The above error occurred. Press Enter to exit."
}