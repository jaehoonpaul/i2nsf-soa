# _*_ coding:utf-8 _*_
import ast

from django.shortcuts import render, redirect
from django.http import JsonResponse
import json

from django.views.decorators.csrf import csrf_exempt

from sdsecgui.tools.openstack_restapi import NeutronRestAPI, KeystoneRestAPI
from sdsecgui.cmodels.network import Port

# set_log_dir()
# logger = get_logger("myapp.myLogger")
from sdsecgui.tools.keystone_exception import Unauthorized


def createPort(request):
    token = request.session.get('passToken')
    domain_name = request.session.get("domain_name")
    project_name = request.session.get("project_name")
    auth_url = request.session.get("auth_url")

    if request.method == 'POST':
        data = json.loads(request.POST.get("data"))
        try:
            neutron = NeutronRestAPI(auth_url, token)
            result = neutron.createPort(data)
        except Unauthorized as e:
            result = {"error": {"title": e.message, "message": e.details, "code": 401}}
        return JsonResponse(result)


def actionPort(request, port_id, action):
    token = request.session.get('passToken')
    domain_name = request.session.get("domain_name")
    project_name = request.session.get("project_name")
    auth_url = request.session.get("auth_url")

    if request.method == 'POST':
        try:
            neutron = NeutronRestAPI(auth_url, token)
            if action == "detail":
                result = neutron.getPort(port_id)

            elif action == "update":
                data = json.loads(request.POST.get("data"))
                result = neutron.updatePort(port_id, data)

            elif action == "delete":
                result = neutron.delete_port(port_id)

            else:
                result = {"error": {"title": "Not Found", "message": "지원하지 않는 기능입니다.", "code": 404}}

        except Unauthorized as e:
            result = {"error": {"title": e.message, "message": e.details, "code": 401}}
        return JsonResponse(result)
    else:
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/admin/networks/ports/" + port_id)

        if action == "detail":
            return render(request, 'admin/networks/ports/info.html', {'port_id': port_id})


def ports_modal(request):
    auth_url = request.session.get("auth_url")
    token = request.session.get("passToken")
    port_id = request.GET.get("port_id")
    data = {"modal_title": request.GET.get("modal_title")}
    if port_id:
        neutron = NeutronRestAPI(auth_url, token)
        result = neutron.getPort(port_id)
        if result.get("success"):
            data["port"] = result["success"].get("port")

    return render(request, 'admin/networks/ports/modal.html', data)
