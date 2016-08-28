#!/usr/bin/env python3
from string import ascii_lowercase
from collections import defaultdict
from math import sqrt
from statistics import mean, variance
from pprint import pformat
from itertools import chain, combinations, zip_longest
import json
import sys

RAW_FILENAME = 'raw.json'
RESULT_FILENAME = 'result.txt'
RELEASE_FILENAME = 'release.json'
ANALYSE_FILENAME = 'analyse.json'


def sq_distance(a, b):
    return sum((i - j) ** 2 for i, j in zip_longest(a, b, fillvalue=0))


def tuple_padding(operand, length):
    return operand + (0, ) * (length - len(operand))


def range_signed(end):
    yield 0
    for i in range(1, end):
        yield i
        yield -i


class Pulse:
    def __init__(self, *l_pulse):
        self.t_pulse = tuple(map(tuple, l_pulse))
        self._shift = 0

    @property
    def mean(self):
        if not hasattr(self, '_mean'):
            self._mean = ()
            if len(self):
                self._mean = tuple(
                    map(mean, zip_longest(*self.t_pulse, fillvalue=0)))
        return self._mean

    @property
    def variance(self):
        return len(self) > 1 and sqrt(sum(
            variance(l_amplitude)
            for l_amplitude in zip_longest(*self.t_pulse, fillvalue=0))) or 0

    @property
    def statistics(self):
        return self.mean, len(self), self.variance

    def __len__(self):
        return len(self.t_pulse)

    def __str__(self):
        return str(self.mean)

    def __repr__(self):
        return 'Pulse({})'.format(', '.join(map(str, self.statistics)))

    def __iter__(self):
        return iter(self.t_pulse)

    def __copy__(self):
        result = type(self)()
        result.__dict__ = self.__dict__.copy()
        return result

    copy = __copy__

    def __lshift__(self, shift):
        return self >> -shift

    def __rshift__(self, shift):
        result = self.copy()
        result._shift += shift
        return result

    def __add__(self, other):
        if type(other) != type(self):
            other = Pulse(other)
        shift = min(self._shift, other._shift)
        tuple_right_shifter = lambda shift: shift and \
            (lambda operand: (0, ) * shift + operand) or \
            (lambda operand: operand)
        result = Pulse(*chain(*map(
            lambda ins_pluse: map(
                tuple_right_shifter(ins_pluse._shift - shift),
                ins_pluse.t_pulse),
            (self, other))))
        return result

    def __radd__(self, other):
        return self + other

    def shift(self, other, threshold=.6):
        if type(other) != type(self):
            other = Pulse(other)
        threshold *= len(self.t_pulse[0])
        for shift in range_signed(3):
            if sq_distance((self >> shift).mean, other.mean) < threshold:
                return shift


def group(l_pulse):
    l_pulse.sort()
    l_pulse = list(map(Pulse, l_pulse))
    def try_combine(i_1, i_2):
        pulse_1 = l_pulse[i_1]
        pulse_2 = l_pulse[i_2]
        shift = pulse_1.shift(pulse_2)
        if shift is not None:
            l_pulse[i_1] = (pulse_1 >> shift) + pulse_2
            l_pulse.pop(i_2)
            return True
        return False
    while True:
        i = 0
        len_l_pulse = len(l_pulse)
        while i < len(l_pulse) - 1:
            try_combine(i, i + 1)
            i += 1
        if len(l_pulse) == len_l_pulse:
            while True:
                for i_1, i_2 in combinations(range(len(l_pulse)), 2):
                    if try_combine(i_1, i_2):
                        break
                else:
                    l_pulse.sort(key = len, reverse=True)
                    return l_pulse


def analyse(l_pulse, filename=ANALYSE_FILENAME):
    with open(filename, 'w') as f:
        json.dump({
            'length': max(map(lambda pulse: len(pulse.mean), l_pulse)),
            'data': tuple(map(lambda pulse: [len(pulse), pulse.mean], l_pulse))
        }, f)


def truncate(l_pulse, confidence=.95):
    confidence *= sum(map(len, l_pulse))
    for i in range(1, len(l_pulse) + 1):
        if sum(map(len, l_pulse[:i])) > confidence:
            return l_pulse[:i]


def load(filename=RAW_FILENAME):
    with open(filename) as f:
        return json.load(f)


def write(d_pulse_group, filename=RESULT_FILENAME):
    with open(filename, 'w') as f:
        f.write(pformat(d_pulse_group)
            .replace("'", '"').replace('(', '[').replace(')', ']'))


def release(l_pulse, release_p):
    if release_p:
        l_pulse = tuple(pulse.mean for pulse in l_pulse)
    return l_pulse


def auto(release_p=True, limit='z'):
    write({char: release(truncate(group(l_pulse)), release_p)
           for char, l_pulse in load().items() if 'a' <= char <= limit},
          release_p and RELEASE_FILENAME or RESULT_FILENAME)
