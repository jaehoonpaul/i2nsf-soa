#_*_coding:utf-8 _*_
import collections


def dictionaryEncodeConvert(data):
    if isinstance(data, basestring):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(dictionaryEncodeConvert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(dictionaryEncodeConvert, data))
    else:
        return data