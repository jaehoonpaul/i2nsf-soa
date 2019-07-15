# _*_ coding:utf-8 _*_
import json
import logging
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from sdsec.settings import config
from sdsecgui.tools.openstack_restapi import GlanceRestAPI, KeystoneRestAPI, NovaRestAPI, CinderRestAPI, NeutronRestAPI

from sdsecgui.tools.keystone_exception import Unauthorized

logger = logging.getLogger("myapp.myLogger")


@csrf_exempt
def get_instance_list(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    nova = NovaRestAPI(auth_url, token)
    glance = GlanceRestAPI(auth_url, token)
    keystone = KeystoneRestAPI(auth_url, token)
    power_state_list = ["NoState", "Running", "", "Paused", "Shutdown", "", "Crashed", "Suspended"]
    result_instance_list = nova.get_server_detail_list({"all_tenants": 1})
    instance_list = result_instance_list.get("success").get("servers")

    result_flavors = nova.get_flavor_detail_list()
    flavors = []
    if result_flavors.get("success"):
        flavors = result_flavors["success"].get("flavors")

    result_images = glance.get_image_list()
    images = []
    if result_images.get("success"):
        images = result_images["success"].get("images")

    result_projects = keystone.get_project_list()
    projects = []
    if result_projects.get("success"):
        projects = result_projects["success"].get("projects")

    for instance in instance_list:
        if instance.get("flavor"):
            for flavor in flavors:
                if flavor.get("id") == instance["flavor"].get("id"):
                    instance["flavor"]["name"] = flavor.get("name")
                    instance["flavor"]["id"] = flavor.get("id")
                    instance["flavor"]["vcpus"] = flavor.get("vcpus")
                    instance["flavor"]["ram"] = flavor.get("ram")
                    instance["flavor"]["disk"] = flavor.get("disk")

        if instance.get("image"):
            for image in images:
                if image.get("id") == instance["image"].get("id"):
                    instance["image"] = image

        if instance.get("tenant_id"):
            for project in projects:
                if project.get("id") == instance.get("tenant_id"):
                    instance["project_name"] = project.get("name")

        instance["host_name"] = instance.get("OS-EXT-SRV-ATTR:host")
        instance["task_state"] = instance.get("OS-EXT-STS:task_state")
        instance["power_state"] = power_state_list[instance.get("OS-EXT-STS:power_state")]
        instance["networks"] = {}
        for key in instance.get("addresses").keys():
            instance["networks"][key] = []
            for address in instance.get("addresses").get(key):
                instance["networks"][key].append(address["addr"])

    if request.method == 'POST':
        result = {"success": {'instanceList': instance_list}}
    else:
        result = {"success": {'instanceList': instance_list}}
    if request.method == 'POST':
        return JsonResponse(result)
    else:
        try:
            soam_sync = bool(config.get("SETTINGS", "PORTAL_SYNC") == "True")
        except Exception as e:
            soam_sync = False
        result["sync"] = soam_sync  # TODO: soam sync delete
        return render(request, 'admin/instances/index.html', result)


@csrf_exempt
def retrieve_instance_by_id(request, server_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")

    if not token:
        if request.method == 'POST':
            result = {"error": {'message': "토큰이 존재하지 않습니다.", 'code': 401, 'title': 'Unauthorized'}}
            return JsonResponse(result)
        else:
            return redirect("/dashboard/domains/?next=/dashboard/admin/instances/" + server_id + "/detail")

    try:
        # ["0", "Running", "1", "2", "3", "4"]
        power_state_list = ["NoState", "Running", "Paused", "Shutdown", "Crashed", "Suspended"]
        nova = NovaRestAPI(auth_url, token)
        glance = GlanceRestAPI(auth_url, token)
        keystone = KeystoneRestAPI(auth_url, token)
        result_instance = nova.get_server(server_id)
        instance = result_instance.get("success").get("server")
        result_flavor = nova.get_flavor(instance.get("flavor").get("id"))
        flavor = result_flavor.get("success").get("flavor")
        if instance.get("image"):
            result_image = glance.get_image(instance.get("image").get("id"))
            instance["image"]["name"] = result_image.get("success").get("name")
        instance["project_name"] = keystone.get_project(instance.get("tenant_id")).get("success").get("project").get("name")
        instance["host_name"] = instance.get("OS-EXT-SRV-ATTR:host")
        instance["flavor"]["name"] = flavor.get("name")
        instance["flavor"]["id"] = flavor.get("id")
        instance["flavor"]["vcpus"] = flavor.get("vcpus")
        instance["flavor"]["ram"] = flavor.get("ram")
        instance["flavor"]["disk"] = flavor.get("disk")
        instance["task_state"] = instance.get("OS-EXT-STS:task_state")
        instance["power_state"] = power_state_list[instance.get("OS-EXT-STS:power_state")]
        instance["networks"] = {}
        for key in instance.get("addresses").keys():
            instance["networks"][key] = []
            for address in instance.get("addresses").get(key):
                instance["networks"][key].append(address["addr"])
        # resultInstance = nova.get_server(instance_id)
        # resultFlavors = nova.get_flavor(resultInstance.flavor["id"])
        # if resultInstance.image:
        #     resultImage = glance.get_image(resultInstance.image.get("id"))
        # else:
        #     resultImage = {}
        # instance = Instance()
        # instance.setDic(resultInstance.__dict__, resultFlavors, resultImage)
        # instance.project_name = keystone.get_project(token, instance.tenant_id).name

        if request.method == 'POST':
            result = {"success": {"instance": instance}}
        else:
            result = {"instance": instance}  # TODO: 고쳐야함 index.html에 맞게
    except Unauthorized as e:
        logger.error(e)
        result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
        if request.method == 'GET':
            return redirect("/dashboard/domains")

    if request.method == 'POST':
        return JsonResponse(result)
    else:
        return render(request, 'admin/instances/info.html', result)


def create_server(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    nova = NovaRestAPI(auth_url, token)
    if request.method == 'POST':
        data = json.loads(request.POST.get("data"))
        result = nova.create_server(data)
        return JsonResponse(result)


def update_server(request, server_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    nova = NovaRestAPI(auth_url, token)
    if request.method == 'POST':
        data = json.loads(request.POST.get("data"))
        result = nova.update_server(server_id, data)
        return JsonResponse(result)


def delete_server(request, server_id):
    if request.method == 'POST':
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        nova = NovaRestAPI(auth_url, token)
        result = nova.delete_server(server_id)
        return JsonResponse(result)


def action_server(request, server_id):
    if request.method == 'POST':
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        data = json.loads(request.POST.get("data"))
        auth_url = request.session.get("auth_url")
        description = request.session.get("description")
        try:
            nova = NovaRestAPI(auth_url, token)
        except Unauthorized as e:
            request.session["error"] = {"title": e.message, "message": e.details, "code": 401}
            return redirect(
                "/dashboard/login/?auth_url=" + auth_url + "&domain_name=" + domain_name + "&description=" + description)
        result = nova.action_server(server_id, data)
        if type(result) == str:
            result = {"success": "reload"}
        elif result.get("success"):
            if result["success"].get("console"):
                console_url = result["success"]["console"].get("url")
                if "controller" in console_url:
                    console_url = console_url.replace("http://controller", auth_url.replace(":35357/v3", ""))
                    result["success"]["console"]["url"] = console_url
            else:
                result = {"success": "reload"}
        return JsonResponse(result)


def create_modal(request):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    modal_title = request.GET.get("modal_title")
    instance_id = request.GET.get("instance_id")
    data = {
        "modal_title": modal_title,
    }
    nova = NovaRestAPI(auth_url, token)
    neutron = NeutronRestAPI(auth_url, token)
    glance = GlanceRestAPI(auth_url, token)

    availability_zone = nova.get_availability_zone()
    if availability_zone.get("success"):
        data["availabilityZoneInfo"] = availability_zone["success"].get("availabilityZoneInfo")

    images = glance.get_image_list()
    if images.get("success"):
        data["images"] = images["success"].get("images")

    flavors = nova.get_flavor_detail_list()
    if flavors.get("success"):
        data["flavors"] = flavors["success"].get("flavors")

    networks = neutron.get_network_list()
    if networks.get("success"):
        data["networks"] = networks["success"].get("networks")
        subnets = neutron.get_subnet_list()
        if subnets.get("success"):  # network["subnets"]에 id만 있어 해당 아이디의 subnet을 찾아 name으로 대체
            subnet_list = subnets["success"].get("subnets")
            for network in data["networks"]:
                network["subnets"] = [
                    subnet.get("name")
                    for subnet_id in network["subnets"]
                    for subnet in subnet_list
                    if subnet.get("id") == subnet_id
                ]

    ports = neutron.get_port_list()
    if ports.get("success"):
        data["ports"] = ports["success"].get("ports")

    if instance_id:  # 수정 시
        data["instance_id"] = instance_id
        result = nova.get_server(instance_id)
        if result.get("success"):
            server = result["success"].get("server")
            data["server"] = server

    return render(request, 'admin/instances/modal.html', data)


def update_modal(request, server_id):
    server_name = request.GET.get("server_name")
    modal_title = request.GET.get("modal_title")
    data = {"server_id": server_id, "server_name": server_name, "modal_title": modal_title}
    return render(request, 'admin/instances/update_modal.html', data)


def get_create_metadata(request):
    if request.method == 'POST':
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        project_name = request.session.get("project_name")
        project_id = request.session.get("project_id")
        auth_url = request.session.get("auth_url")
        description = request.session.get("description")
        try:
            nova = NovaRestAPI(auth_url, token)
            cinder = CinderRestAPI(auth_url, token)
            glance = GlanceRestAPI(auth_url, token)
            neutron = NeutronRestAPI(auth_url, token)
        except Unauthorized as e:
            request.session["error"] = {"title": e.message, "message": e.details, "code": 401}
            return redirect("/dashboard/login/?auth_url=" + auth_url + "&domain_name=" + domain_name + "&description=" + description)
        server_metadata = {
            "info": {
                "availability_zones": [],
                "quotas": []
            },
            "source": {
                "images": [],
                "instance_snapshots": [],
                "volumes": [],
                "volume_snapshots": []
            },
            "flavor": {
                "flavors": []
            },
            "network": {
                "networks": []
            },
            "network_port": {
                "ports": []
            },
            "security_group": {
                "security_groups": []
            },
            "keypair": {
                "keypairs": []
            },
            "metadata": {
                "metadatas": []
            }
        }
        availability_zone_list = nova.get_availability_zone_detail()
        if availability_zone_list.get("success"):
            server_metadata["info"]["availability_zones"] += availability_zone_list.get("success").get("availabilityZoneInfo")

        quotas = nova.get_nova_default_quotas(project_id)
        if quotas.get("success"):
            server_metadata["info"]["quotas"] += quotas.get("success").get("quota_set")

        images = glance.get_image_list()
        if images.get("success"):
            server_metadata["source"]["images"] = images.get("success").get("images")

        # instance_snapshots = glance.get_image_list()
        # if instance_snapshots.get("success"):
        #     serverMetadata["source"]["instance_snapshots"] = instance_snapshots.get("success").get("instance_snapshots")

        volumes = cinder.get_volume_list()
        if volumes.get("success"):
            server_metadata["source"]["volumes"] = volumes.get("success").get("volumes")

        volume_snapshots = cinder.getSnapshotList(project_name)
        if volume_snapshots.get("success"):
            server_metadata["source"]["volume_snapshots"] = volume_snapshots.get("success").get("volume_snapshots")

        flavors = nova.get_flavor_list()
        if flavors.get("success"):
            server_metadata["flavor"]["flavors"] = flavors.get("success").get("flavors")

        networks = neutron.get_network_list()
        if networks.get("success"):
            server_metadata["network"]["networks"] = networks.get("success").get("networks")

        ports = neutron.get_port_list()
        if ports.get("success"):
            server_metadata["network_port"]["ports"] = ports.get("success").get("ports")

        keypairs = nova.get_keypairs_list()
        if keypairs.get("success"):
            server_metadata["keypair"]["keypairs"] = keypairs.get("success").get("keypairs")

        # metadatas = nova.getMetadata() // 서버id가필요한데 왜그런지?

        return JsonResponse({"success": server_metadata})


def sync_modal(request, server_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    nova = NovaRestAPI(auth_url, token)
    result = nova.get_server(server_id)
    return render(request, 'admin/sync_modal.html', {'data': result["success"]["server"]})


def sync(request, server_id):
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    service_id = request.POST.get("service_id")
    nova = NovaRestAPI(auth_url, token)
    glance = GlanceRestAPI(auth_url, token)
    try:
        from sdsecgui.db.soa_db_connector import SOAManagerDBConnector
        m_conn = SOAManagerDBConnector.getInstance()
        m_conn.insert_server(auth_url, nova, service_id, server_id, glance)
        result = True
    except Exception as e:
        from sdsec.settings import logger
        logger.debug(e.message)
        result = False
    return JsonResponse({"result": result})
