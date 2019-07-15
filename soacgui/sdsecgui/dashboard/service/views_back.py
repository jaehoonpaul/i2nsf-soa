# _*_ coding:utf-8 _*_
import json
import os

import sys
from ConfigParser import ConfigParser

import logging
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect
# from sdsecgui.tools.command import login, get_image_list, get_volume_list, get_flavor_list



logger = logging.getLogger("myapp.myLogger")

# try:
#     from ctrlengine import ControllerEngine
# except:
#     from sdsecgui.dashboard.skeletonLib import ControllerEngine
# from sdsecgui.dashboard.skeletonLib import ControllerEngine


def getServiceDetailAndLinkList(token, domain_name, project_name, user_name, service_id):
    logger.info("detailServicePOST")
    control = ControllerEngine()
    service_detail = control.get_service(token, domain_name, project_name, user_name, service_id=service_id)

    linkList = control.get_map(service_id)
    return service_detail, linkList

# @login_required(login_url='/dashboard')
def listService(request):
    if request.is_ajax() and request.method == 'POST':
        logger.info("listService_ajax")
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        control = ControllerEngine()
        service_list = control.get_service_list(token, domain_name, project_name, user_name)
        logger.info("listService_ajax_end")
        return JsonResponse(service_list)
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service")
        logger.info("listService_end")
        if request.GET.get("error_msg_list"):
            error_msg_list = request.GET.get("error_msg_list")
            return render(request, 'service/index.html', {"error_msg_list":error_msg_list})
        return render(request, 'service/index.html', {})

def newService(request):
    if request.is_ajax() and request.method == 'POST':
        logger.info("newServicePOST")
        control = ControllerEngine()
        token = request.session.get("passToken")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        user_name = request.session.get("user_name")

        logger.info("newServicePOST_end_getpublic_network")
        try:
            result = control.getNetworkList(token, domain_name, project_name, user_name)
        except:
            logger.warning("get public_network fail")
            return JsonResponse({'service': {}})

        else:
            if result.get("success"):
                public_network = filter(lambda network: network["router:external"], result["success"]["networks"])
                return JsonResponse({'success': {"service_detail":{}}, "public_network": public_network})
            else:
                return JsonResponse(result)

    else:
        logger.info("newService_end")
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/new_service")
        return render(request, 'service/info.html', {})

def suspendService(request, service_id):
    logger.info("suspend_service")
    control = ControllerEngine()
    token = request.session.get("passToken")
    user_name = request.session.get("user_name")
    domain_name = request.session.get("domain_name")
    project_name = request.session.get("project_name")
    result = control.suspendService(token, domain_name, project_name, user_name, service_id)
    return redirect("/dashboard/service")

def resumeService(request, service_id):
    logger.info("resume_service")
    control = ControllerEngine()
    token = request.session.get("passToken")
    user_name = request.session.get("user_name")
    domain_name = request.session.get("domain_name")
    project_name = request.session.get("project_name")
    result = control.resumeService(token, domain_name, project_name, user_name, service_id)
    return redirect("/dashboard/service")

def deleteService(request, service_id):
    logger.info("delete_service")
    control = ControllerEngine()
    token = request.session.get("passToken")
    user_name = request.session.get("user_name")
    domain_name = request.session.get("domain_name")
    project_name = request.session.get("project_name")
    result = control.deleteService(token, domain_name, project_name, user_name, service_id)
    # result = {"success":{"error_msg_list":{"a":"A", "b":"B", "c":"C"}}}
    if result.get("success"):
        return JsonResponse(result)
        # if result["success"].get("error_msg_list"):
            # error_list = json.dumps(result["success"]["error_msg_list"])
    #         return redirect("/dashboard/service/?error_msg_list=" + error_list)
    # return redirect("/dashboard/service")
    # from django.http import HttpResponseRedirect
    # from django.core.urlresolvers import reverse
    # return HttpResponseRedirect(reverse('service', args=(json.dumps(result["success"]["error_msg_list"]))))

def detailService(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        logger.info("detailServicePOST")
        control = ControllerEngine()
        token = request.session.get("passToken")
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        service_detail = control.get_service(token, domain_name, project_name, user_name, service_id=service_id)
        # linkList = []
        linkList = control.get_map(service_id)
        # service_detail, linkList = getServiceDetailAndLinkList(service_id)


        """
        print "=============service_detail==========="
        pprint.pprint(service_detail)
        print "========================================"
        """
        public_network = []
        logger.info("detailServicePOST_end_public_network")
        try:
            result = control.getNetworkList(token, domain_name, project_name, user_name)
        except:
            logger.warning("get public_network fail")
            return JsonResponse(service_detail)
        else:
            if result.get("success"):
                public_network = filter(lambda network: network["router:external"], result["success"]["networks"])
        if service_detail.get("success"):
            jsonDic = {"success":service_detail["success"], "links":linkList["success"]["map_data"]["links"], "public_network": public_network}
            # request.session["service_dic"] = jsonDic
            return JsonResponse(jsonDic)
        else:
            return JsonResponse(service_detail)
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/detail")
        logger.info("detailService_end")
        response = render(request, 'service/info.html', {})
        return response

def simpleService(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        logger.info("simpleServicePOST")
        control = ControllerEngine()
        serviceMap = control.get_map(service_id)
        logger.info(serviceMap)

        logger.info("simpleServicePOST_end")
        if serviceMap.get("success"):
            resourceList = serviceMap["success"]["map_data"]["resources"]
            linkList = serviceMap["success"]["map_data"]["links"]
            response = {
                "success":{
                    "resources":resourceList,
                    "links":linkList
                }
            }
            return JsonResponse(response)
        else:
            return JsonResponse(serviceMap)

def modifyService(request, service_id):
    logger.info("modify")
#     if request.is_ajax() and request.method == 'POST':
#         service_templates = request.POST.get("service_templates")
#         control = ControllerEngine()
#         token = control.get_token("admin", "http://192.168.10.6:35357/v2.0", "admin", "chiron")
#         control.createSampleServiceTemplate()
#         dataDic = {
#             "links":{
#                 {"source":"97df790a-gefse-gsefse-a4r", "target":"awefawef-aergabq4fafq34r-f4ra4r-a4r"}
#             }
#         }
#         tenant_name = ""
#         user_name = ""
#         control.create_map(dataDic)
#         result = control.create_service(token, tenant_name=tenant_name, user_name=user_name,
#                                service_template_list=service_templates, map_info=None)
#         return JsonResponse({ 'result' : result })



# resource 정보 얻기
def availabilityZone(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        user_name = request.session.get("user_name")
        control = ControllerEngine()
        result = control.getAvailabilityZone(token, domain_name, project_name, user_name)
        # result["success"]["detail"] = control.getAvailabilityZoneDetail(token, domain_name, project_name, user_name)
        return JsonResponse(result)


def imageList(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        user_name = request.session.get("user_name")
        image_list = []
        # sess = login(auth_url="http://129.254.173.151:5000/v3")
        # sess = login("admin", "chiron", "demo", "http://192.168.10.6/identity/v3", 'default')
        # resultImageList = get_image_list(sess)
        # image_list = get_image_list(auth_url, token)
        # for resultImage in resultImageList:
        #     image_list.append(resultImage.__original__)
        # return JsonResponse({"success":{"imageList": image_list}})

        control = ControllerEngine()
        resultImageList = control.getImageListwithDetail(token, domain_name, project_name, user_name)
        # if resultImageList.get("success"):
            # for resultImages in resultImageList["success"]["images"]:
            #     resultImage = control.getImageDetails(token, domain_name, project_name, user_name, resultImages.get("id"))
            #     if resultImage.get("success"):
            #         image_list.append(resultImage["success"]["image"])
            #     else:
            #         logger.info(resultImage)
        # else:
        #     logger.info(resultImageList)
        # return JsonResponse({"success":{"imageList": image_list}})
        return JsonResponse(resultImageList)



def volumeList(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        volume_list = []
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        ## sess = login("admin", "chiron", "demo", "http://192.168.10.6/identity/v3", 'default')
        resultVolumeList = []
        # TODO:
        # resultVolumeList = get_volume_list(sess)
        ## volume_list = get_volume_list(auth_url, token)
        for resultVolume in resultVolumeList:
            volume_list.append(resultVolume._info)
        return JsonResponse({"success":{"volume_list": volume_list}})

        # control = ControllerEngine()
        # resultVolumeList = control.showVolumeList(token, domain_name, project_name, user_name)

        # if resultVolumeList.get("success"):
        #     for resultVolumes in resultVolumeList["success"]["volumes"]:
        #         resultVolume = control.getVolumeDetails(token, domain_name, project_name, user_name,resultImages.get("id"))
        #         if resultVolume.get("success"):
        #             for resultVolume in resultVolume["success"]["volume"]:
        #                 resultVolume
        #                 volume_list.append()
        # return JsonResponse({"success":{"volume_list": volume_list}})


def flavorList(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        flavor_list = []
        # sess = login(auth_url="http://129.254.173.151:5000/v3")
        ## sess = login("admin", "chiron", "demo", "http://192.168.10.6/identity/v3", 'default')
        # resultFlavorList = get_flavor_list(sess)
        # flavor_list = get_flavor_list(auth_url, token)
        # for resultFlavor in resultFlavorList:
            # pprint.pprint(resultFlavor._info)
        #     flavor_list.append(resultFlavor._info)
        # return JsonResponse({"success":{"flavor_list": flavor_list}})

        control = ControllerEngine()
        resultFlavorList = control.getFlavorListwithDetail(token, domain_name, project_name, user_name)

        # if resultFlavorList.get("success"):
        #     for resultFlavors in resultFlavorList["success"]["flavors"]:
        #         resultFlavor = control.getFlavorDetails(token, domain_name, project_name, user_name, resultFlavors.get("id"))
        #         if resultFlavor.get("success"):
        #             flavor_list.append(resultFlavor["success"]["flavor"])
        #         else:
        #             logger.info(resultFlavor)
        # else:
        #     logger.info(resultFlavorList)
        # return JsonResponse({"success":{"flavor_list": flavor_list}})
        return JsonResponse(resultFlavorList)

def getResourceData(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        control = ControllerEngine()

        resource_type = request.POST.get("resource_type")
        resource_id = request.POST.get("resource_id")
        result = control.showResource(token, domain_name, project_name, user_name, resource_type, resource_id)
        # if resource_type == "SERVER" and result.get("success"):
        #     resultFlavor = control.getFlavorDetails(token, domain_name, project_name, user_name, result["success"]["server"]["flavor"]["id"])
        #     if resultFlavor.get("success"):
        #         result["success"]["server"]["flavor"]["added_data"] = resultFlavor["success"]["flavor"]
        #     else:
        #         logger.info(resultFlavor)
        #
        #     resultImage = control.getImageDetails(token, domain_name, project_name, user_name, result["success"]["server"]["image"]["id"])
        #     if resultImage.get("success"):
        #         result["success"]["server"]["image"]["added_data"] = resultImage["success"]["image"]
        #     else:
        #         logger.info(resultImage)
        # else:
        #     logger.info("showResource(" + resource_type + ")")
        #     logger.info(result)
        return JsonResponse(result)

def getConsoleURL(request):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        control = ControllerEngine()

        vm_id = request.POST.get("vm_id")
        result = control.getVncConsole(token, domain_name, project_name, user_name, vm_id)
        return JsonResponse(result)

def createService(request):
    if request.is_ajax() and request.method == 'POST':
        service_template = json.loads(request.POST.get("service_templates"))
        dataDic = json.loads(request.POST.get("mapData"))
        logger.info(dataDic)
        control = ControllerEngine()
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        result = control.createService(token, domain_name, project_name, user_name, service_template)

        if result.get("success"):
            result["success"]["createMap"] = control.create_map(result["success"]["service_id"], json.dumps(dataDic).replace('"', '\\"'))
        return JsonResponse(result)


def listChaining(request, service_id):
    if request.method == 'POST':
        jsonString = request.POST.get("jsonData")
        # service_detail = json.loads(jsonString)
        service_detail = jsonString
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/chaining")
        return render(request, 'service/chaining.html', {"service_detail":service_detail})
    else:
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

        token = request.session.get('passToken')
        domain_name = request.session.get('domain_name')
        project_name = request.session.get('project_name')
        user_name = request.session.get('user_name')

        resource_type = request.POST.get("resource_type")
        resource_id = request.POST.get("resource_id")

        sfc_list = [
            {
                "sfc_id": "id1",
                "sfc_name" : "SFC01-01ABCD",
                "sfc_status": "CREATED",
                "fc_list": [
                    {"name": "FC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     },
                    {"name": "FC2",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf2",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf3",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf22",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf23",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    },
                    {
                        "name": "SFG3",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf22",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf23",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    }
                ]
            },
            {
                "sfc_id": "id2",
                "sfc_name": "sfc02",
                "sfc_status": "PAUSED",
                "fc_list": [
                    {"name": "AFC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     },
                    {"name": "FC2",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf2",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    }
                ]
            },
            {
                "sfc_id": "id3",
                "sfc_name": "sfc03",
                "sfc_status": "RESUMED",
                "fc_list": [
                    {"name": "AFC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "ROUTER",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     },
                    {"name": "FC2",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf2",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf3",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf22",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    }
                ]
            },
            {
                "sfc_id": "id4",
                "sfc_name": "sfc04",
                "sfc_status": "DELETED",
                "fc_list": [
                    {"name": "AFC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    }
                ]
            }
        ]

        #del
        return JsonResponse({'success':{'list': sfc_list}})

        #rel
        controll = ControllerEngine()
        result = controll.listSFC(token, domain_name, project_name, user_name, service_id)
        return JsonResponse(result)



def createChaining(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")

        # print "~~~~~~~~~~~~~~~"
        # print sfc_name
        # print sfc_desc

        # sess = login(auth_url="http://129.254.173.151:5000/v3")
        # sess = login(user_name, auth_url="http://129.254.173.151:5000/v3")
        # sess = login("admin", "chiron", "demo", "http://192.168.10.6:35357/v3")

        controll = ControllerEngine()
        # token = controll.get_token("admin", "http://192.168.10.6:35357/v2.0", "admin", "chiron")
        # token = controll.get_token()
        # token = request.POST.get("passToken")
        # service_detail = controll.get_service(token, "admin", "admin", service_id=service_id)
        service_detail = controll.get_service(token, domain_name, project_name, user_name, service_id=service_id)

        public_network = []

        linkList = controll.get_map(service_id)
        result = controll.getNetworkList(token, domain_name, project_name, user_name)
        if result.get("success"):
            public_network = filter(lambda network: network["router:external"], result["success"]["networks"])
        # TODO: 아래와 같이 ["links"]를 추가시켜야 합니다.
        return JsonResponse({'success' : {'service': service_detail["success"], "links": linkList["success"]["map_data"]["links"], "public_network": public_network}})
        # return JsonResponse({'success' : {'service': service_detail["success"], "links": linkList["success"]["map_data"], "public_network": public_network}})
    elif request.method == 'POST':
        jsonData = request.POST.get("jsonData")
        return render(request, 'service/create_chaining.html', {'service_detail':jsonData})
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/chaining/create")
        return render(request, 'service/create_chaining.html', {})

def createChainingDev(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        user_name = request.session.get("user_name")
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")

        # pprint.pprint(request.POST)

        # sess = login("admin", "chiron", "demo", "http://192.168.10.6:35357/v3")

        controll = ControllerEngine()
        # token = controll.get_token("admin", "http://192.168.10.6:35357/v2.0", "admin", "chiron")
        # token = controll.get_token()
        # token = request.POST.get("passToken")
        # service_detail = controll.get_service(token, "admin", "admin", service_id=service_id)
        service_detail = controll.get_service(token, domain_name, project_name, user_name, service_id=service_id)

        ## dev
        service_detail = {
            'description': '2 vms and 1 net',
            'name': 'template-2vm_1net',
            'network_list': [
                {
                    "network_id": "4",
                    'alloc_pools_list': [
                        {
                            'end': '10.11.15.254',
                            'start': '10.11.15.2'
                        }
                    ],
                    'cidr': '10.11.15.0/24',
                    'dns_list': ['8.8.8.8'],
                    'enable_dhcp': True,
                    'gateway_ip': '10.11.15.1',
                    'ip_version': 4,
                    'network_name': 'private_net-1'
                }
            ],
            'region_id': 'region-0001',
            'vm_list': [
                {
                    "vm_id": "1",
                    'admin_pass': '1111',
                    'flavor': 'm1.tiny',
                    'image': 'cirros-0.3.4',
                    'key_name': 'my_key',
                    'vm_name': 'server_1',
                    'vnic_list': [
                        {
                            'name': 'test-vnic-01',
                            'public_ip': False,
                            'tenant_net': 'private_net-1'
                        }
                    ]
                },
                {
                    "vm_id": "2",
                    'admin_pass': '1111',
                    'flavor': 'm1.tiny',
                    'image': 'cirros-0.3.4',
                    'key_name': 'my_key',
                    'vm_name': 'server_2',
                    'vnic_list': [
                        {
                            'name': 'test-vnic-02',
                            'public_ip': False,
                            'tenant_net': 'private_net-1'
                        }
                    ]
                }
            ],
            'vrouter_list': [
                {
                    "vrouter_id": "3",
                    'external_net': 'ETRI_NET',
                    'vrouter_name': 'router-1',
                    'tenant_net_list': ['private_subnet-1']
                }
            ],
            'volume_list': [
                {
                    "volume_id": "6",
                    'volume_name': "test_volume-1"
                },
                {
                    "volume_id": "7",
                    'volume_name': "test_volume-2"
                }
            ]
        }

        linkList = [
            {"source":"private_net-1", "target":"server_1"},
            {"source":"private_net-1", "target":"server_2"},
            {"source":"server_1", "target":"test_volume-1"},
            {"source":"server_2", "target":"test_volume-2"},
            {"source":"ETRI_NET","target":"router-1"},
            {"source":"router-1", "target":"private_net-1"},
        ]
        # TODO: 가데이터 입니다. 위에는 지워도 됩니다.
        service_detail, linkList = getServiceDetailAndLinkList(token, domain_name, project_name, user_name, service_id)
        public_network = []

        ## rel
        #linkList = controll.get_map(service_id)
        # result = controll.get_network_list(token, domain_name, project_name, user_name)
        # if result.get("success"):
        #     public_network = filter(lambda network: network["router:external"], result["success"]["networks"])

#dev        # {'success':{'id':"",'chain_id':""}}
        return JsonResponse({'success':{'service': {"service_detail":service_detail["success"]["service_detail"]}, "links": linkList["success"]["map_data"], "public_network": public_network}})
#rel
        # return JsonResponse({'service': service_detail["success"], 'instance_list':instanceList, "links": linkList["success"]["map_data"], "public_network": public_network})
    else:

        sfc_name = request.POST.get("sfc_name")
        sfc_desc = request.POST.get("sfc_desc")

        # print "~~~~~~~~~~~~~~~"
        # print sfc_name
        # print sfc_desc

        return render(request, 'service/create_chaining.html', {'sfc_name':sfc_name, 'sfc_desc':sfc_desc})

def execChaining(request, service_id):
    if request.is_ajax() and request.method == 'POST':

        token = request.session.get('passToken')
        domain_name = request.session.get('domain_name')
        project_name = request.session.get('project_name')
        user_name = request.session.get('user_name')
        order = request.POST.get("order")
        sfc_id = request.POST.get("sfc_id")

        controll = ControllerEngine()
        result = {}

        # pprint.pprint(order)

        if order == 'pause':
            result = controll.pauseSFC(token, domain_name, project_name, user_name, sfc_id)
        elif order == 'resume':
            result = controll.resumeSFC(token, domain_name, project_name, user_name, sfc_id)
        elif order == 'delete':
            result = controll.deleteSFC(token, domain_name, project_name, user_name, sfc_id)

        # print "=====exec result========"
        # pprint.pprint(result)

        return JsonResponse(result)


def saveChaining(request, service_id):
    if request.is_ajax() and request.method == 'POST':
        fc_list = json.loads(request.POST.get("fc_list"))
        sfg_list = json.loads(request.POST.get("sfg_list"))
        sfc_name = request.POST.get("sfc_name");
        sfc_desc = request.POST.get("sfc_desc");

        # print sfc_name;

        token = request.session.get('passToken')
        domain_name = request.session.get('domain_name')
        project_name = request.session.get('project_name')
        user_name = request.session.get('user_name')
        # print "=========================createSFC()=============================="
        # print "=========================fc_list=============================="
        # pprint.pprint(fc_list)
        # print "=========================sfg_list=============================="
        # pprint.pprint(sfg_list)


        controll = ControllerEngine()
        result = controll.createSFC(token, domain_name, project_name, user_name, service_id, sfc_name, sfc_desc, fc_list, sfg_list)
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

        token = request.session.get('passToken')
        domain_name = request.session.get('domain_name')
        project_name = request.session.get('project_name')
        user_name = request.session.get('user_name')

        resource_type = request.POST.get("resource_type")
        resource_id = request.POST.get("resource_id")

        p_list = {
            'success': {
                'ports': [
                    {
                        'allowed_address_pairs': [],
                        'extra_dhcp_opts': [],
                        'updated_at': '2016-11-22T12:57:44',
                        'device_owner': 'network:router_gateway',
                        'port_security_enabled': False,
                        'binding:profile': {},
                        'fixed_ips': [{
                            'subnet_id': 'ede9da8a-fa4c-483e-acb7-d1d149b63bdd',
                            'ip_address': '129.254.173.171'
                        }],
                        'id': '259a1caf-f622-4ee8-bda6-43a84e2f0b13',
                        'security_groups': [],
                        'binding:vif_details': {},
                        'binding:vif_type': 'binding_failed',
                        'mac_address': 'fa:16:3e:8e:1f:49',
                        'status': 'DOWN',
                        'binding:host_id': 'mitaka2-controller',
                        'description': '',
                        'device_id': '2b50b009-8569-4052-9bbc-00f09ee53bd8',
                        'name': '',
                        'admin_state_up': True,
                        'network_id': '563c4b8a-a49a-47a2-b73c-ec66be29915f',
                        'dns_name': None,
                        'created_at': '2016-11-22T12:57:44',
                        'binding:vnic_type': 'normal',
                        'tenant_id': ''
                    }, {
                        'allowed_address_pairs': [],
                        'extra_dhcp_opts': [],
                        'updated_at': '2016-11-22T12:57:54',
                        'device_owner': 'network:router_interface',
                        'port_security_enabled': False,
                        'binding:profile': {},
                        'fixed_ips': [{
                            'subnet_id': '907a6e1e-44e8-4bec-8db5-2fd44d337f5d',
                            'ip_address': '10.15.30.1'
                        }],
                        'id': 'e48e021e-7499-400c-972a-e93a57a5eb7b',
                        'security_groups': [],
                        'binding:vif_details': {
                            'port_filter': True,
                            'ovs_hybrid_plug': True
                        },
                        'binding:vif_type': 'ovs',
                        'mac_address': 'fa:16:3e:57:b1:75',
                        'status': 'ACTIVE',
                        'binding:host_id': 'mitaka2-controller',
                        'description': '',
                        'device_id': '2b50b009-8569-4052-9bbc-00f09ee53bd8',
                        'name': '',
                        'admin_state_up': True,
                        'network_id': '97798b24-b2b1-4803-b4ac-035977229c53',
                        'dns_name': None,
                        'created_at': '2016-11-22T12:57:47',
                        'binding:vnic_type': 'normal',
                        'tenant_id': '21c56ffc1ba94d8180b6c792b4b3fa79'
                    }, {
                        'allowed_address_pairs': [],
                        'extra_dhcp_opts': [],
                        'updated_at': '2016-11-22T12:57:54',
                        'device_owner': 'network:router_interface',
                        'port_security_enabled': False,
                        'binding:profile': {},
                        'fixed_ips': [{
                            'subnet_id': '9e78b4fa-0788-4ee6-b2b4-b67b80e43739',
                            'ip_address': '10.15.29.1'
                        }],
                        'id': 'ea363483-869b-45d3-be4b-398f1a840307',
                        'security_groups': [],
                        'binding:vif_details': {
                            'port_filter': True,
                            'ovs_hybrid_plug': True
                        },
                        'binding:vif_type': 'ovs',
                        'mac_address': 'fa:16:3e:4b:da:8d',
                        'status': 'ACTIVE',
                        'binding:host_id': 'mitaka2-controller',
                        'description': '',
                        'device_id': '2b50b009-8569-4052-9bbc-00f09ee53bd8',
                        'name': '',
                        'admin_state_up': True,
                        'network_id': 'c7fd1fcc-e845-4994-814d-03ad5371b13e',
                        'dns_name': None,
                        'created_at': '2016-11-22T12:57:48',
                        'binding:vnic_type': 'normal',
                        'tenant_id': '21c56ffc1ba94d8180b6c792b4b3fa79'
                    }]
            }
        }

        #dev
        return JsonResponse(p_list)

        # rel
        controll = ControllerEngine()
        result = controll.getPortList(token, domain_name, project_name, user_name, resource_type, resource_id)
        # print "= getPortList() resource_type = " + resource_type + " resource_id = " + resource_id
        # print "= result"
        # pprint.pprint(result)
        return JsonResponse(result)
