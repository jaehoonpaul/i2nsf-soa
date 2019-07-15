# _*_ coding:utf-8 _*_
import json

from django.http import JsonResponse
from django.shortcuts import render

from sdsec.settings import logger
from sdsecgui.tools.ctrlengine import ControlEngine


def list_routing(request, router_id):
    """
    dst_rules, pbr_tables{src_rules}
    :param request:
    :param router_id:
    :return:
    """
    control = ControlEngine(request.session.get("ctrl_header"))
    modal_title = request.GET.get("modal_title")
    dst_rules = control.get_route_dst_rule_list()
    result = {"modal_title": modal_title, "router_id": router_id}
    if dst_rules.get("success"):
        netnodeip = [
            tmp_dst_rule.get("netnodeip")
            for tmp_dst_rule in dst_rules["success"]["result"]
            if tmp_dst_rule.get("router") == "qrouter-" + router_id
        ]
        if len(netnodeip) > 0:
            pbr_table_name = router_id.split("-")[0]
            result["pbr"] = pbr_table_name
            result["netnodeip"] = netnodeip[0]

            dst_rule = control.get_route_dst_rule("qrouter-" + router_id, netnodeip[0])
            if dst_rule.get("success"):
                result["dst_rules"] = dst_rule["success"].get("result")

            result_pbr_tables = control.get_route_pbr_tables()
            if result_pbr_tables.get("success") and result_pbr_tables["success"].get("result") and len(result_pbr_tables["success"]["result"]) > 0:
                pbr_tables = result_pbr_tables["success"].get("result")[0].get("routers").get("qrouter-" + router_id)
                result["pbr_tables"] = []
                for value in pbr_tables:
                    # logger.debug("\t\t\n{}\t\t\n{}\t\t\n{}".format(pbr_table_name, value.get("PBR_TABLE"),pbr_table_name in value.get("PBR_TABLE")))
                    if pbr_table_name in value.get("PBR_TABLE"):  # value.get("PBR_TABLE") in ["local", "main", "default"] or
                        pbr_table = {
                            "PBR_TABLE": value.get("PBR_TABLE"),
                            "order": value.get("order"),
                            "target": value.get("target")
                        }
                        src_rules = control.get_route_src_rules("qrouter-" + router_id, netnodeip[0], value.get("PBR_TABLE"))
                        if src_rules.get("success"):
                            pbr_table["src_rules"] = src_rules["success"].get("result")
                        result["pbr_tables"].append(pbr_table)
    return render(request, "service/routing/index.html", result)


def create_dst_pop(request):
    modal_title = request.GET.get("modal_title")
    router_id = request.GET.get("router_id")
    netnodeip = request.GET.get("netnodeip")
    control = ControlEngine(request.session.get("ctrl_header"))
    result_interfaces = control.get_route_devices("qrouter-" + router_id, netnodeip)
    if result_interfaces.get("success"):
        interfaces = result_interfaces["success"].get("result")
    else:
        interfaces = []
    return render(request, "service/routing/dst_create_modal.html", {"modal_title": modal_title, "interfaces": interfaces})


def create_src_pop(request):
    modal_title = request.GET.get("modal_title")
    router_id = request.GET.get("router_id")
    netnodeip = request.GET.get("netnodeip")
    create_type = request.GET.get("type")
    control = ControlEngine(request.session.get("ctrl_header"))
    result_interfaces = control.get_route_devices("qrouter-" + router_id, netnodeip)
    if result_interfaces.get("success"):
        interfaces = result_interfaces["success"].get("result")
    else:
        interfaces = []
    return render(request, "service/routing/src_create_modal.html", {"modal_title": modal_title, "interfaces": interfaces, "pbr_table": router_id.split("-")[0], "type": create_type})


def create_dst_routing(request, router_id):
    control = ControlEngine(request.session.get("ctrl_header"))
    data = json.loads(request.POST.get("data"))
    netnodeip = request.POST.get("netnodeip")
    result = control.create_route_dst_rule_path("qrouter-" + router_id, netnodeip, data)
    return JsonResponse(result)


def create_src_routing(request, router_id):
    control = ControlEngine(request.session.get("ctrl_header"))
    data = json.loads(request.POST.get("data"))
    netnodeip = request.POST.get("netnodeip")
    create_type = request.POST.get("type")

    if create_type == "type1":
        type1 = {
            "type": "type1",
            "src": data.get("src"),
            "pbr": data.get("pbr")
        }
        result_pbr_tables = control.get_route_pbr_tables()
        if result_pbr_tables.get("success") and result_pbr_tables["success"].get("result") and len(result_pbr_tables["success"]["result"]) > 0:
            pbr_tables = result_pbr_tables["success"].get("result")[0].get("routers").get("qrouter-" + router_id)
            for value in pbr_tables:
                if type1["pbr"] == value.get("PBR_TABLE"):
                    return JsonResponse({"error": {"message": "exist pbr_table name: " + type1["pbr"], "title": "exist pbr_table name"}})
        result = control.create_route_src_rule_path("qrouter-" + router_id, netnodeip, type1)

    elif create_type == "type2":
        type2 = {
            "type": "type2",
            "dest": data.get("dest"),
            "via": data.get("via"),
            "dev": data.get("dev"),
            "pbr": data.get("pbr")
        }
        result = control.create_route_src_rule_path("qrouter-" + router_id, netnodeip, type2)
    else:
        result = {"error": {"message": "not support", "title": ""}}
    return JsonResponse(result)


def delete_dst_routing(request, router_id):
    control = ControlEngine(request.session.get("ctrl_header"))
    data = json.loads(request.POST.get("data"))
    netnodeip = request.POST.get("netnodeip")
    result = control.delete_route_dst_rule_path(router_id, netnodeip, data)
    return JsonResponse(result)


def delete_src_routing(request, router_id):
    """
    type2 삭제 요청시
     - type2 제거
    type1 삭제 요청은 없음
    pbrtable 삭제 요청시
     - type2 조회후 제거
     - type1 조회후 제거
     - pbrtable 제거
    :param request:
    :param router_id:
    :return:
    """
    control = ControlEngine(request.session.get("ctrl_header"))
    data = json.loads(request.POST.get("data"))
    netnodeip = request.POST.get("netnodeip")
    if data.get("type") == 'type1':
        result = control.delete_route_src_rule_path_type1(router_id, netnodeip, data)
    elif data.get("type") == 'type2':
        result = control.delete_route_src_rule_path_type2(router_id, netnodeip, data)
    else:
        result_src_rules = control.get_route_src_rules(router_id, netnodeip, data.get("pbrtable"))
        result_qrouters = control.get_route_pbr_tables()

        if result_qrouters.get("success") and result_src_rules.get("success"):
            result = {}
            for src_rule in result_src_rules["success"].get("result"):
                if src_rule.get("broadcast") is None and src_rule.get("local") is None:
                    result_delete_src_type2 = control.delete_route_src_rule_path_type2(router_id, netnodeip, {
                        "type": "type2",
                        "dest": src_rule.get("dest"),
                        "via": src_rule.get("via"),
                        "dev": src_rule.get("dev"),
                        "pbr": data.get("pbrtable")
                    })
                    if result_delete_src_type2.get("error"):
                        result = result_delete_src_type2

            if result.get("error") is None:
                qrouters = result_qrouters["success"].get("result")[0].get("routers")
                pbr_tables = qrouters.get(router_id)
                for pbr_table in pbr_tables:
                    if pbr_table.get("PBR_TABLE") == data.get("pbrtable"):
                        result_delete_src_type1 = control.delete_route_src_rule_path_type1(router_id, netnodeip, {
                            "type": "type1",
                            "src": pbr_table.get("target").replace("from ", "").replace(" lookup", ""),
                            "pbr": data.get("pbrtable")
                        })  # from all lookup / from 172.16.10.0/24 lookup 에서 CIDR 추출
                        if result_delete_src_type1.get("error"):
                            result = result_delete_src_type1

                if result.get("error") is None:
                    result = control.delete_route_src_rule_path_pbrtable(router_id, netnodeip, {
                        "pbr": data.get("pbrtable")
                    })

        elif result_qrouters.get("error"):
            result = result_qrouters
        else:
            result = result_src_rules

    return JsonResponse(result)
