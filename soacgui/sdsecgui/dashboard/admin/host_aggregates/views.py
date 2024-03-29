# _*_ coding:utf-8 _*_
import json

from django.http import JsonResponse
from django.shortcuts import render, redirect

from sdsecgui.tools.openstack_restapi import NovaRestAPI
from sdsecgui.tools.keystone_exception import Unauthorized


def getAggregateList(request):

    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    domain_name = request.session.get("domain_name")
    description = request.session.get("description")
    nova = NovaRestAPI(auth_url, token)
    if request.is_ajax() and request.method == 'POST':
        pass
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/login/?auth_url=" + auth_url + "&domain_name=" + domain_name + "&description=" + description + "&next=/dashboard/admin/aggregates")

        data = {}

        result_ag = nova.get_aggregate_list()
        if result_ag.get("success"):
            aggregates = result_ag["success"].get("aggregates")
            data["aggregates"] = aggregates
            if len(aggregates) < 4:
                data["ag_cnt"] = range(len(aggregates), 4)

        result_az = nova.get_availability_zone_detail()
        if result_az.get("success"):
            availability_zone_info = result_az["success"].get("availabilityZoneInfo")
            data['availabilityZoneInfo'] = availability_zone_info
            if len(availability_zone_info) < 4:
                data["az_cnt"] = range(len(availability_zone_info), 4)

        return render(request, 'admin/aggregates/index.html', data)


def create_aggregate(request):
    if request.method == "POST":
        data = json.loads(request.POST.get("data"))
        add_hosts = json.loads(request.POST.get("add_hosts"))
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        nova = NovaRestAPI(auth_url, token)
        result = nova.create_aggregate(data)
        add_fail_list = []
        error_message = ""
        if result.get("success"):
            aggregate_id = result["success"]["aggregate"].get("id")
            for add_host_id in add_hosts:
                add_result = nova.add_host_to_aggregate(aggregate_id, add_host_id)
                if add_result.get("error"):
                    add_fail_list.append(add_host_id)
                    error_message = add_result["error"].get("message")
                    if not error_message:
                        if add_result["error"].get("badRequest"):
                            error_message = add_result["error"]["badRequest"].get("message")
                        elif add_result["error"].get("conflictingRequest"):
                            error_message = add_result["error"]["conflictingRequest"].get("message")
            if len(add_fail_list) > 0:
                result["error"] = {"message": error_message + "<br/>add fail: " + str(add_fail_list), "title": "Add Host fail"}
        return JsonResponse(result)


def update_aggregate(request, aggregate_id):
    if request.method == "POST":
        data = json.loads(request.POST.get("data"))
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        nova = NovaRestAPI(auth_url, token)
        result = nova.update_aggregate(aggregate_id, data)
        return JsonResponse(result)


def delete_aggregate(request, aggregate_id):
    if request.method == "POST":
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        nova = NovaRestAPI(auth_url, token)
        result = nova.delete_aggregate(aggregate_id)
        if type(result) == str:
            result = {"success": True}
        return JsonResponse(result)


def action_aggregate(request, aggregate_id):
    if request.method == "POST":
        token = request.session.get('passToken')
        auth_url = request.session.get("auth_url")
        add_hosts = json.loads(request.POST.get("add_hosts"))
        remove_hosts = json.loads(request.POST.get("remove_hosts"))
        nova = NovaRestAPI(auth_url, token)
        add_fail_list = []
        error_message = ""
        result = {}
        for add_host in add_hosts:
            result = nova.add_host_to_aggregate(aggregate_id, add_host)
            if result.get("error"):
                add_fail_list.append(add_host)
                error_message = result["error"].get("message")
                if not error_message:
                    if result["error"].get("badRequest"):
                        error_message = result["error"]["badRequest"].get("message")
                    elif result["error"].get("conflictingRequest"):
                        error_message = result["error"]["conflictingRequest"].get("message")

        for remove_host in remove_hosts:
            result = nova.remove_host_to_aggregate(aggregate_id, remove_host)
            if result.get("error"):
                add_fail_list.append(remove_host)
                error_message = result["error"].get("message")
                if not error_message:
                    if result["error"].get("badRequest"):
                        error_message = result["error"]["badRequest"].get("message")
                    elif result["error"].get("conflictingRequest"):
                        error_message = result["error"]["conflictingRequest"].get("message")
        if len(add_fail_list) > 0:
            result["error"] = {"message": error_message + "<br/>add fail: " + str(add_fail_list), "title": "Add Host fail"}
        if not result.get("error") and not result.get("success"):
            result = {"success": True}
        return JsonResponse(result)


def aggregate_modal(request):
    modal_title = request.GET.get("modal_title")
    action = request.GET.get("action")
    aggregate_id = request.GET.get("id")
    token = request.session.get('passToken')
    auth_url = request.session.get("auth_url")
    nova = NovaRestAPI(auth_url, token)
    result = nova.get_compute_service({"binary": "nova-compute"})
    result_data = {
        "modal_title": modal_title
    }
    if result.get("success"):
        result_data["services"] = result["success"].get("services")

    if aggregate_id:
        result = nova.get_aggregate(aggregate_id)
        if result.get("success"):
            result_data["aggregate"] = result["success"].get("aggregate")
            result_data["action"] = action

    return render(request, 'admin/aggregates/modal.html', result_data)
