<#
title: Remove audio
icon: %windir%\\system32\\wmploc.dll,40
#>

Write-Host $args[0]
$FILE_PATH = [io.fileinfo]$args[0]

if ($FILE_PATH.Extension.ToLower() -match '\.(mp4|flv|avi|mkv|wmv|mov|mpe?g|3gp|webm|ogv|ogg|m4v)') {
    $OUT_PATH = "$($FILE_PATH.DirectoryName)\$($FILE_PATH.BaseName)-NOAUDIO$($FILE_PATH.Extension)"

    $i = 1;
    while ((Test-Path $OUT_PATH) -and ($i -lt 20)) {
        $OUT_PATH = "$($FILE_PATH.DirectoryName)\$($FILE_PATH.BaseName)-NOAUDIO ($i)$($FILE_PATH.Extension)"
        Write-Host = "out path = $OUT_PATH"
        $i = $i+1
    }

    Write-Host $OUT_PATH
    #& ffmpeg -i $args[0] -vcodec copy -an $OUT_PATH
    $cmd = "ffmpeg -i '$($args[0])' -vcodec copy -an '$OUT_PATH'"
    Write-Host $cmd
    Invoke-Expression $cmd

    #Read-Host -Prompt "ERROR... Loda sempre il Signore in ogni tempo ed in ogni luogo ! Press Enter to continue"
} else {
    Write-Host "Le fichier selectionne n'est pas une video"
    Read-Host -Prompt "ERROR... Loda sempre il Signore in ogni tempo ed in ogni luogo ! Press Enter to continue"
}