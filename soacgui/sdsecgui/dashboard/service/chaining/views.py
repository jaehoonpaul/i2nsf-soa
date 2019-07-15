# _*_ coding:utf-8 _*_
import ast
import json
import os

import sys
from ConfigParser import ConfigParser

import logging
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
# from sdsecgui.tools.command import login, get_image_list, get_volume_list, get_flavor_list


from sdsecgui.tools.openstack_restapi import NeutronRestAPI
from sdsecgui.tools.ctrlengine import ControlEngine

logger = logging.getLogger("myapp.myLogger")


def listChaining(request, service_id):
    if request.method == 'POST':
        json_string = request.POST.get("jsonData")
        service_detail = json_string
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/chaining")
        return render(request, 'service/chaining.html', {"service_detail":service_detail})
    else:
        """
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")

        # controll = ControllerEngine()
        # result = controll.get_sfc_list(token, domain_name, project_name, user_name, service_id)
        # print "=========================listChaining result=" + service_id + "========================"
        # pprint.pprint(result)
        """
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/chaining")
        return render(request, 'service/chaining.html')
        # return render(request, 'service/chaining.html', {'result':json.dumps(result)})
        # return render(request, 'service/chaining.html', {'result':test})


def listChainingBack(request, service_id):
    token = request.session.get('passToken')
    user_name = request.session.get("user_name")
    domain_name = request.session.get("domain_name")
    project_name = request.session.get("project_name")

    # controll = ControllerEngine()
    # result = controll.get_sfc_list(token, domain_name, project_name, user_name, service_id)
    # print "=========================listChaining result=" + service_id + "========================"
    # pprint.pprint(result)

    token = request.session.get('passToken')
    if not token:
        return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/chaining")
    return render(request, 'service/chaining.html')
    # return render(request, 'service/chaining.html', {'result':json.dumps(result)})
    # return render(request, 'service/chaining.html', {'result':test})

def getChainingList(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        ctrl_header = request.session.get('ctrl_header')

        control = ControlEngine(ctrl_header)
        result = control.get_sfc_list(service_id)
        return JsonResponse(result)

def createChaining(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        ctrl_header = request.session.get('ctrl_header')

        control = ControlEngine(ctrl_header)
        service_detail = control.get_service(service_id)
        response = {"success": {}, "error_msg_list": []}
        if service_detail.get("success"):
            response["success"]["service"] = service_detail["success"]
        else:
            response["error_msg_list"].append(service_detail.get("error"))

        map_data = control.get_map(service_id)
        if map_data.get("success"):
            response["success"]["links"] = map_data["success"]["map_link_list"].get("links")
            response["success"]["asLinks"] = map_data["success"]["map_link_list"].get("asLinks")
            response["success"]["resources"] = map_data["success"]["map_link_list"].get("resources")
        else:
            response["error_msg_list"].append(map_data.get("error"))

        neutron = NeutronRestAPI(auth_url, token)
        public_network = neutron.get_external_network({"router:external": True})
        if public_network.get("success"):
            response["success"]["public_network"] = public_network["success"].get("networks")
        else:
            response["error_msg_list"].append(public_network.get("error"))

        return JsonResponse(response)

    elif request.method == 'POST':
        jsonData = request.POST.get("jsonData")
        return render(request, 'service/create_chaining.html', {'service_detail': jsonData})
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/chaining/create")
        return render(request, 'service/create_chaining.html', {})

def createChainingDev(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        ctrl_header = request.session.get("ctrl_header")

        control = ControlEngine(ctrl_header)
        neutron = NeutronRestAPI(auth_url, token)

        service_detail, map_data = control.get_service_detail_and_link_list(service_id)

        # rel
        map_data = control.get_map(service_id)
        public_network = neutron.get_external_network({"router:external": True})

        #dev        # {'success':{'id':"",'chain_id':""}}
        return JsonResponse({'success': {'service': {"service_detail": service_detail["success"]["service_detail"]},
                                         "links": map_data["success"]["map_link_list"], "public_network": public_network}})
#rel
    # return JsonResponse({'service': service_detail["success"], 'instance_list':instanceList, "links": map_data["success"]["map_link_list"], "public_network": public_network})
    else:

        sfc_name = request.POST.get("sfc_name")
        sfc_desc = request.POST.get("sfc_desc")

        # print "~~~~~~~~~~~~~~~"
        # print sfc_name
        # print sfc_desc

        return render(request, 'service/create_chaining.html', {'sfc_name':sfc_name, 'sfc_desc':sfc_desc})

def execChaining(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        ctrl_header = request.session.get('ctrl_header')
        order = request.POST.get("order")
        sfc_id = request.POST.get("sfc_id")

        control = ControlEngine(ctrl_header)
        result = {}

        if order == 'pause':
            result = control.pause_sfc(service_id, sfc_id)
        elif order == 'resume':
            result = control.resume_sfc(service_id, sfc_id)
        elif order == 'delete':
            result = control.delete_sfc(service_id, sfc_id)

        return JsonResponse(result)


def saveChaining(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        sfc_name = request.POST.get("sfc_name")
        sfc_desc = request.POST.get("sfc_desc")
        fc_list = json.loads(request.POST.get("fc_list"))
        sfg_list = json.loads(request.POST.get("sfg_list"))

        token = request.session.get('passToken')
        domain_name = request.session.get('domain_name')
        project_name = request.session.get('project_name')
        user_name = request.session.get('user_name')
        ctrl_header = request.session.get('ctrl_header')
        # print "=========================createSFC()=============================="
        # print "=========================fc_list=============================="
        # pprint.pprint(fc_list)
        # print "=========================sfg_list=============================="
        # pprint.pprint(sfg_list)

        control = ControlEngine(ctrl_header)
        sfc_template = {}
        sfc_template["service_function_group_list"] = sfg_list
        sfc_template["flow_classifier_list"] = fc_list
        sfc_template["sfc_name"] = sfc_name
        sfc_template["sfc_desc"] = sfc_desc
        result = control.create_sfc(service_id, sfc_template)
        if result.get("NeutronError"):
            result = {"error": {"message": result["NeutronError"]["message"], "title": result["NeutronError"]["type"]}}
        # print "=========================result=============================="
        # pprint.pprint(result)
        # if result.get('success'):
            # result['success']['chain_id']
        # else:

        # {"error":{'message':""}}
        # {'success':{'id':"",'chain_id':""}}
        return JsonResponse(result)

def getPortList(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        resource_type = request.POST.get("resource_type")
        resource_id = request.POST.get("resource_id")
        ctrl_header = request.session.get("ctrl_header")

        control = ControlEngine(ctrl_header)
        result = control.get_port_list(resource_type, resource_id)
        return JsonResponse(result)


def redirectChaining(request, service_id):
    return redirect("/dashboard/service/" + service_id + "/chaining")
