# _*_ coding:utf-8 _*_
import json


import logging
import traceback

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import ugettext as _

# from sdsecgui.dashboard.skeletonLib import ControllerEngine
from sdsec.settings import config
from sdsecgui.tools.openstack_restapi import NeutronRestAPI, NovaRestAPI, GlanceRestAPI, CinderRestAPI, HeatRestAPI
from sdsecgui.db.db_connector import SOAControlDBConnector
from sdsecgui.tools.keystone_exception import Unauthorized
from sdsecgui.db.soac_query import *
from sdsecgui.tools.scheduler import Scheduler
from sdsecgui.db.soa_db_connector import SOAManagerDBConnector
from sdsecgui.db.soa_query import *

from sdsecgui.tools.ctrlengine import ControlEngine

logger = logging.getLogger("myapp.myLogger")


def getServerListInService(request, service_id):
    """
    해당 서비스의 서버 리스트
    :param request:
    :param service_id:
    :return:
    """
    control = ControlEngine(request.session.get("ctrl_header"))
    # control = ControllerEngine()  # TODO: debugging 용
    vm_list = control.get_service_vm(service_id)
    if vm_list.get("success"):

        auth_url = request.session.get("auth_url")
        token = request.session.get("passToken")
        stack_id = vm_list.get("success").get("stack_id")
        # stack_name = vm_list.get("success").get("service_detail").get("name")

        nova = NovaRestAPI(auth_url, token)
        result_servers = nova.get_server_detail_list(fields=["id", "name", "metadata"])
        if result_servers.get("success"):
            servers = [
                result_server
                for result_server in result_servers["success"].get("servers")
                if result_server.get("metadata") and result_server["metadata"].get("metering.stack") == stack_id
            ]
            for temp_server in servers:
                server = {
                    "vm_name": temp_server.get("name"),
                    "vm_id": temp_server.get("id"),
                    "addresses": [],
                }
                for network_name, network in temp_server.get("addresses").items():
                    for address in network:
                        server["addresses"].append(address.get("addr"))
                vm_list["success"]["vm_list"].append(server)
        else:
            vm_list = result_servers

        # heat = HeatRestAPI(auth_url, token)
        # result = heat.get_resource_in_stack(stack_name, stack_id, {"type": "OS::Heat::AutoScalingGroup"})
        # if result.get("success"):
        #     as_groups = result["success"].get("resources")
        #     nova = NovaRestAPI(auth_url, token)
        #     for as_group in as_groups:
        #         asg_stack_id = as_group.get("physical_resource_id")
        #         result = heat.find_server_in_autoscaling(asg_stack_id)
        #         if result.get("success"):
        #             asg_stack_resources = result["success"]["resources"]
        #             for asg_stack_resource in asg_stack_resources:
        #                 server_name = "." + asg_stack_resource.get("logical_resource_id") + "."
        #                 result_servers = nova.get_server_detail_list({"name": server_name})
        #                 if result_servers.get("success"):
        #                     servers = result_servers["success"].get("servers")
        #                     for temp_server in servers:
        #                         server = {
        #                             "vm_name": temp_server.get("name"),
        #                             "vm_id": temp_server.get("id"),
        #                             "addresses": [],
        #                         }
        #                         for network_name, network in temp_server.get("addresses").items():
        #                             for address in network:
        #                                 server["addresses"].append(address.get("addr"))
        #                         vm_list["success"]["vm_list"].append(server)

    return JsonResponse(vm_list, safe=False)


def get_all_service_list(request):
    """
    서비스 전체 조회 페이지
    :param request:
    :return:
    """
    user_name = request.session.get("user_name")
    token = request.session.get('passToken')
    ctrl_header = request.session.get('ctrl_header')
    control = ControlEngine(ctrl_header)
    logger.debug("user_name: {}\nctrl_header: {}".format(user_name, ctrl_header))
    if user_name == 'admin':
        logger.debug("true")
        result = control.get_all_service_list()
        logger.debug(result)
        if result.get("success"):
            result = result.get("success")

        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/all_service")
        return render(request, 'service/all_index.html', result)
    else:
        return redirect("/dashboard/service")


# @login_required(login_url='/dashboard')
@csrf_exempt
def list_service(request):
    """
    서비스 목록 페이지
    :param request:
    :return:
    """
    if request.method == 'POST':
        logger.info("listService_ajax")
        control = ControlEngine(request.session.get("ctrl_header"))
        # TODO: 알람을 위해 가데이터 받아오기
        # control = ControllerEngine()  # TODO: debugging 용
        service_list = control.get_service_list()
        logger.info("listService_ajax_end")
        return JsonResponse(service_list)
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service")
        logger.info("listService_end")
        if request.GET.get("error_msg_list"):
            error_msg_list = request.GET.get("error_msg_list")
            return render(request, 'service/index.html', {"error_msg_list": error_msg_list})
        return render(request, 'service/index.html', {})


def new_service(request):
    """
    서비스 생성 페이지
    :param request:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        logger.info("newServicePOST")
        token = request.session.get("passToken")
        auth_url = request.session.get("auth_url")

        logger.info("newServicePOST_end_getpublic_network")
        neutron = NeutronRestAPI(auth_url, token)
        result = neutron.get_network_list()
        if result.get("success"):
            public_network = filter(lambda network: network["router:external"], result["success"]["networks"])
            return JsonResponse({'success': {"service_detail": {}}, "public_network": public_network})
        else:
            return JsonResponse(result)

    else:
        logger.info("newService_end")
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/new_service")
        try:
            soam_sync = bool(config.get("SETTINGS", "PORTAL_SYNC") == "True")
        except Exception as e:
            soam_sync = False
        return render(request, 'service/info.html', {"sync": soam_sync})  # TODO: soam sync delete


def suspend_service(request, service_id):
    """
    서비스 일시정지
    :param request:
    :param service_id:
    :return:
    """
    logger.info("suspend_service")
    ctrl_header = request.session.get("ctrl_header")
    control = ControlEngine(ctrl_header)
    result = control.suspend_service(service_id)
    return redirect("/dashboard/service")


def resume_service(request, service_id):
    """
    서비스 재시작
    :param request:
    :param service_id:
    :return:
    """
    logger.info("resume_service")
    ctrl_header = request.session.get("ctrl_header")
    control = ControlEngine(ctrl_header)
    result = control.resume_service(service_id)
    return redirect("/dashboard/service")


def delete_service(request, service_id):
    """
    서비스 삭제
    :param request:
    :param service_id:
    :return:
    """
    logger.info("delete_service")
    ctrl_header = request.session.get("ctrl_header")
    control = ControlEngine(ctrl_header)
    result = control.delete_service(service_id)
    # result = {"success":{"error_msg_list":{"a":"A", "b":"B", "c":"C"}}}
    # if result.get("success"):
    #     관리포탈 동기화용
    #     conn = SOAControlDBConnector.getInstance()
    #
    #     params = (request.session.get("domain_name"), request.session.get("project_name"))
    #     if len(conn.select(SELECT_SOAC_PROJECT, params)) >= 1:
    #     params = (
    #         request.session.get("domain_name"),
    #         request.session.get("project_name"),
    #         service_id,
    #     )
    #     try:
    #         from pprint import pprint
    #         print "=============params============="
    #         pprint(params)
    #         delete_service = conn.delete(DELETE_SOAC_SERVICE, params)
    #         print "================result================ ", delete_service
    #         temp = {"success": {"message": "서비스삭제", "title": "성공"}}
    #     except Exception as e:
    #         temp = {"error": {"message": str(e), "title": "error"}}
    #     동기화용 끝
    return JsonResponse(result)
    #     if result["success"].get("error_msg_list"):
    #         error_list = json.dumps(result["success"]["error_msg_list"])
    #         return redirect("/dashboard/service/?error_msg_list=" + error_list)
    # return redirect("/dashboard/service")
    # from django.http import HttpResponseRedirect
    # from django.core.urlresolvers import reverse
    # return HttpResponseRedirect(reverse('service', args=(json.dumps(result["success"]["error_msg_list"]))))


@csrf_exempt
def detail_service(request, service_id):
    """
    서비스 상세조회
    :param request:
    :param service_id:
    :return:
    """
    token = request.session.get("passToken")
    auth_url = request.session.get("auth_url")
    if request.method == 'POST':
        logger.info("detailServicePOST")
        control = ControlEngine(request.session.get("ctrl_header"))
        # control = ControllerEngine()  # TODO: debugging 용
        service_detail, map_data = control.get_service_detail_and_link_list(service_id)

        public_network = []
        logger.info("detailServicePOST_end_public_network")
        try:
            neutron = NeutronRestAPI(auth_url, token)
            result = neutron.get_network_list({"router:external": True})
        except Exception as e:
            logger.warning("get public_network fail" + str(e))
            return JsonResponse(service_detail)
        else:
            if result.get("success"):
                public_network = filter(lambda network: network["router:external"], result["success"]["networks"])
        if service_detail.get("success"):
            # print service_detail["success"], map_data, public_network
            jsonDic = {"success": service_detail["success"], "links": {}, "security_types": {},
                       "public_network": public_network}

            template = control.get_template(service_id)
            if template.get("success"):
                user_template = template["success"].get("user_template")
                if user_template:
                    # print "user_template: {}\nservice_id: {}".format(user_template, service_id)
                    user_template["service_id"] = service_id
                    jsonDic["success"]["template"] = user_template
            else:
                jsonDic.get("success").get("service_detail").get("error_msg_list").push(template.get("error"))
            if map_data.get("success"):
                map_link_list = map_data["success"].get("map_link_list")
                if map_link_list:
                    jsonDic["links"] = map_link_list.get("links")
                    jsonDic["asLinks"] = map_link_list.get("asLinks")
                    jsonDic["security_types"] = map_link_list.get("security_types")
                    jsonDic["used_security_group_list"] = map_link_list.get("used_security_group_list")
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
    """
    간략한 서비스 정보
    :param request:
    :param service_id:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        logger.info("simpleServicePOST")
        control = ControlEngine(request.session.get("ctrl_header"))
        service_map = control.get_map(service_id)
        # logger.info(service_map)

        logger.info("simpleServicePOST_end")
        if service_map.get("success"):
            try:
                if service_map["success"].get("map_link_list"):
                    map_data = service_map["success"]["map_link_list"]
                    if type(map_data) == str or type(map_data) == unicode:
                        map_data = json.loads(map_data.replace('\\"', '"'))
                    resource_list = map_data.get("resources")
                    links = map_data.get("links")
                    as_links = map_data.get("asLinks")
                    used_security_group_list = map_data.get("used_security_group_list")
                    security_types = map_data.get("security_types")
                    response = {
                        "success": {
                            "resources": resource_list,
                            "links": links,
                            "as_links": as_links
                        }
                    }
                    if used_security_group_list:
                        response["used_security_group_list"] = used_security_group_list
                    if security_types:
                        response["security_types"] = security_types
                    return JsonResponse(response)
                else:
                    return JsonResponse({"error": {"message": service_id + u" 연결정보가 없습니다.", "response": service_map}})
            except Exception as e:
                return JsonResponse({"error": {"message": service_id + u" 연결정보가 올바르지 않습니다.", "response": service_map, "exception": e.message}})
        else:
            return JsonResponse(service_map)


def modifyService(request, service_id):
    """
    서비스 수정 페이지
    :param request:
    :param service_id:
    :return:
    """
    if request.method == 'POST':
        logger.info("detailServicePOST")
        control = ControlEngine(request.session.get("ctrl_header"))
        token = request.session.get("passToken")
        auth_url = request.session.get("auth_url")

        template = control.get_template(service_id)
        if template.get("success"):
            user_template = template["success"].get("user_template")
            user_template["service_id"] = service_id
            service_detail = {"success": {"service_detail": user_template}}
        else:
            service_detail = template
        map_data = control.get_map(service_id)

        public_network = []
        logger.info("detailServicePOST_end_public_network")
        try:
            neutron = NeutronRestAPI(auth_url, token)
            result = neutron.get_network_list()
        except:
            logger.warning("get public_network fail")
            return JsonResponse(service_detail)
        else:
            if result.get("success"):
                public_network = filter(lambda network: network["router:external"], result["success"]["networks"])

        if service_detail.get("success"):
            json_dic = {
                "success": service_detail["success"],
                "public_network": public_network
            }
            if map_data["success"].get("map_link_list"):
                links = map_data["success"]["map_link_list"].get("links")
                as_links = map_data["success"]["map_link_list"].get("asLinks")
                resources = map_data["success"]["map_link_list"].get("resources")
                security_types = map_data["success"]["map_link_list"].get("security_types")
                json_dic.update({
                    "links": links,
                    "asLinks": as_links,
                    "resources": resources,
                    "security_types": security_types
                })

            return JsonResponse(json_dic)
        else:
            return JsonResponse(service_detail)
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/service/" + service_id + "/detail")
        logger.info("detailService_end")
        response = render(request, 'service/info.html', {})
        return response


def updateService(request, service_id):
    """
    서비스 수정
    :param request:
    :param service_id:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        service_template = json.loads(request.POST.get("service_templates"))
        service_template["description"] = unicode(service_template.get("description"))
        dataDic = request.POST.get("mapData")
        # logger.info(dataDic)
        control = ControlEngine(request.session.get("ctrl_header"))
        result = control.update_service(service_template, service_id)

        if result.get("success"):
            # service_info = result["success"]
            result["success"]["update_map"] = control.update_map(service_id, dataDic.replace('\\', ''))
            # 관리포탈 동기화용
            # conn = SOAControlDBConnector.getInstance()

            # params = (request.session.get("domain_name"), request.session.get("project_name"))
            # if len(conn.select(SELECT_SOAC_PROJECT, params)) >= 1:
            #     params = (
            #         service_info.get("name"),
            #         service_info.get("status"),
            #         request.session.get("domain_name"),
            #         request.session.get("project_name"),
            #         service_id,
            #     )
            #     try:
            #         from pprint import pprint
            #         TODO: 관리포탈 전용
            #         print "=============params============="
            #         pprint(params)
            #         delete_service = conn.delete(DELETE_SOA_SERVICE, params)
            #         print "================result================ ", delete_service
            #         temp = {"success": {"message": "서비스삭제", "title": "성공"}}
            #     except Exception as e:
            #         temp = {"error": {"message": str(e), "title": "error"}}
            # 동기화용 끝
        return JsonResponse(result)


def availabilityZone(request):
    """
    availabilityZone 얻기
    :param request:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        user_name = request.session.get("user_name")
        auth_url = request.session.get("auth_url")
        try:
            nova = NovaRestAPI(auth_url, token)
            result = nova.get_availability_zone()
        except Unauthorized as e:
            result = {"error": {"title": e.message, "message": e.details, "code": 401}}
        # print result
        # result["success"]["detail"] = control.getAvailabilityZoneDetail(token, domain_name, project_name, user_name)
        return JsonResponse(result)


def imageList(request):
    """
    이미지 목록
    :param request:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        auth_url = request.session.get("auth_url")
        token = request.session.get("passToken")
        image_list = []
        # sess = login(auth_url="http://129.254.173.151:5000/v3")
        # sess = login("admin", "chiron", "demo", "http://192.168.10.6/identity/v3", 'default')
        # resultImageList = get_image_list(sess)
        # image_list = get_image_list(auth_url, token)
        # for resultImage in resultImageList:
        #     image_list.append(resultImage.__original__)
        # return JsonResponse({"success":{"imageList": image_list}})

        glance = GlanceRestAPI(auth_url, token)
        resultImageList = glance.get_image_list()
        # if resultImageList.get("success"):
        #     for resultImages in resultImageList["success"]["images"]:
        #         resultImage = control.getImageDetails(token, domain_name, project_name, user_name, resultImages.get("id"))
        #         if resultImage.get("success"):
        #             image_list.append(resultImage["success"]["image"])
        #         else:
        #             logger.info(resultImage)
        # else:
        #     logger.info(resultImageList)
        # return JsonResponse({"success":{"imageList": image_list}})
        return JsonResponse(resultImageList)


def volume_list(request):
    """
    볼륨 목록
    :param request:
    :return:
    """
    auth_url = request.session.get("auth_url")
    token = request.session.get("passToken")
    project_id = request.session.get("project_id")
    if request.is_ajax() and request.method == 'POST':
        cinder = CinderRestAPI(auth_url, token)
        result = cinder.get_volume_detail_list()
        if result.get("success"):
            volumes = result["success"].get("volumes")
        else:
            volumes = []

        return JsonResponse({"success": {"volume_list": volumes}})

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


def flavor_list(request):
    """
    가상머신 사양 목록
    :param request:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")

        nova = NovaRestAPI(auth_url, token)
        resultFlavorList = nova.get_flavor_detail_list()

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


def loadRightPopHtml(request):
    """
    우측 팝업 페이지
    :param request:
    :return:
    """
    rtype = request.GET.get("type")
    data = request.GET.get("data")
    if data:
        data = json.loads(data)
        if data.has_key("alloc_pools"):
            alloc_pools_str = ""
            for idx, alloc_pool in enumerate(data.get("alloc_pools")):
                if idx != 0:
                    alloc_pools_str += "\n"
                alloc_pools_str += alloc_pool["start"] + ", " + alloc_pool["end"]
            data["alloc_pools"] = alloc_pools_str
        if data.has_key("host_route"):
            host_route_str = ""
            for idx, host_route in enumerate(data.get("host_route")):
                if idx != 0:
                    host_route_str += "\n"
                host_route_str += host_route["destination_cidr"] + ", " + host_route["nexthop"]
            data["host_route"] = host_route_str

    return render(request, 'service/include/right_pop_' + rtype + '.html', {"data": data})


def get_resource_data(request):
    """
    각 자원 조회
    :param request:
    :return:
    """
    # if request.is_ajax() and request.method == 'POST':
    ctrl_header = request.session.get("ctrl_header")
    auth_url = request.session.get("auth_url")
    token = request.session.get("passToken")
    control = ControlEngine(ctrl_header)

    resource_type = request.GET.get("resource_type")
    resource_id = request.GET.get("resource_id")

    if resource_type == "AUTOSCALING" or resource_type == "LB" or resource_type == "AS_SERVER":
        data = json.loads(request.GET.get("data"))
        return render(request, 'service/include/right_pop_' + resource_type.lower() + '_info.html', {"data": data})
    else:
        result = control.get_resource(resource_type, resource_id)
        if result.get("success"):
            if resource_type == "SERVER":
                if result["success"]["server"].get("flavor"):
                    nova = NovaRestAPI(auth_url, token)
                    result_flavor = nova.get_flavor(result["success"]["server"]["flavor"]["id"])
                    if result_flavor.get("success"):
                        result["success"]["server"]["flavor"]["added_data"] = result_flavor["success"]["flavor"]
                    else:
                        logger.error(result_flavor)
                if result["success"]["server"].get("image"):
                    glance = GlanceRestAPI(auth_url, token)
                    result_image = glance.get_image(result["success"]["server"]["image"]["id"])
                    if result_image.get("success"):
                        result["success"]["server"]["image"]["added_data"] = result_image["success"]
                    else:
                        logger.error(result_image)
            else:
                logger.info("showResource(" + resource_type + ")")
                # logger.info(result)
            return render(request, 'service/include/right_pop_' + resource_type.lower() + '_info.html', result.get("success"))
        else:
            return JsonResponse(result)


def get_console_url(request):
    """
    가상머신 vnc console 주소 얻기
    :param request:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        ctrl_header = request.session.get("ctrl_header")
        control = ControlEngine(ctrl_header)

        vm_id = request.POST.get("vm_id")
        result = control.get_vnc_console(vm_id)
        return JsonResponse(result)


def synchronize_soam(request, service_info, data_dic):
    # 관리포탈 동기화용
    conn = SOAControlDBConnector.getInstance()

    user_name = request.session.get("user_name")
    # 도메인명, 프로젝트 아이디, 서비스 아이디, 서비스명, 서비스 상태,
    # 동기화 상태{동기화전 I, 동기화중 S, 동기화완료 C, 동기화실패 F}, 동기화 날짜
    auth_url = request.session.get("auth_url")
    project_id = request.session.get("project_id")
    params = (auth_url, project_id, service_info.get("service_id"), service_info.get("name"),
              service_info.get("status"), user_name, user_name)

    logger.debug("[soac db insert service for sync]")
    # conn.insert(INSERT_SOAC_SERVICE, params)  # sync를 위해 soacDB에 넣기

    control = ControlEngine(request.session.get("ctrl_header"))
    s_result = control.get_service(service_info.get("service_id"))
    if s_result.get("success"):
        # used_security_group_list 상세정보 조회, security_group_list 생성
        select_security_groups = conn.select(SELECT_SECURITY_RESOURCE_GROUP_LIST)

        security_groups = data_dic.get("used_security_group_list")
        security_group_list = []
        for security_group in security_groups:
            for select_security_group in select_security_groups:
                if select_security_group.get("security_id") == security_group.get("security_id"):
                    select_security_group["security_type"] = security_group.get("security_type")
                    security_group_list.append(select_security_group)

        m_conn = SOAManagerDBConnector.getInstance()
        # security_group
        # TODO: seccurity_type => 관리포탈에서 코드조회후 코드로 넣을것
        # TODO: manufacture_icon
        # TODO: 보안장비가 이미 등록되 있을시 무시
        for security_group in security_group_list:
            params = (security_group.get("security_type"), security_group.get("security_name"),
                      security_group.get("security_icon"), security_group.get("manufacture_name"),
                      security_group.get("manufacture_icon"), security_group.get("software_version"),
                      security_group.get("description"))

            logger.debug("[soam db insert equipment]")
            m_conn.insert(INSERT_SOAM_EQUIPMENT, params)

        params = (auth_url, project_id, service_info.get("service_id"), service_info.get("name"),
                  service_info.get("service_description"))
        logger.debug("[soam db insert service]")
        m_conn.insert_service(params, data_dic)

        scheduler = Scheduler()

        def check_service_status():
            logger.debug("[check service status]")
            create_status = False
            # 서비스 상태 확인
            result = control.get_service(service_info.get("service_id"))
            if result.get("success"):
                try:
                    service_template = result["success"].get("service_detail")

                    # 생성중이면 1분뒤 다시 확인
                    if service_template.get("status") == "CREATE_IN_PROGRESS":
                        logger.debug("[wait CREATE_IN_PROGRESS]")
                        return
                    # 생성 완료면 자원 데이터 저장
                    elif service_template.get("status") == "CREATE_COMPLETE":
                        logger.debug("[soam db insert resources]")
                        params = (auth_url, project_id, service_info.get("service_id"), service_info.get("name"),
                                  service_info.get("service_description"))
                        m_conn.insert_service_resource(params, service_template, request)

                    # 생성 실패면
                    else:
                        pass

                    # 생성 완료 or 실패 시 soac db 수정
                    logger.debug("[soac db update service for sync complete]")
                    # params = (service_template.get("name"), service_template.get("status"), "C", user_name, auth_url,
                    #           request.session.get("project_name"), service_info.get("service_id"))
                    # conn.update(UPDATE_SOAC_SERVICE, params)
                    scheduler.kill_scheduler("check_service")
                except Exception as e:
                    error_str = """
                    Title: {}
                    Traceback: {}
                    """.format(e.message, traceback.format_exc().strip())
                    logger.error(error_str)
                    scheduler.kill_scheduler("check_service")
            else:
                scheduler.kill_scheduler("check_service")

        logger.debug("[wait CREATE_IN_PROGRESS]")
        scheduler.schedule_interval(check_service_status, "check_service", seconds=30)
    # 동기화용 끝


def create_service(request):
    """
    서비스 생성
    :param request:
    :return:
    """
    if request.is_ajax() and request.method == 'POST':
        logger.info("create_service")
        service_template = json.loads(request.POST.get("service_templates"))
        service_template["description"] = unicode(service_template.get("description"))
        data_dic = json.loads(request.POST.get("mapData"))
        control = ControlEngine(request.session.get("ctrl_header"))
        result = control.create_service(service_template)

        if result.get("success"):
            logger.info("create_map")
            result["success"]["createMap"] = control.create_map(result["success"]["service_id"], json.dumps(data_dic))
            service_info = result["success"]
            # 관리포탈 동기화용
            if request.POST.get("soam_synchronize") == "true":
                try:
                    logger.debug("[synchronize ...]")
                    synchronize_soam(request, service_info, data_dic)
                except Exception as e:
                    error_str = """
                    Title: {}
                    Traceback: {}
                    """.format(e.message, traceback.format_exc().strip())
                    logger.debug("[synchronize fail]\n{}".format(error_str))
                    temp = {"error": {"message": str(e), "title": "error"}}
        return JsonResponse(result)


def get_resource_in_stack(request):
    """
    type
    OS::Heat::AutoScalingGroup =        (AutoScalingGroup)
    OS::Heat::ScalingPolicy =           (ScalingPolicy)
    OS::Ceilometer::Alarm =             (Alarm)
    OS::Neutron::LBaaS::LoadBalancer =  (LoadBalancer)
    OS::Neutron::LBaaS::Listener =      (Listener)
    OS::Neutron::LBaaS::Pool =          (Pool)
    OS::Neutron::LBaaS::HealthMonitor = (HealthMonitor)
    OS::Neutron::Router =               (Router)
    OS::Neutron::RouterInterface =      (RouterInterface)
    OS::Neutron::Net =                  (Network)
    OS::Neutron::Subnet =               (Subnet)
    OS::Neutron::FloatingIP =           (FloatingIP)
    """
    if request.is_ajax() and request.method == 'POST':
        auth_url = request.session.get("auth_url")
        token = request.session.get("passToken")
        stack_id = request.POST.get("stack_id")
        stack_name = request.POST.get("name")
        resource_type = request.POST.get("resource_type")
        heat = HeatRestAPI(auth_url, token)
        result = heat.get_resource_in_stack(stack_name, stack_id, resource_type)
        return JsonResponse(result)


def get_as_group(request):
    if request.is_ajax() and request.method == 'POST':
        auth_url = request.session.get("auth_url")
        token = request.session.get("passToken")
        stack_id = request.POST.get("stack_id")
        stack_name = request.POST.get("name")
        resource_type = {"type": "OS::Heat::AutoScalingGroup"}
        heat = HeatRestAPI(auth_url, token)
        result = heat.get_resource_in_stack(stack_name, stack_id, resource_type)
        return JsonResponse(result)


def get_vm_in_asg(request):
    if request.is_ajax() and request.method == 'POST':
        auth_url = request.session.get("auth_url")
        token = request.session.get("passToken")
        stack_id = request.POST.get("stack_id")
        volume_search = request.POST.get("volume_search")
        # stack_name = request.POST.get("name")
        nova = NovaRestAPI(auth_url, token)
        cinder = CinderRestAPI(auth_url, token)
        result_servers = nova.get_server_detail_list(fields=["id", "name", "metadata"])
        result_volumes = {}
        if volume_search:
            result_volumes = cinder.get_volume_detail_list()
        result = {"success": {"servers": [], "volumes": []}}
        if result_servers.get("success"):
            for result_server in result_servers["success"].get("servers"):
                if result_server.get("metadata") and result_server["metadata"].get("metering.stack") == stack_id:
                    if volume_search and result_volumes.get("success"):
                        for result_volume in result_volumes["success"].get("volumes"):
                            for attachment in result_volume.get("attachments"):
                                if attachment.get("server_id") == result_server.get("id"):
                                    volumes = [result_volume]
                                    result["success"]["volumes"].extend(volumes)
                    servers = [result_server]
                    result["success"]["servers"].extend(servers)
        else:
            result = result_servers
        # heat = HeatRestAPI(auth_url, token)
        # result = heat.get_resource_in_stack(stack_name, stack_id, {"type": "OS::Heat::AutoScalingGroup"})
        # if result.get("success"):
        #     as_groups = result["success"].get("resources")
        #     for as_group in as_groups:
        #         asg_stack_id = as_group.get("physical_resource_id")
        #         result = heat.find_server_in_autoscaling(asg_stack_id)
        #         if result.get("success"):
        #             asg_stack_resources = result["success"]["resources"]
        #             result = {"success": {"servers": [], "error_msg_list": []}}
        #             for asg_stack_resource in asg_stack_resources:
        #                 server_name = "." + asg_stack_resource.get("logical_resource_id") + "."
        #                 result_servers = nova.get_server_detail_list({"name": server_name})
        #                 if result_servers.get("success"):
        #                     servers = result_servers["success"].get("servers")
        #                     for server in servers:
        #                         server["asg_name"] = asg_stack_resource.get("logical_resource_id")
        #                     result["success"]["servers"].extend(servers)
        #                 else:
        #                     result["success"]["error_msg_list"].append(result_servers.get("error"))
        return JsonResponse(result)

def modal_fw_rule_list(request):
    return render(request, 'service/popup/modal_fw_rule_list.html', {})

def modal_fw_rule_create(request):
    return render(request, 'service/popup/modal_fw_rule_create.html', {})

