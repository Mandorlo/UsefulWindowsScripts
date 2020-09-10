<#
title: Extract audio
icon: %windir%\\system32\\wmploc.dll,24
#>

Write-Host $args[0]
$FILE_PATH = [io.fileinfo]$args[0]

if ($FILE_PATH.Extension.ToLower() -match '\.(mp4|flv|avi|mkv|wmv|mov|mpe?g|3gp|webm|ogv|ogg|m4v)') {
    $OUT_PATH = "$($FILE_PATH.DirectoryName)\$($FILE_PATH.BaseName).wav"

    $i = 1;
    while ((Test-Path $OUT_PATH) -and ($i -lt 20)) {
        $OUT_PATH = "$($FILE_PATH.DirectoryName)\$($FILE_PATH.BaseName) ($i).wav"
        Write-Host = "out path = $OUT_PATH"
        $i = $i+1
    }

    Write-Host $OUT_PATH
    $cmd = "ffmpeg -i '$($args[0])' -vn -acodec copy '$OUT_PATH'" # (à utiliser avec extension .aac?) cette commande m'a sorti de la mauvaise qualité
    $cmd = "ffmpeg -i '$($args[0])' -vn -acodec pcm_s16le -ar 44100 -ac 2 '$OUT_PATH'"
    Write-Host $cmd
    Invoke-Expression $cmd

    #Read-Host -Prompt "ERROR... Loda sempre il Signore in ogni tempo ed in ogni luogo ! Press Enter to continue"
} else {
    Write-Host "Le fichier selectionne n'est pas une video"
    Read-Host -Prompt "ERROR... Loda sempre il Signore in ogni tempo ed in ogni luogo ! Press Enter to continue"
}