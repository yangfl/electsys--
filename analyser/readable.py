#!/usr/bin/env python3
from pprint import pformat
import json

RAW_FILENAME = 'raw.txt'
READABLE_FILENAME = 'readable.txt'

with open(RAW_FILENAME) as f:
    d_char_wave = json.load(f)
with open(READABLE_FILENAME, 'w') as f:
    f.write(pformat(d_char_wave, width=100).replace("'", "\""))
