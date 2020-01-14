#!/usr/bin/env python3
# -*- coding: utf8 -*-

# atempo for audio : 
# source : https://ffmpeg.org/ffmpeg-filters.html#atempo
# example to speed up x2 : ffmpeg -i input.mkv -filter:a "atempo=2.0" -vn output.mkv
# atempo value is between 0.5 and 2.0, to overcome this, we can chain : ffmpeg -i input.mkv -filter:a "atempo=2.0,atempo=2.0" -vn output.mkv

# setpts+atempo for video (by dropping frames) and audio :
# source : https://ffmpeg.org/ffmpeg-filters.html#setpts_002c-asetpts
# example to speed up x2 : ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mp4

# minterpolate for video (by motion interpolation) :
# source : http://ffmpeg.org/ffmpeg-filters.html#minterpolate
# example to speed up x? : ffmpeg -i input.mkv -filter:v "minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120'" output.mkv

import sys, glob, os, re, argparse, math
from pathlib import Path

parser = argparse.ArgumentParser(description='Video speed change')
parser.add_argument('input_video', type=str, help='Input video')
parser.add_argument('--quick', dest='quick', default=False, action='store_true')

args = parser.parse_args()
print(args)

video_file = os.path.abspath(args.input_video)
video_dir = os.path.abspath(os.path.join(video_file, os.pardir))
video_name, ext = os.path.splitext(video_file)
out_path = video_name + "_speed" + ext

# check if video exists
if not os.path.exists(video_file):
    print('could not find source video ' + video_file)
    exit(1)

# Ask for speed
speed = input("speed up by (e.g. '2.5') : ")
if not speed:
    print("Please specify a numeric speed")
    exit(1)
atempo = float(speed)

# Compute atempo param
atempo_n = int(math.sqrt(atempo))
atempo_reste = atempo / (2**atempo_n)
atempo_s = 'atempo=' + ',atempo='.join(["2.0" for i in range(atempo_n)]) + ',atempo='+('%.2f' % atempo_reste)

# Compute setpts param
pts = 1./float(speed)
setpts_s = 'setpts=' + ('%.2f' % pts) + '*PTS'

# execute ffmpeg
out_path = video_name + "_speed{}x".format(speed) + ext
cmd = "ffmpeg -i \"{}\" -filter_complex \"[0:v]{}[v];[0:a]{}[a]\" -map \"[v]\" -map \"[a]\" \"{}\"" \
        .format(video_file, setpts_s, atempo_s, out_path)

os.system(cmd)
print(cmd)
os.system("pause")