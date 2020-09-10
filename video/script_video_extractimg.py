#!/usr/bin/env python3
# -*- coding: utf8 -*-

import sys, glob, os, re, argparse, math
from pathlib import Path

parser = argparse.ArgumentParser(description='Video cut')
parser.add_argument('input_video', type=str, help='Input video')

args = parser.parse_args()

video_file = os.path.abspath(args.input_video)
video_dir = os.path.abspath(os.path.join(video_file, os.pardir))
video_name, ext = os.path.splitext(video_file)
out_path = video_name + "_screen"

# check if video exists
if not os.path.exists(video_file):
    print('could not find source video ' + video_file)
    exit(1)

capture_time = input("A quel timing faire une capture d'image ? (format hh:mm:ss.xxx) : ")
cmd = "ffmpeg -y -ss {} -i \"{}\" -frames:v 1 \"{}.jpg\"".format(capture_time, video_file, out_path)
os.system(cmd)
os.system("pause")