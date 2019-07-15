# _*_ coding:utf-8 _*_
import json
import os
import time
from ConfigParser import ConfigParser
from datetime import datetime

import sys

import logging
from django.http import JsonResponse
from django.shortcuts import render, redirect

from sdsecgui.tools.openstack_restapi import KeystoneRestAPI
from sdsecgui.tools.keystone_exception import Unauthorized

logger = logging.getLogger("myapp.myLogger")


def bad_request(request):
    auth_url = request.session.get("auth_url")
    token = request.session.get("token")
    if auth_url is None:
        return redirect("/dashboard")
    return render(request, "error/400.html", {})


def permission_denied(request):
    auth_url = request.session.get("auth_url")
    token = request.session.get("token")
    if auth_url is None:
        return redirect("/dashboard")
    return render(request, "error/403.html", {})


def page_not_found(request):
    auth_url = request.session.get("auth_url")
    token = request.session.get("token")
    if auth_url is None:
        return redirect("/dashboard")
    return render(request, "error/404.html", {})


def server_error(request, exception):
    next_url = request.path
    auth_url = request.session.get("auth_url")
    token = request.session.get("token")
    if auth_url is None:
        return redirect("/dashboard/domains?next=" + next_url)
    return render(request, "error/500.html", {})
