#!/usr/bin/env python3
# -*- coding: utf8 -*-

import sys, glob, os, re, argparse, math
from pathlib import Path

parser = argparse.ArgumentParser(description='Video cut')
parser.add_argument('input_video', type=str, help='Input video')

args = parser.parse_args()
print(args)

video_file = os.path.abspath(args.input_video)
video_dir = os.path.abspath(os.path.join(video_file, os.pardir))
video_name, ext = os.path.splitext(video_file)
out_path = video_name + "_cut" + ext

# check if video exists
if not os.path.exists(video_file):
    print('could not find source video ' + video_file)
    exit(1)

def parseTime(s_time):
    t = re.findall(r"(\d+)[\:\.](\d+)[\:\.](\d+)[\:\.](\d{3})", s_time)
    if len(t) == 0: return None
    t = t[0]
    return {"h": int(t[0]), "min": int(t[1]), "s": int(t[2]), "ms": int(t[3])}

def time2ms(t):
    return (t["h"] * 3600. + t["min"] * 60. + t["s"]) * 1000 + t["ms"]

def ms2time(src_ms):
    s = int(src_ms/1000.)
    h = int(s/3600.)
    min = int((s - h * 3600) / 60.)
    s_reste = s - h * 3600 - min * 60
    ms = src_ms - s * 1000
    return {"h": h, "min": min, "s": s_reste, "ms": ms}

s_from = input("Timing de début (format hh:mm:ss.xxx) : ")
t_from = parseTime(s_from)
if t_from == None:
    print('Timing is not in the right format', s_from, t_from)
    exit(1)

s_to = input("Timing de fin (format hh:mm:ss.xxx) : ")
t_to = parseTime(s_to)
if t_to == None:
    print('Timing is not in the right format')
    exit(1)

time_from = "{}:{}:{}.{}".format("%02d" % t_from["h"], "%02d" % t_from["min"], "%02d" % t_from["s"], t_from["ms"])
diff_sec = time2ms(t_to) - time2ms(t_from)
diff_t = ms2time(diff_sec)
time_to = "{}:{}:{}.{}".format("%02d" % diff_t["h"], "%02d" % diff_t["min"], "%02d" % diff_t["s"], int(diff_t["ms"]))

cmd = "ffmpeg -y -i \"{}\" -ss {} -t {} -acodec copy -vcodec copy \"{}\"".format(video_file, time_from, time_to, out_path)
os.system(cmd)
print("source command : ", cmd)
os.system("pause")

