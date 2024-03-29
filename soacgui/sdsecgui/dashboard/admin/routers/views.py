# _*_ coding:utf-8 _*_

from django.shortcuts import render, redirect
from django.http import JsonResponse
import json

from django.views.decorators.csrf import csrf_exempt

from sdsecgui.tools.openstack_restapi import NeutronRestAPI, KeystoneRestAPI
from sdsecgui.tools.keystone_exception import Unauthorized


@csrf_exempt
def get_router_list(request):
    # logger.info("get_router_list")
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    if request.method == 'POST':
        try:
            keystone = KeystoneRestAPI(auth_url, token)
            result_projects = keystone.get_project_list()
            projects = []
            if result_projects.get("success"):
                projects = result_projects["success"].get("projects")

            neutron = NeutronRestAPI(auth_url, token)
            result = neutron.getRouterList()
            if result.get("success"):
                for router in result["success"].get("routers"):
                    if router.get("tenant_id"):
                        for project in projects:
                            if project.get("id") == router.get("tenant_id"):
                                router["project_name"] = project.get("name")
        except Unauthorized as e:
            result = {"error": {"title": e.message, "message": e.details, "code": 401}}
        return JsonResponse(result)
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/admin/routers")
        return render(request, 'admin/routers/index.html', {})


@csrf_exempt  # TODO: 삭제될예정
def get_interface_list_in_router(request, router_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    if request.method == 'POST':
        neutron = NeutronRestAPI(auth_url, token)
        ports = neutron.get_port_list({"device_id": router_id}).get("success").get("ports")
        # interfaceList = get_interface_list_in_router(router_id)
        return JsonResponse({"success": {'interface': ports}})


def get_metadata_for_create_router(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")

    if request.method == 'POST':
        try:
            neutron = NeutronRestAPI(auth_url, token)
            q = {"router:external": True}
            fields = ["id", "name"]
            result = neutron.get_network_list(q, fields)
        except Unauthorized as e:
            result = {"error": {"title": e.message, "message": e.details, "code": 401}}
        return JsonResponse(result)


def create_router(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")

    if request.method == 'POST':
        data = json.loads(request.POST.get("data"))
        try:
            neutron = NeutronRestAPI(auth_url, token)
            result = neutron.createRouter(data)
        except Unauthorized as e:
            result = {"error": {"title": e.message, "message": e.details, "code": 401}}
        return JsonResponse(result)


@csrf_exempt
def action_router(request, router_id, action):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")

    if request.method == 'POST':
        try:
            neutron = NeutronRestAPI(auth_url, token)
            if action == "detail":
                result = neutron.getRouter(router_id)
                interfaces = neutron.get_port_list({"device_id": router_id})
                if interfaces.get("success") and result.get("success"):
                    result["success"]["router"]["interfaces"] = interfaces.get("success").get("ports")

            elif action == "update":
                data = json.loads(request.POST.get("data"))
                result = neutron.updateRouter(router_id, data)

            elif action == "delete":
                result = neutron.deleteRouter(router_id)

            else:
                result = {"error": {"title": "Not Found", "message": "지원하지 않는 기능입니다.", "code": 404}}

        except Unauthorized as e:
            result = {"error": {"title": e.message, "message": e.details, "code": 401}}
        return JsonResponse(result)
    else:
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/admin/routers/" + router_id + "/detail")

        if action == "detail":
            return render(request, 'admin/routers/info.html', {'router_id': router_id})


def sync_modal(request, router_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    neutron = NeutronRestAPI(auth_url, token)
    result = neutron.getRouter(router_id)
    interfaces = neutron.get_port_list({"device_id": router_id})
    if interfaces.get("success") and result.get("success"):
        result["success"]["router"]["interfaces"] = interfaces.get("success").get("ports")
    return render(request, 'admin/sync_modal.html', {'data': result["success"]["router"]})


def sync(request, router_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    neutron = NeutronRestAPI(auth_url, token)
    service_id = request.POST.get("service_id")
    from sdsecgui.db.soa_db_connector import SOAManagerDBConnector
    try:
        m_conn = SOAManagerDBConnector.getInstance()
        m_conn.insert_router(auth_url, neutron, service_id, router_id)
        result = True
    except Exception as e:
        from sdsec.settings import logger
        logger.debug(e.message)
        result = False
    return JsonResponse({"result": result})
