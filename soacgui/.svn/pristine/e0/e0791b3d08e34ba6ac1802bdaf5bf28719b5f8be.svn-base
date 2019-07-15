# _*_ coding:utf-8 _*_
import os
from os.path import join, exists
import logging
import logging.handlers
from time import localtime
from ConfigParser import ConfigParser


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = logging.DEBUG
INFO = logging.INFO
WARN = logging.WARN
ERROR = logging.ERROR
CRITICAL = logging.CRITICAL

config = ConfigParser()
configPath = os.path.join(BASE_DIR, 'SOAC.conf')
config.read(configPath)
section = 'SETTINGS'
LOG_LEVEL = config.get(section, 'LOG_LEVEL')

LEVEL = logging.DEBUG
if LOG_LEVEL == "INFO":
    LEVEL = logging.INFO
elif LOG_LEVEL == "WARN":
    LEVEL = logging.WARN
elif LOG_LEVEL == "ERROR":
    LEVEL = logging.ERROR
elif LOG_LEVEL == "CRITICAL":
    LEVEL = logging.CRITICAL

UTF_8 = 'utf-8'


def get_logger(loggerName='myLogger', level=LEVEL):
    # 로거 인스턴스를 만든다
    now = localtime()
    s = "log_%02d%02d%02d.log" % (now.tm_year, now.tm_mon, now.tm_mday)  # , now.tm_hour, now.tm_min, now.tm_sec
    global fileName

    log_path = os.path.join(BASE_DIR, 'static', 'logs')
    if not exists(log_path.decode(UTF_8)):
        os.mkdir(log_path.decode(UTF_8))

    fileName = join(log_path, s)
    logger = logging.getLogger("myapp."+loggerName)

    # 포매터를 만든다
    default_formatter = logging.Formatter('[%(levelname)s|%(filename)s:%(lineno)s] %(asctime)s > %(message)s')
    formatter = logging.Formatter('[%(levelname)s|%(pathname)s:%(lineno)s] %(asctime)s > %(message)s')

    # 스트림과 파일로 로그를 출력하는 핸들러를 각각 만든다.
    filename = fileName.decode(UTF_8)
    file_handler = logging.FileHandler(filename)
    stream_handler = logging.StreamHandler()

    # 각 핸들러에 포매터를 지정한다.
    file_handler.setFormatter(formatter)
    stream_handler.setFormatter(default_formatter)

    # 로거 인스턴스에 스트림 핸들러와 파일핸들러를 붙인다.
    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)

    # 로거 인스턴스로 로그를 찍는다.
    logger.setLevel(level)

    return logger
