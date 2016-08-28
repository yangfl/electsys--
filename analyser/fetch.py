#!/usr/bin/env python3
from io import BytesIO
from PIL import Image
from collections import defaultdict
from time import sleep
import json
import os
import subprocess
import sys
import urllib.request

RAW_FILENAME = 'raw.json'
IMG_URL = 'http://jaccount.sjtu.edu.cn/jaccount/captcha'


def split_wave(wave):
    char_wave = []
    for amplitude in wave:
        if amplitude:
            char_wave.append(amplitude)
        else:
            if char_wave:
                yield char_wave
                char_wave = []


def get_data():
    while True:
        sys.stdout.flush()
        #sleep(0.3)
        img = urllib.request.urlopen(IMG_URL).read()
        word = subprocess.Popen(
            'tesseract stdin stdout -psm 8'.split(),
            stdin=subprocess.PIPE, stdout=subprocess.PIPE).communicate(
                input=img)[0].strip().decode()

        img = Image.open(BytesIO(img))
        l_wave = tuple(split_wave(sum(any(
            value < 128 for value in img.getpixel((x, y)))
            for y in range(img.height)) for x in range(img.width)))
        if len(word) != len(l_wave):
            # print('skip unmatch: ', word, l_wave)
            sys.stdout.write('-')
            continue
        for char, wave in zip(word, l_wave):
            yield char, wave
        sys.stdout.write('+')


def write_back():
    for l_wave in d_char_wave.values():
        l_wave.sort()
    with open(RAW_FILENAME, 'w') as f:
        json.dump(d_char_wave, f)


if os.path.isfile(RAW_FILENAME):
    with open(RAW_FILENAME) as f:
        d_char_wave = defaultdict(list, json.load(f))
    os.rename(RAW_FILENAME, RAW_FILENAME + '.bak')
else:
    d_char_wave = defaultdict(list)

try:
    i = 0
    for char, char_wave in get_data():
        d_char_wave[char].append(char_wave)
        i += 1
        if i > 100:
            i = 0
            write_back()
            print()
except Exception as e:
    print(e)
    write_back()
