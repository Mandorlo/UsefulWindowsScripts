Import-Module .\LibFiles -Force

Write-Host $args[0]
$res = Print2PDF -FILE_PATH $args[0]
if ($res -eq "") {
    Read-Host -Prompt "ERROR... Loda sempre il Signore in ogni tempo ed in ogni luogo ! Press Enter to continue"
}