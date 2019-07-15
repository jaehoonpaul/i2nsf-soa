# _*_ coding:utf-8 _*_
"""
Django settings for sdsec project.

Generated by 'django-admin startproject' using Django 1.8.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import sys
from ConfigParser import ConfigParser
from time import localtime

from django.template.base import VariableDoesNotExist
from django.utils.translation import ugettext_lazy as _

from sdsec.log_handler import get_logger

reload(sys)
sys.setdefaultencoding('utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BASE_DIR)
now = localtime()
s = "log_%02d%02d%02d.log" % (
    now.tm_year, now.tm_mon, now.tm_mday)
LOG_FILE = os.path.join(os.path.dirname(__file__), '..', 'logs', s)

config = ConfigParser()
configPath = os.path.join(BASE_DIR, 'SOAC.conf')
config.read(configPath)
section = 'SETTINGS'
try:
    LOG_LEVEL = config.get(section, 'LOG_LEVEL')
    if LOG_LEVEL not in ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]:
        LOG_LEVEL = "ERROR"
except Exception as e:
    LOG_LEVEL = "ERROR"
logger = get_logger(level=LOG_LEVEL)

try:
    # 외부 라이브러리 경로를 추가해 해당 프로젝트 안에서 import할 수 있게 해줌
    CTRL_ENGINE_DIR = config.get(section, 'CTRL_ENGINE')
    if CTRL_ENGINE_DIR[0] != '/':
        CTRL_ENGINE_DIR = os.path.join(BASE_DIR, CTRL_ENGINE_DIR)
    sys.path.append(CTRL_ENGINE_DIR)
except Exception as e:
    logger.info(e.message)


def skip_static_file(record):
    message = record.getMessage()
    if '/static/' in message:
        for key in ["img", 'js', 'css']:
            if key in message:
                return False
    elif '/favicon.ico' in message:
        return False
    return True



def skip_variable_does_not_exist(record):
    if record.exc_info:
        exc_type, exc_value = record.exc_info[:2]
        # print "exc_type: ", exc_type, "exc_value: ", str(exc_value), "isinstance:", isinstance(exc_value, VariableDoesNotExist)
        message = str(exc_value)
        if isinstance(exc_value, VariableDoesNotExist):
            if message.find('Failed lookup for key') >= 0:
                return False
                # for k in ['RegexURLResolver']:
                #     if message.find(k) >= 0:
                #         pass
    else:
        trivial_keyword = ['favicon']
        message = record.getMessage()
        if message.find('Not Found') >= 0:
            for k in trivial_keyword:  # 필터링할 키워드가 포함되어 있는지 검사
                if message.find(k) >= 0:
                    return False
    return True


LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        },
        'skip_variable_does_not_exist': {
            '()': 'django.utils.log.CallbackFilter',
            'callback': skip_variable_does_not_exist
        },
        'skip_static_file': {
            '()': 'django.utils.log.CallbackFilter',
            'callback': skip_static_file
        }
    },
    'formatters': {
        'file_format': {
            'format': '[%(levelname)s|%(pathname)s:%(lineno)s] %(asctime)s > %(message)s',
            'datefmt': '%d/%b/%Y %H:%M:%S'
        },
        'console_format': {
            'format': '[%(levelname)s|%(filename)s:%(lineno)s] %(asctime)s > %(message)s'
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filters': ['skip_variable_does_not_exist', 'skip_static_file'],
            'filename': LOG_FILE,
            'when': 'D',
            'interval': 1,
            'formatter': 'file_format',
            'backupCount': 10,
            # 'maxBytes': 104857600,
        },
        'console': {
            'level': LOG_LEVEL.upper(),
            'filters': ['skip_variable_does_not_exist', 'skip_static_file'],
            'class': 'logging.StreamHandler',
            'formatter': 'console_format',
        }
    },
    'loggers': {
        'django': {
            'handlers': ["file"],
            'level': 'DEBUG',
            'propagate': False,
        },
        'myapp.myLogger': {
            'handlers': ['file', "console"],
            'level': 'DEBUG',
            'propagate': False,
        },
        'apscheduler': {
            'handlers': ['file', "console"],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
    # 'handlers': {
    #     'logfile': {
    #         'class': 'logging.handlers.WatchedFileHandler',
    #         'filename': LOG_FILE
    #     },
    # },
    # 'loggers': {
    #     'django': {
    #         'handlers': ['logfile'],
    #         'level': LOG_LEVEL,
    #         'propagate': False,
    #     },
        # Your own app-this assumes all your logger names start with "myapp."
        # 'timeline': {
        #     'handlers': ['logfile'],
        #     'level': LOG_LEVEL,
        #     'propagate': False
        # },
    # }
}

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'igr&cm-&13^8mp5+!8%@@61xw8h*f3d#w56m^$efh!ubzq*_gn'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
# DEBUG = False

# ALLOWED_HOSTS = []
ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = (
    # 'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'sdsecgui.apps.SdsecguiConfig',
)

MIDDLEWARE_CLASSES = (
    # default handler
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # coustom exception handler
    'sdsecgui.error_handlers.HandleUnauthorizedExceptionMiddleware',
)

ROOT_URLCONF = 'sdsec.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['sdsecgui.templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sdsec.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'ko-KR'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LANGUAGES = [('ko', _('한국어')), ('en', _('영어')), ]
LOCALE_PATHS = (os.path.join(BASE_DIR, 'locale'), )

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

# STATIC_URL = '/static/'
STATIC_URL = '/static/'
STATIC_DIR = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [
    STATIC_DIR,
]
STATIC_ROOT = os.path.join(BASE_DIR, '.static_root')
# 세션시간 초
SESSION_COOKIE_AGE = 1 * 24 * 3600