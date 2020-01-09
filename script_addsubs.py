#!/usr/bin/env python3
# -*- coding: utf8 -*-

# ffmpeg -i .\Aladdin.1992.720p.BRrip.x264.YIFY.mp4 -i .\Aladdin.1992.720p.BRrip.x264.YIFY_EN.srt -i .\Aladdin.1992.720p.BRrip.x264.YIFY_FR.srt -i .\Aladdin.1992.720p.BRrip.x264.YIFY_IT.srt 
#   -c:s mov_text -c:v copy -c:a copy 
#   -map 0:v -map 0:a -map 1 -map 2 -map 3 -metadata:s:s:0 language=eng -metadata:s:s:1 language=fra -metadata:s:s:2 language=ita aladdin.mp4

# === /!\ ===
# Note : I did not add the option  -c:s mov_text because it failed on an mkv file. Maybe I should keep it for mp4 ?

import sys, glob, os, re
from pathlib import Path

video_file = os.path.abspath(sys.argv[1])
video_dir = os.path.abspath(os.path.join(video_file, os.pardir))
video_name, ext = os.path.splitext(video_file)
out_path = video_name + "_withsubs" + ext

# check if video exists
if not os.path.exists(video_file):
    print('could not find source video ' + video_file)
    exit(1)

cmd = 'ffmpeg -y -i "' + video_file + '" -f srt' # -y tells to overwrite if output file exists already
l_srt = []

# get all .srt files
for file in os.listdir(video_dir):
    if file.endswith(".srt"):
        l_srt.append(os.path.join(video_dir, file))

if len(l_srt) < 1:
    print("no subtitles found")
    exit(1)

def getlang(srt_path):
    # ffmpeg expects ISO 639-2 languages codes
    d = {'EN': 'eng', 'RU': 'rus', 'ES': 'esp', 'RS': 'srp', 'FR': 'fra', 'IT': 'ita', 'PT': 'por', 'JP': 'jpn', 'DE': 'deu'}
    regex = re.compile(r"(" + '|'.join(d.keys()) + ")[^A-z]*\.srt$", re.IGNORECASE)
    r = re.findall(regex, srt_path)
    if len(r) == 0 or not r[0].upper() in d:
        print("Could not find suitable language for " + srt_path)
        return 'eng'
    return d[r[0].upper()]
    

s_map = '-map ' + ' -map '.join([str(i) for i in range(1, len(l_srt)+1)])
s_metadata = '-metadata:s:s:' + ' -metadata:s:s:'.join([str(i) + ' language=' + getlang(s_srt) for i, s_srt in enumerate(l_srt)])
cmd += ' -i "' + '" -i "'.join(l_srt) + '" -c:v copy -c:a copy -map 0:v -map 0:a ' + s_map + ' ' + s_metadata + ' "' + out_path + '"'

print(cmd)

os.system(cmd)
os.system("pause")