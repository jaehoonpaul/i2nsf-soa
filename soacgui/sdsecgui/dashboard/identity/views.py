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


def main(request):
    return redirect("/dashboard/identity/projects")


def get_domain_list(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        auth_url = request.session.get("auth_url")
        try:
            keystone = KeystoneRestAPI(auth_url, token)
            result = keystone.get_domain_list()
        except Unauthorized as e:
            request.session["error"] = {"title":e.message, "message":e.details}
            return JsonResponse({"error": {"title": e.message, "message": e.details, "code": 401}})
        if result.get("success"):
            domains = result.get("success").get("domains")
            removeDomain = None
            for domain in domains:
                if domain.get("name") == domain_name:
                    domain["click"] = True
                if domain.get("name") == "heat":
                    removeDomain = domain
            if removeDomain:
                domains.remove(removeDomain)

        if result.get("error"):
            if result["error"].get("code") == 403:
                result["success"] = {"domains": [{"name": domain_name, "id": domain_name, "click": True}]}

        return JsonResponse(result)
