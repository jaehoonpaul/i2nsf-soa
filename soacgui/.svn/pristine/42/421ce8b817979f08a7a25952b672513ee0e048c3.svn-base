# _*_ coding:utf-8 _*_

from django.shortcuts import render, redirect
from django.http import JsonResponse

from sdsecgui.tools.openstack_restapi import GlanceRestAPI, KeystoneRestAPI, NovaRestAPI
from sdsecgui.cmodels.image import Image

# set_log_dir()
# logger = get_logger("myapp.myLogger")
from sdsecgui.tools.keystone_exception import Unauthorized


def get_image_list(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    glance = GlanceRestAPI(auth_url, token)
    keystone = KeystoneRestAPI(auth_url, token)

    result_image_list = glance.get_image_list()
    image_list = result_image_list.get("success").get("images")
    for image in image_list:
        project = keystone.get_project(image.get("owner"))
        if project.get("success"):
            image["project_name"] = project.get("success").get("project").get("name")

    if request.is_ajax() and request.method == 'POST':
        return JsonResponse({"success": {"imageList": [image for image in image_list]}})
    else:
        return render(request, 'admin/images/index.html', {'imageList': image_list})


def get_image_by_id(request, image_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    if not token:
        return redirect("/dashboard/domains/?next=/dashboard/admin/images/" + image_id)
    glance = GlanceRestAPI(auth_url, token)

    image = glance.get_image(image_id).get("success")
    return render(request, 'admin/images/info.html', {'image': image})


def get_hypervisors(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    data = {}
    nova = NovaRestAPI(auth_url, token)
    hypervisors = nova.get_hypervisor_detail_list()
    hosts = nova.get_compute_service({"binary": "nova-compute"})
    if hypervisors.get("success"):
        data["hypervisors"] = hypervisors["success"].get("hypervisors")
    if hosts.get("success"):
        data["services"] = hosts["success"].get("services")

    return render(request, 'admin/hypervisors/index.html', data)
