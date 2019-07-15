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

logger = logging.getLogger("myapp.myLogger")


def get_role_list(request):
    if request.is_ajax() and request.method == 'POST':
        pass
    else:
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        keystone = KeystoneRestAPI(auth_url, token)
        result = keystone.get_role_list()
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/identity/roles")
        if result.get("success"):
            return render(request, 'identity/roles/index.html', result.get("success"))
        else:
            return render(request, 'identity/roles/index.html', result)


def get_role_by_id(request, role_id):
    if request.is_ajax() and request.method == 'POST':
        pass
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/identity/roles/" + role_id + "/detail")
        auth_url = request.session.get("auth_url")
        keystone = KeystoneRestAPI(auth_url, token)
        result = keystone.get_role(role_id)
        if result.get("success"):
            return render(request, 'identity/roles/info.html', result.get("success"))
        else:
            return render(request, 'identity/roles/info.html', result)


def create_role(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        role = json.loads(request.POST.get("role"))
        data = {
            "role": {
                "name": role.get("name"),
            }
        }
        keystone = KeystoneRestAPI(auth_url, token)
        result = keystone.create_role(data)
        return JsonResponse(result)


def update_role(request, role_id):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        role = json.loads(request.POST.get("role"))
        data = {
            "role": {
                "name": role.get("name"),
            }
        }
        keystone = KeystoneRestAPI(auth_url, token)
        result = keystone.update_role(role_id, data)
        return JsonResponse(result)


def delete_role(request, role_id):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        keystone = KeystoneRestAPI(auth_url, token)
        result = keystone.delete_role(role_id)
        return JsonResponse(result)

def role_modal(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    modal_title = request.GET.get("modal_title")
    role_id = request.GET.get("role_id")
    domain_id = request.session.get("domain_id")
    domain_name = request.session.get("domain_name")
    data = {
        "modal_title": modal_title,
        "input_domain_id": domain_id,
        "input_domain_name": domain_name,
    }
    if role_id:
        data["role_id"] = role_id
        keystone = KeystoneRestAPI(auth_url, token)
        result = keystone.get_role(role_id)
        if result.get("success"):
            role = result["success"].get("role")
            data["role_name"] = role.get("name")
    return render(request, 'identity/roles/modal.html', data)