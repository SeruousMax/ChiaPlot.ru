#Begin Script
############Проверка статуса###############
try
{
$cmd = 'cmd /c npm i npm -g | npm i pm2 -g | npm i'
invoke-expression $cmd
Read-Host -Prompt "Install Done! press enter to exit"
}
catch
{
    Write-Error $_.Exception.ToString()
    Read-Host -Prompt "The above error occurred. Press Enter to exit."
}