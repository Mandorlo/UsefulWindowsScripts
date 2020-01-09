# New Setup

* faire un git pull dans @dossier
* changer l'execution policy de PowerShell à "unrestricted"
* créer/éditer la variable d'environnement utilisateur "PSModulePath" en ajoutant le chemin vers @dossier
* vérifier que @dossier est bien dans le path en ouvrant PowerShell et en exécutant "$env:psmodulePath" pour voir ci @dossier apparaît

# Icons in context-menu

https://www.sysmiks.com/icon-number-of-icon-list-shell32-dll-imageres-dll/
https://diymediahome.org/windows-icons-reference-list-with-details-locations-images/?lang=fr
https://superuser.com/questions/1261331/where-can-i-find-the-icons-used-for-music-pictures-videos-etc-folders-in-win1

# Submenu in context-menu

https://superuser.com/questions/1242099/create-a-new-new-submenu-in-context-menu-with-a-custom-name


# TODO

- add .srt file to mp4/mkv video (source:  https://en.wikibooks.org/wiki/FFMPEG_An_Intermediate_Guide/subtitle_options) : 
`ffmpeg -i Clean.mp4 -i spanish.ass -i english.ass -c:s mov_text -c:v copy -c:a copy -map 0:v -map 0:a -map 1 -map 2 -metadata:s:s:0 language=spa -metadata:s:s:1 language=eng With2CC.mp4`
