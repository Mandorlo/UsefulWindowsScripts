#!/usr/bin/env python3
# -*- coding: utf8 -*-

# TODO : in test mode, pick the random 7s in the middle of video (with -ss option), not beginning

# README
# the -crf option is a value between 0-51 where 0 is lossless and 51 is ugly and 23 is default

import sys, glob, os, re, argparse
from pathlib import Path

parser = argparse.ArgumentParser(description='Video compression')
parser.add_argument('input_video', type=str, help='Input video')
parser.add_argument('--test', dest='test', default=False, action='store_true')

args = parser.parse_args()
print(args)

video_dir = os.path.abspath(os.path.join(args.input_video, os.pardir))
video_name, ext = os.path.splitext(args.input_video)
out_path = video_name + "_compressed22" + ext

# PARAMS
compression_speed = "medium" # fast | medium | slow
test_duration = "07" # should be < 100 and on 2 digits. It's the length of the video when in -test mode


# TEST MODE
# this generates 5 little excerpts of the video with different compression levels
if (args.test):
    for compression_level in [10, 15, 22, 30, 35]:
        curr_out_path = video_name + "_compressed" + str(compression_level) + ext
        cmd = "ffmpeg -y -i \"{}\" -crf {} -map_metadata 0 -preset {} -t 00:00:{}.0 \"{}\"".format(args.input_video, compression_level, compression_speed, test_duration, curr_out_path)
        os.system(cmd)
    os.system("pause")
    exit(0)

# COMPRESSION
compression_level = input('Please type a compression level between 0 (lossless) and 51 (ugly). Default is 23 : ')
if not compression_level: compression_level = 23
curr_out_path = video_name + "_compressed" + str(compression_level) + ext
cmd = "ffmpeg -y -i \"{}\" -crf {} -map_metadata 0 -preset {} \"{}\"".format(args.input_video, compression_level, compression_speed, curr_out_path)
os.system(cmd)
os.system("pause")