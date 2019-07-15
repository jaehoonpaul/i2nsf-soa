# _*_ coding:utf-8 _*_
import json

from django.http import JsonResponse, Http404
from django.shortcuts import render, redirect

from sdsec.settings import config
from sdsecgui.tools.openstack_restapi import CinderRestAPI, KeystoneRestAPI, GlanceRestAPI


def get_volume_list(request):
    # logger.info("get_volume_list")
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    cinder = CinderRestAPI(auth_url, token)
    keystone = KeystoneRestAPI(auth_url, token)
    result_volume_list = cinder.get_volume_detail_list()
    if result_volume_list.get("success"):
        volume_list = result_volume_list["success"].get("volumes")
        for volume in volume_list:
            result_project = keystone.get_project(volume.get("os-vol-tenant-attr:tenant_id"))
            if result_project.get("success"):
                project = result_project["success"].get("project")
                volume["project_name"] = project.get("name")
            volume["host"] = volume.get("os-vol-host-attr:host")
    else:
        volume_list = result_volume_list
        volume_list["error"]["message"] = volume_list["error"]["message"].replace("<br /><br />\n \n\n", "")
    # TODO: soam sync delete
    try:
        soam_sync = bool(config.get("SETTINGS", "PORTAL_SYNC") == "True")
    except Exception as e:
        soam_sync = False
    return render(request, 'admin/volumes/index.html', {'volume_list': volume_list, "sync": soam_sync})


def get_volume_by_id(request, volume_id):
    # logger.info("get_volume_by_id")
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    if not token:
        return redirect("/dashboard/domains/?next=/dashboard/admin/volumes/" + volume_id)
    cinder = CinderRestAPI(auth_url, token)
    keystone = KeystoneRestAPI(auth_url, token)
    result_volume = cinder.get_volume_by_id(volume_id)
    volume = result_volume.get("success").get("volume")
    result_project = keystone.get_project(volume.get("os-vol-tenant-attr:tenant_id"))
    if result_project.get("success"):
        project = result_project["success"].get("project")
        volume["project_name"] = project.get("name")
    volume["host"] = volume.get("os-vol-host-attr:host")
    volume["type"] = volume.get("volume_type")
    return render(request, 'admin/volumes/info.html', {'volume': volume})


def create_volume(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    cinder = CinderRestAPI(auth_url, token)
    if request.method == 'POST' and request.is_ajax():
        data = json.loads(request.POST.get("data"))
        result = cinder.create_volume(data)
    elif request.method == 'GET':
        glance = GlanceRestAPI(auth_url, token)
        result_volume_types = cinder.get_volume_type_list()
        result_images = glance.get_image_list()
        result = {}
        if result_volume_types.get("success"):
            result["success"] = {
                "volume_types": result_volume_types["success"].get("volume_types")
            }
        else:
            result["error"] = {
                "volume_types": result_volume_types.get("error")
            }
        if result_images.get("success"):
            if result.get("success") is None:
                result["success"] = {}
            result["success"]["images"] = result_images["success"].get("images")
        else:
            if result.get("error") is None:
                result["error"] = {}
            result["error"]["images"] = result_images.get("error")

    else:
        result = {}

    return JsonResponse(result)


def delete_volume(request, volume_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    cinder = CinderRestAPI(auth_url, token)
    if request.method == 'POST' and request.is_ajax():
        result = cinder.delete_volume(volume_id)
        if result.get("error") is None:
            result = {"success": ""}
        return JsonResponse(result)
    else:
        raise Http404()


def sync_modal(request, volume_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    cinder = CinderRestAPI(auth_url, token)
    result = cinder.get_volume_by_id(volume_id)
    return render(request, 'admin/sync_modal.html', {'data': result["success"]["volume"]})


def sync(request, volume_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    service_id = request.POST.get("service_id")
    cinder = CinderRestAPI(auth_url, token)
    try:
        from sdsecgui.db.soa_db_connector import SOAManagerDBConnector
        m_conn = SOAManagerDBConnector.getInstance()
        m_conn.insert_volume(auth_url, cinder, service_id, volume_id)
        result = True
    except Exception as e:
        from sdsec.settings import logger
        logger.debug(e.message)
        result = False
    return JsonResponse({"result": result})
