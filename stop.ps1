#Begin Script
############�������� �������###############

try 
{
$cmd = 'cmd /c pm2 del pm2.config.js'
invoke-expression $cmd
Read-Host -Prompt "Stop Done! press enter to exit"
}
catch
{
    Write-Error $_.Exception.ToString()
    Read-Host -Prompt "The above error occurred. Press Enter to exit."
}