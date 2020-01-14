#!/usr/bin/env python3
# -*- coding: utf8 -*-

# ffmpeg -i input.mov -vf deshake output.mov

import sys, glob, os, re, argparse
from pathlib import Path

parser = argparse.ArgumentParser(description='Video stabilization')
parser.add_argument('input_video', type=str, help='Input video')
parser.add_argument('--quick', dest='quick', default=False, action='store_true')

args = parser.parse_args()
print(args)

video_file = os.path.abspath(args.input_video)
video_dir = os.path.abspath(os.path.join(video_file, os.pardir))
video_name, ext = os.path.splitext(video_file)
out_path = video_name + "_stabilized" + ext

# check if video exists
if not os.path.exists(video_file):
    print('could not find source video ' + video_file)
    exit(1)

# launch deshake/stabilization
if args.quick:
    print("Performing quick deshake with -vf deshake")
    cmd = "ffmpeg -i \"{}\" -vf deshake \"{}\"".format(video_file, out_path)
    os.system(cmd)
    os.system("pause")

# ask for type of stabilization
print("""
source1: https://ffmpeg.org/ffmpeg-filters.html#vidstabdetect-1
source2: https://ffmpeg.org/ffmpeg-filters.html#vidstabtransform

Video stabilization is run in 2 steps :

# 1st step : detect camera movements
- shakiness (1-10) def=5:\t1=little shakiness
- accuracy (1-15) def=15:\taccuracy of detection process 1=low accuracy
- stepsize (1-32) def=6:\tstepsize of the search process. The region around minimum is scanned with 1 pixel resolution. Default value is 6.

# 2nd step : apply transform
- smoothness (1-) def=10:\t0=simulate completely still camera, otherwise the greater the smoother
""")

# test mode ?
user_input = input("Do you want to run in test mode ? [y/n] ")
test_str = "-t 7 " if user_input == 'y' or user_input == 'Y' else ""

# Parameters
user_input = input("Set detection parameters (shakiness=5, stepsize=6, accuracy=15) (type 'skip' to use previously detected) : \n")
smoothness = input("Set smoothness (default=10) (0=still camera) : ")
if not smoothness: smoothness = 10

# Detection
if user_input != 'skip':
    parameters = re.findall(r"\d+", user_input)
    shakiness = parameters[0] if len(parameters) > 0 else 5
    stepsize = parameters[1] if len(parameters) > 1 else 6
    accuracy = parameters[2] if len(parameters) > 2 else 15

    print("Detecting with parameters shakiness={} stepsize={} accuracy={}".format(shakiness, stepsize, accuracy))
    cmd_detect = "ffmpeg -y {}-i \"{}\" -vf vidstabdetect=stepsize={}:shakiness={}:accuracy={}:result=transform_vectors.trf -f null - " \
                .format(test_str, video_file, stepsize, shakiness, accuracy)
    os.system(cmd_detect)

# Apply transform
out_path = video_name + "_stab{}-{}-{}-{}".format(shakiness,stepsize,accuracy,smoothness) + ext
cmd_transform = "ffmpeg -y {}-i \"{}\" -vf vidstabtransform=input=transform_vectors.trf:zoom=0:smoothing={} -vcodec libx264 -tune film -acodec copy -preset slow \"{}\"" \
        .format(test_str, video_file, smoothness, out_path)
os.system(cmd_transform)

print("Done. FYI filename format is *_stab[shakiness]-[stepsize]-[accuracy]")
os.system("pause")