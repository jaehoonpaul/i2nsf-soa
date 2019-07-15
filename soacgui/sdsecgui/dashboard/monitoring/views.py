# _*_ coding:utf-8 _*_
import datetime
import json
import re
import time

from django.shortcuts import render, redirect
from django.http import JsonResponse
import logging
from django.views.decorators.csrf import csrf_exempt

from sdsecgui.tools.ctrlengine import ControlEngine
from sdsecgui.tools.openstack_restapi import NeutronRestAPI, NovaRestAPI, KeystoneRestAPI
from sdsecgui.db.query import SELECT_DOMAINS_ONE_BY_AUTH_URL
from sdsecgui.tools.zabbix_restapi import ZabbixRestAPI, Trigger
from sdsecgui.db.db_connector import SOAControlDomainDBConnector, SOAControlDBConnector
from sdsecgui.db.zabbix_query import INSERT_ALARM, SELECT_ALARM

logger = logging.getLogger("myapp.myLogger")


def create_trigger(zabbix, host, floating_ip_address):
    data = {
        "description": "Unavailable by ICMP ping",
        "expression": "{" + host + ":icmpping[" + floating_ip_address + ",,,,].max(#3)}=0",
        "comments": "Last value: {ITEM.LASTVALUE1}.\nLast three attempts returned timeout.  Please check device connectivity.",
        "priority": Trigger.HIGH
    }
    return zabbix.create_trigger(data)


def create_item_for_host(zabbix, floating_ip_address, host_id, application_id, host_interface_id):
    data = {
        "name": "ICMP ping",
        "key_": "icmpping[" + floating_ip_address + ",,,,]",
        "hostid": host_id,
        "interfaceid": host_interface_id,
        "type": 3,
        "value_type": 3,
        "valuemapid": 1,
        "applications": [application_id],
        "delay": "5s"
    }
    return zabbix.create_item(data)


def create_action_for_host(request, zabbix, trigger_id, server_name, server_data):
    # TODO: script 생성(sendToSOAController.sh):
    # curl -d "message=$1&subject=$2&sendto=$3" $4
    # curl -d "message=$1&subject=$2&sendto=$3" $5
    result_mediatype = zabbix.get_mediatype(filter={"description": "sendToSOAController"})
    user_id = zabbix.get_user({"alias": "Admin"}, ["userid"]).get("result")[0].get("userid")
    if result_mediatype.get("result") and len(result_mediatype["result"]) > 0:
        media_type_id = result_mediatype["result"][0].get("mediatypeid")
    else:
        exec_params = "{ALERT.MESSAGE}\n{ALERT.SUBJECT}\n{ALERT.SENDTO}\n"
        # exec_params += config.get("SETTINGS", 'CTRL_URL').replace("/v2", "") + "/recovery/vm\n"
        exec_params += "http://" + request.get_host() + "/dashboard/monitoring/alarm_log\n"
        data = {
            "type": 1,
            "description": "sendToSOAController",
            "exec_path": "sendToSOAController.sh",
            "exec_params": exec_params,
            "maxattempts": "5",
            "attempt_interval": "10s"
        }
        result_create_mediatype = zabbix.create_mediatype(data)
        if result_create_mediatype.get("result"):
            media_type_id = result_create_mediatype["result"].get("mediatypeids")[0]
        else:
            return result_create_mediatype
    data = {
        "eventsource": 0,
        "name": server_name + " ICMP Ping action",
        "def_longdata": '"' + server_data.replace('"', '\\"') + '"',
        "def_shortdata": "{TRIGGER.NAME}: {TRIGGER.STATUS}",
        "filter": {
            "evaltype": 0,
            "conditions": [{
                "conditiontype": 2,
                "operator": 0,
                "value": trigger_id
            }]
        },
        "operations": [{
            "opmessage_usr": [{"userid": user_id}],
            "operationtype": 0,
            "esc_step_from": 1,
            "esc_step_to": 1,
            "evaltype": 0,
            "opmessage": {
                "mediatypeid": media_type_id,
                "default_msg": 1
            }
        }],
        "recovery_operations": [],
        "acknowledge_operations": [],
    }
    return zabbix.create_action(data)


def create_host(request, zabbix, recovery_info, hostgroup_id):
    floating_ip_address = recovery_info["server"].get("floating_ip_address")
    data = {
        "host": recovery_info["server"].get("vm_id"), "name": recovery_info["server"].get("vm_name"), "groups": [{"groupid": hostgroup_id}],
        "interfaces": [{"type": 1, "main": 1, "useip": 1, "ip": "127.0.0.1", "port": "10050", "dns": ""}]
    }
    # host 생성
    err_msg_list = []
    result_create_host = zabbix.create_host(data)
    if result_create_host.get("result"):
        created_hostid = result_create_host["result"].get("hostids")[0]
        # host - host_interface 조회
        result_host_interface = zabbix.get_host_interfaces(filters={"hostids": created_hostid}, output="hostinterfaceid")
        # host - application 생성
        result_create_application = zabbix.create_application(created_hostid, "Status")
        if result_host_interface.get("result") and result_create_application.get("result"):
            application_id = result_create_application["result"].get("applicationids")[0]
            host_interface_id = result_host_interface["result"][0].get("interfaceid")
            # host - item 생성
            result_create_item = create_item_for_host(zabbix, floating_ip_address, created_hostid, application_id, host_interface_id)
            if result_create_item.get("result"):
                # item_id = result_create_item["result"].get("itemids")[0]
                # host - item - trigger 생성
                result_create_trigger = create_trigger(zabbix, data.get("host"), floating_ip_address)
                if result_create_trigger.get("result"):
                    trigger_id = result_create_trigger["result"].get("triggerids")[0]
                    server_data = json.dumps(recovery_info)
                    # server_data = json.dumps({"server": {"hostId": recovery_info.get("hostId"), "tenant_id": recovery_info.get("tenant_id"), "user_id": recovery_info.get("user_id"), "id": recovery_info.get("id"), "name": recovery_info.get("name"), "flavor": {"id": recovery_info["flavor"].get("id")}, "networks": recovery_info.get("networks"), "image": {"id": recovery_info["image"].get("id")}, "security_groups": recovery_info.get("security_groups")}})
                    result_create_action = create_action_for_host(request, zabbix, trigger_id, data.get("name"), server_data)
                    if result_create_action.get("error"):
                        err_msg_list.append(result_create_action["error"])
                if result_create_trigger.get("error"):
                    err_msg_list.append(result_create_host["error"])
            if result_create_item.get("error"):
                err_msg_list.append(result_create_host["error"])
        if result_host_interface.get("error"):
            err_msg_list.append(result_create_host["error"])
    if result_create_host.get("error"):
        err_msg_list.append(result_create_host["error"])
    if len(err_msg_list) > 0:
        return err_msg_list
    else:
        return []


def check_recovered_vm_host(zabbix, host, item, floating_ip):
    icmpping_ip = item["key_"].replace("icmpping[", "").replace(",,,,]", "")
    if icmpping_ip == floating_ip.get("floating_ip_address"):
        result_trigger = zabbix.get_triggers(hostids=host.get("hostid"))
        if result_trigger.get("result"):
            trigger = result_trigger["result"][0]
            result_action = zabbix.get_actions(triggerids=trigger.get("triggerid"))
            if result_action.get("result"):
                z_action = result_action["result"][0]
                result_del_host = zabbix.delete_host([host.get("hostid")])
                result_del_action = zabbix.delete_action([z_action.get("actionid")])
                # logger.debug("""
                # \n\n\n
                # host:{}
                # action: {}
                # delhost:{}
                # delaction:{}
                # \n\n\n
                # """.format(host, z_action, result_del_host, result_del_action))


def index(request):
    token = request.session.get("passToken")
    auth_url = request.session.get("auth_url")
    project_id = request.session.get("project_id")
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    if request.method == "POST" and request.is_ajax():
        groupids = request.POST.get("groupids")
        groupname = request.POST.get("groupname")
        hostids = request.POST.get("hosts")
        if groupname or groupids:
            if "Template" in groupname:
                if groupname == "Templates":
                    result_hosts = zabbix.get_template(output="extend")
                else:
                    result_hosts = zabbix.get_template(output="extend", groupids=groupids)
            else:
                result_hosts = zabbix.get_hosts(output=["hostid", "host"], groupids=groupids)
        else:
            host_ping_list = []
            for hostid in json.loads(hostids):
                result_item = zabbix.get_item({"hostid": hostid, "name": "Agent ping"}, output=["lastvalue"])
                if result_item.get("result"):
                    host_ping_list.append({"hostid": hostid, "ping": result_item["result"][0].get("lastvalue")})
            result_hosts = {"host_ping_list": host_ping_list}
        return JsonResponse(result_hosts)
    else:
        """
         1. openstack - floating_ip 목록 조회
         2. zabbix - host 목록 조회
         floating_ip 목록 중 등록되지 않은 vm이 있으면 host 생성(floating_ip-port조회)
         3. openstack - vm조회
         4. zabbix - hostgroup조회
         5. zabbix - host 생성
         6. zabbix - hostinterface 조회
         7. zabbix - application 생성
         8. zabbix - item 생성
         9. zabbix - trigger 생성
        10. zabbix - mediatype 생성
        11. zabbix - action 생성
        12. zabbix - host 목록 조회
        13. zabbix - hostinterface 조회
        floating_ip 목록 중 등록되지 않은 vm이 없거나 생성 완료후
         1. host목록, hostinterface목록, vm목록 매칭
         2. host목록 반환
        
        """
        neutron = NeutronRestAPI(auth_url, token)
        # openstack의 floating_ip 목록 가져오기
        response_data = {"hosts": [], "vm_list": []}
        q = {"project_id": project_id}
        result_floating_ips = neutron.get_floating_ips(None, q)
        create_host_flag = False
        # host목록 가져오기
        result_hosts = zabbix.get_hosts(output=["hostid", "host", "status", "name"])
        if result_hosts.get("result") and result_floating_ips.get("success"):
            floating_ips = result_floating_ips["success"].get("floatingips")  # 중요1
            hosts = result_hosts.get("result")
            # floating_ips 목록이 Zabbix에 전부 등록되있는지 확인
            # TODO: javascript에서 서버 상태(ICMP Ping)를 실시간으로 변경
            recovery_list = []  # 중요3
            for floating_ip in floating_ips:
                if floating_ip.get("port_id"):
                    # floatingip - port 조회
                    result_port = neutron.getPort(floating_ip["port_id"])
                    if result_port.get("success"):
                        port = result_port["success"].get("port")
                        floating_ip["port_details"] = port
                        server_id = port.get("device_id")
                        host_names = [temp_host.get("host") for temp_host in hosts]
                        # 각 가상머신의 호스트가 등록되있지 않다면 등록
                        if server_id and "compute" in port.get("device_owner") and server_id not in host_names:
                            # floatingip - port - device(서버) 조회
                            recovery_info = {
                                "server": {
                                    "vm_id": server_id,
                                    "floating_ip_id": floating_ip.get("id"),
                                    "floating_ip_address": floating_ip.get("floating_ip_address")
                                },
                                "auth_url": auth_url,
                                "project_name": request.session.get("project_name")
                            }
                            recovery_list.append(recovery_info)

            # host의 interface 목록 가져오기
            result_host_interfaces = zabbix.get_host_interfaces(output=["hostid", "ip", "port"])
            if result_host_interfaces.get("result"):
                host_interfaces = result_host_interfaces["result"]
                for host in hosts:
                    for host_interface in host_interfaces:
                        # host와 interface 매칭
                        if host.get("hostid") == host_interface.get("hostid"):
                            host["interface"] = host_interface
                            # host중 interface의 ip가 127.0.0.1이거나 localhost인 경우
                            if "127.0.0.1" in host_interface.get("ip") or "localhost" in host_interface.get("ip"):
                                for floating_ip in floating_ips:
                                    #  floating_ip의 device_id와 host의 host(hostname)이 같을때만 리스트에 담아 보여주기
                                    if floating_ip.get("port_details"):
                                        result_item = zabbix.get_item({"hostid": host.get("hostid"), "name": "ICMP ping"})
                                        if result_item.get("result"):
                                            item = result_item["result"][0]
                                            if host.get("host") == floating_ip["port_details"]["device_id"]:
                                                host["floatingip_info"] = floating_ip
                                                host["ping"] = item.get("lastvalue")
                                                response_data["vm_list"].append(host)
                                                # logger.debug("\n\n\n\nfloating_ip: {}\nctrl_header: {}\n\n\n\n".format(floating_ip, request.session.get("ctrl_header")))
                                            else:
                                                check_recovered_vm_host(zabbix, host, item, floating_ip)
                            elif "admin" in request.session["roles"]:
                                result_item = zabbix.get_item({"hostid": host.get("hostid"), "name": "Agent ping"})
                                if result_item.get("result"):
                                    host["ping"] = result_item["result"][0].get("lastvalue")
                                response_data["hosts"].append(host)

            if len(recovery_list) > 0:
                response_data["synchronize_flag"] = False
            else:
                response_data["synchronize_flag"] = True

        else:
            response_data["error"] = {}
            if result_floating_ips.get("error"):
                response_data["error"]["openstack"] = result_floating_ips["error"]
            if not result_hosts.get("result"):
                response_data["error"]["zabbix"] = result_hosts
        return render(request, "monitoring/index.html", response_data)


def synchronize_floating_server_host(request):
    if request.method == 'POST' and request.is_ajax():
        token = request.session.get("passToken")
        auth_url = request.session.get("auth_url")
        project_id = request.session.get("project_id")
        auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
        zabbix = ZabbixRestAPI(auth)
        neutron = NeutronRestAPI(auth_url, token)
        err_msg_list = []
        # openstack의 floating_ip 목록 가져오기
        q = {"project_id": project_id}
        result_floating_ips = neutron.get_floating_ips(None, q)
        create_host_flag = False
        # host목록 가져오기
        result_hosts = zabbix.get_hosts(output=["hostid", "host", "status", "name"])
        if result_hosts.get("result") and result_floating_ips.get("success"):
            floating_ips = result_floating_ips["success"].get("floatingips")  # 중요1
            hosts = result_hosts.get("result")
            # floating_ips 목록이 Zabbix에 전부 등록되있는지 확인
            # TODO: zabbix에 등록된 host중 floatingip연결을 해제시키거나 삭제된 server가 있으면 제거
            recovery_list = []  # 중요3
            for floating_ip in floating_ips:
                if floating_ip.get("port_id"):
                    # floatingip - port 조회
                    result_port = neutron.getPort(floating_ip["port_id"])
                    if result_port.get("success"):
                        port = result_port["success"].get("port")
                        floating_ip["port_details"] = port
                        server_id = port.get("device_id")
                        host_names = [temp_host.get("host") for temp_host in hosts]
                        # 각 가상머신의 호스트가 등록되있지 않다면 등록 중요3
                        if server_id and "compute" in port.get("device_owner") and server_id not in host_names:
                            # floatingip - port - device(서버) 조회
                            recovery_info = {
                                "server": {
                                    "vm_id": server_id,
                                    "floating_ip_id": floating_ip.get("id"),
                                    "floating_ip_address": floating_ip.get("floating_ip_address"),
                                    "fixed_ips": port.get("fixed_ips")
                                },
                                "auth_url": auth_url,
                                "project_name": request.session.get("project_name")
                            }
                            recovery_list.append(recovery_info)
                    if result_port.get("error"):
                        err_msg_list.append(result_port["error"])

            if len(recovery_list) > 0:
                # 서비스 리스트 조회 -> 서비스 조회 -> vm_list에서 같은아이디 있는지 확인
                ctrl_header = request.session.get("ctrl_header")
                control = ControlEngine(ctrl_header)
                result_service_list = control.get_service_list()
                if result_service_list.get("success"):
                    for service in result_service_list["success"].get("service_list"):
                        service_id = service.get("service_id")
                        result_service = control.get_service(service_id)
                        if result_service.get("success"):
                            for recovery_info in recovery_list:
                                for vm in result_service["success"]["service_detail"].get("vm_list"):
                                    # 서비스내에 해당 server가 있는지 확인
                                    if vm.get("vm_id") == recovery_info["server"].get("vm_id"):
                                        recovery_info["server"]["vm_name"] = vm.get("vm_name")
                                        recovery_info["server"]["service_id"] = service_id
                        if result_service.get("error"):
                            err_msg_list.append(result_service["error"])
                if result_service_list.get("error"):
                    err_msg_list.append(result_service_list["error"])
                            # service_list 조회끝
            for recovery_info in recovery_list:
                logger.debug("\n\n\n\n" + json.dumps(recovery_info) + "\n\n\n\n")
                # hostgroup 조회
                result_hostgroup = zabbix.get_hostgroups({"name": "Linux servers"}, ["groupid"])
                if result_hostgroup.get("result"):
                    hostgroup_id = result_hostgroup["result"][0].get("groupid")
                    result_create_host = create_host(request, zabbix, recovery_info, hostgroup_id)
                    if len(result_create_host) < 1:
                        create_host_flag = True
                    else:
                        err_msg_list.append(result_create_host)
                if not result_hostgroup.get("result"):
                    err_msg_list.append(result_hostgroup)

            # 호스트 생성시 호스트 목록 다시조회
            if create_host_flag:
                result_hosts = zabbix.get_hosts(output=["hostid", "host", "status", "name"])
                if result_hosts.get("result"):
                    hosts = result_hosts["result"]
        if not result_hosts.get("result"):
            err_msg_list.append(result_hosts)
        if result_floating_ips.get("error"):
            err_msg_list.append(result_floating_ips["error"])
        return JsonResponse({"success": {"err_msg_list": err_msg_list}})


def info(request, host_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    # 호스트 리스트
    host_result = zabbix.get_hosts(output=["hostid", "host", "name"])
    if host_result.get("result"):
        hosts = host_result.get("result")
    else:
        hosts = host_result

    # 호스트 정보가 없을 경우
    if '1' == host_id:
        return redirect("/dashboard/monitoring/" + hosts[0].get("hostid") + "/detail")

    # 이벤트 정보
    result = zabbix.get_host_events(hostid=host_id, output="extend", sortfield=["clock", "eventid"])
    if result.get("result"):
        events = result.get("result")
    else:
        events = result

    host_flag = True
    result_host_interfaces = zabbix.get_host_interfaces(output=["hostid", "ip", "port"])
    if result_host_interfaces.get("result"):
        host_interfaces = result_host_interfaces["result"]
        for host_interface in host_interfaces:
            # host와 interface 매칭
            if host_id == host_interface.get("hostid"):
                if "127.0.0.1" in host_interface.get("ip") or "localhost" in host_interface.get("ip"):
                    host_flag = False
    return render(request, "monitoring/info.html", {"hostid": host_id, "hosts": hosts, "events": events, "host_flag": host_flag})


def chart(request, host_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    # 이벤트 정보
    result = zabbix.get_host_events(hostid=host_id, output="extend", sortfield=["clock", "eventid"])
    if result.get("result"):
        events = result.get("result")
    else:
        events = result
    return render(request, "monitoring/chart.html", {"events": events})


def network_interface(request, host_id, result_type=None):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_item(output=["key_"], editable=True, hostids=host_id, search={"key_": "net.if"})
    if result.get("result"):
        result["result"] = list(set([
            item.get("key_").replace("net.if.in[", "").replace("net.if.out[", "").replace("]", "")
            for item in result["result"]
        ]))
    if result_type == "dict":
        return result
    else:
        return JsonResponse(result)


def chart_data(request, host_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    app_type = request.POST.get("type")
    if app_type == "icmpping":
        chart_list = {"ping": {}}
        result = zabbix.get_chart_data(host_id, "icmpping")
        if result.get("result"):
            chart_list["ping"]["icmpping"] = result.get("result")
        else:
            chart_list["ping"]["icmpping"] = []
    else:
        item_group = {
            "ping": {"agent.ping": []},
            "memory": {
                "vm.memory.size": ["available", "total"],
                "system.swap.size": [",free", ",pfree", ",total"]
            },
            "cpu": {
                "system.cpu.load": ["percpu,avg1", "percpu,avg5", "percpu,avg15", ],
                "system.cpu.util": [",idle", ",interrupt", ",iowait", ",nice", ",softirq", ",steal", ",system", ",user"],
                "system.cpu.switches": [],
                "system.cpu.intr": []
            },
            "filesystems": {
                "vfs.fs.inode": ["/,pfree"],
                "vfs.fs.size": ["/,free", "/,pfree", "/,total", "/,used"]
            },
            "network": {
                "net.if.in": [],
                "net.if.out": []
            }
        }
        interfaces = network_interface(request, host_id, "dict")
        if interfaces.get("result"):
            item_group["network"]["net.if.in"] = interfaces["result"]
            item_group["network"]["net.if.out"] = interfaces["result"]

        chart_list = {}
        item_dic = item_group[app_type]
        chart_list[app_type] = {}
        for item_main_key, item_sub_key_list in item_dic.items():
            # item key 조합
            item_key = item_main_key
            if len(item_sub_key_list) > 0:
                # subkey 있을때
                for item_sub_key in item_sub_key_list:
                    item_key = item_main_key + "[" + item_sub_key + "]"
                    result = zabbix.get_chart_data(host_id, item_key)
                    if result.get("result"):
                        chart_list[app_type][item_key] = result.get("result")
                    else:
                        chart_list[app_type][item_key] = []
            else:
                # subkey 없을 때
                result = zabbix.get_chart_data(host_id, item_key)
                if result.get("result"):
                    chart_list[app_type][item_key] = result.get("result")
                else:
                    chart_list[app_type][item_key] = []
    return JsonResponse(chart_list)


def chart_data_detail(request, host_id):
    data = json.loads(request.POST.get("data"))
    date_format = "%Y-%m-%dT%H:%M:%S"
    if data.get("time_from"):
        time_from = datetime.datetime.strptime(data["time_from"], date_format)
    else:
        time_from = datetime.datetime.now() - datetime.timedelta(days=1)
    if data.get("time_till"):
        time_till = datetime.datetime.strptime(data["time_till"], date_format)
    else:
        time_till = datetime.datetime.now()
    time_from_sec = (time_from - datetime.timedelta(hours=9) - datetime.datetime(1970, 1, 1)).total_seconds()
    time_till_sec = (time_till - datetime.timedelta(hours=9) - datetime.datetime(1970, 1, 1)).total_seconds()
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    host_item_result = zabbix.get_item(output="extend", hostids=host_id, search={"key_": data.get("key")})
    if host_item_result.get("result") and len(host_item_result["result"]) == 1:
        host_item = host_item_result["result"][0]
        sortorder = data.get("sortorder") if data.get("sortorder") else "DESC"
        if time_from < (datetime.datetime.now() - datetime.timedelta(days=7, hours=9)):
            result_history = zabbix.get_trend(ouput=["itemid", "clock", "num", "value_avg"],
                                              itemids=host_item.get("itemid"), time_from=time_from_sec,
                                              time_till=time_till_sec)
        else:
            result_history = zabbix.get_history(itemids=host_item.get("itemid"), sortfield="clock", sortorder=sortorder,
                                                history=host_item.get("value_type"), time_from=time_from_sec,
                                                time_till=time_till_sec)
        result = {"history": result_history}
    else:
        result = host_item_result
    return JsonResponse(result)


def action(request):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_actions(filters={"eventsource": 0}, output="extend", selectOperations="extend", selectFilter="extend")
    if result.get("result"):
        actions = result.get("result")
    else:
        actions = result

    return render(request, "monitoring/action/index.html", {"actions": actions})


def action_modal(request):
    modal_title = request.GET.get("modal_title")
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = {"modal_title": modal_title}
    if request.GET.get("action_id"):
        action_id = request.GET.get("action_id")
        action_result = zabbix.get_actions(filters={"eventsource": 0}, output="extend", selectOperations="extend", selectFilter="extend", actionids=action_id)
        if action_result.get("result") and len(action_result.get("result")) > 0:
            result["action"] = action_result.get("result")[0]
        else:
            result["action"] = action_result
    return render(request, "monitoring/action/modal.html", result)


def get_operation(request):
    data = {}
    if request.GET.get("operation"):
        data["operation"] = json.loads(request.GET.get("operation"))
    else:
        data["operation"] = {
            "esc_step_from": 1,
            "esc_step_to": 1,
            "esc_period": 0
        }
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    user_result = zabbix.get_user(filters={"alias": "Admin"})
    if user_result.get("result"):
        data["user"] = user_result["result"]
    media_result = zabbix.get_mediatype()
    if media_result.get("result"):
        data["mediatype"] = media_result["result"]

    return render(request, "monitoring/action/loadpage/operation.html", data)


def get_triggers(request):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    templateids = request.POST.get("templateids")
    hostids = request.POST.get("hostids")
    if templateids:
        result = zabbix.get_triggers(output="extend", templateids=templateids)
    else:
        result = zabbix.get_triggers(output="extend", hostids=hostids)

    return JsonResponse(result)


def trigger_list(request):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_hostgroups(output="extend")
    if result.get("result"):
        hostgroups = result.get("result")
    else:
        hostgroups = result
    return render(request, "monitoring/action/trigger_list.html", {"hostgroups": hostgroups})


def submit_action(request):
    data = json.loads(request.POST.get("data"))
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    if data.get("actionid"):
        result = zabbix.update_action(data)
    else:
        result = zabbix.create_action(data)
    return JsonResponse(result)


def history(request):
    """
    알람 이력 조회
    :param request:
    :return:
    """
    db_nm = request.session.get("domain_db_nm")
    db_user = request.session.get("domain_db_user")
    db_pass = request.session.get("domain_db_pass")
    db_ip = request.session.get("domain_db_ip")
    db_port = request.session.get("domain_db_port")
    conn = SOAControlDomainDBConnector(db_nm=db_nm, db_user=db_user, db_pass=db_pass, db_ip=db_ip, db_port=db_port)
    result = conn.select(SELECT_ALARM)
    from simplejson import JSONDecodeError
    for row in result:
        message = row.get("trigger_message")
        try:
            json_message = json.loads(message)
            while type(json_message) in [str, unicode]:
                json_message = json.loads(json_message)

            if type(json_message) == dict and json_message.get("server"):
                if json_message["server"].get("name") and json_message["server"].get("id"):
                        row["trigger_message"] = "가상 서버: " + json_message["server"]["name"] + "(" + json_message["server"]["id"] + ") 응답 없음<br/>"
                        # row["trigger_message"] += "HOST ID: " + json_message["server"].get("hostId") + "<br/>"
                        # row["trigger_message"] += "서버명: " + json_message["server"].get("name") + "<br/>"
                        # row["trigger_message"] += "서버 ID: " + json_message["server"].get("id")
                elif json_message["server"].get("vm_name") and json_message["server"].get("vm_id"):
                    if json_message.get("recovery"):
                        row["trigger_message"] = "프로젝트: {}<br/>Floating IP Address: {}<br/>가상 서버: {}({}) 복구 완료<br/>".format(
                            json_message.get("project_name"), json_message["server"].get("floating_ip_address"),
                            json_message["server"].get("vm_name"), json_message["server"].get("vm_id"))
                    else:
                        row["trigger_message"] = "프로젝트: {}<br/>Floating IP Address: {}<br/>가상 서버: {}({}) 응답 없음<br/>".format(
                            json_message.get("project_name"), json_message["server"].get("floating_ip_address"),
                            json_message["server"].get("vm_name"), json_message["server"].get("vm_id"))
                else:
                    row["trigger_message"] = message
            elif type(json_message) == list and len(json_message) > 0:
                row["trigger_message"] = ""
                for json_msg in json_message:
                    if json_msg.get("message") and json_msg.get("title"):
                        row["trigger_message"] += "{}({})<br/>{}<br/>".format(json_msg.get("title"), json_msg.get("code"), json_msg.get("message"))
                    else:
                        row["trigger_message"] += "{}<br/>".format(json_msg)
            else:
                row["trigger_message"] = message
        except JSONDecodeError as e:
            row["trigger_message"] = message

    return render(request, "monitoring/history/index.html", {"alarms": result})


# subject_p = re.compile("(?P<event_type>Problem|Resolved):[\s]?(?P<trigger_name>\S.+)")
# message_p = re.compile(
#     "(:?Problem started at|Problem has been resolved at) (?P<event_time>.+) on (?P<event_date>.+)\n"
#     "Problem name: (?P<trigger_name>.+)\n"
#     "Host: (?P<host_name>.+)\n"
#     "Severity: (?P<severity>.+)\n"
#     "\n"
#     "Original problem ID: (?P<event_id>.+)\n"
#     "(?P<trigger_url>.+)", re.MULTILINE
# )

@csrf_exempt
def alarms(request):
    """
    알람 수신
    :param request:
    :return:
    """
    if request.method == 'POST':
        logger.debug("[POST] alarm\n{}".format(request.body))
        data = json.loads(request.body)
        sendto = data.get("sendto")
        subject = data.get("subject")
        recovery_info = data.get("message")
        message = json.dumps(recovery_info)
        data = (
            subject,
            message,
            sendto
        )
        conn = SOAControlDBConnector()

        domain = conn.select_one(SELECT_DOMAINS_ONE_BY_AUTH_URL, recovery_info.get("auth_url"))
        db_user = domain.get("db_user")
        db_pass = domain.get("db_password")
        db_ip = domain.get("db_ip")
        db_port = domain.get("db_port")
        auth_url = domain.get("auth_url")
        d_conn = SOAControlDomainDBConnector(db_nm="soacgui", db_user=db_user, db_pass=db_pass, db_ip=db_ip, db_port=db_port)
        d_conn.insert(INSERT_ALARM, data)
        err_msg_list = []
        domain["os_admin_id"] = "admin"
        domain["os_admin_pass"] = "soac!@#"
        result_token = KeystoneRestAPI.get_token(auth_url, domain.get("os_admin_id"), domain.get("os_admin_pass"), domain.get("domain_name"), recovery_info.get("project_name"))
        if result_token.get("success"):
            if recovery_info.get("server"):
                nova = NovaRestAPI(auth_url, result_token["success"].get("token"))
                vm_id = recovery_info["server"].get("vm_id")
                result_is_exist_vm = nova.get_server(vm_id, ["id", "name"])
                if result_is_exist_vm.get("error") and result_is_exist_vm["error"].get("code") == 404:
                    message = "not Found vm(" + vm_id + ")"
                    data = (subject, message, sendto)
                    conn.insert(INSERT_ALARM, data)
                    return JsonResponse({"result": message})
                ctrl_header = get_ctrl_header_for_recorvery(auth_url, result_token["success"])
                result = recover_vm(recovery_info["server"], ctrl_header, domain)
                if result.get("success"):
                    recovery_info["recovery"] = True
                    conn.insert(INSERT_ALARM, (
                        subject, json.dumps(recovery_info), sendto
                    ))
                elif result.get("error"):
                    err_msg_list = result["error"]
        else:
            err_msg_list.append(result_token.get("error"))
        if len(err_msg_list) > 0:
            data = (
                subject, json.dumps(err_msg_list), sendto
            )
            d_conn.insert(INSERT_ALARM, data)
    return JsonResponse({"result": True})


def check_update_status(control, auth_url, domain, project_name, service_id):
    """
    update complete/error 날때까지 상태 체크
    :param control:
    :param auth_url:
    :param domain:
    :param project_name:
    :param service_id:
    :return:
    """
    result = {}
    ctrl_header = control.get_header()
    while True:
        result_service = control.get_service(service_id)
        if result_service.get("success"):
            status = result_service["success"]["service_detail"].get("status")
            if "UPDATE_COMPLETE" == status:
                result["success"] = {"ctrl_header": ctrl_header, "service_detail": result_service["success"]["service_detail"]}
                break
            elif "UPDATE_IN_PROGRESS" == status:
                time.sleep(10)
            else:
                result["error"] = {"message": "service update fail", "title": "update fail", "code": 500}
                break
        elif result_service.get("error") and int(result_service["error"].get("code")) == 401:
            result_token = KeystoneRestAPI.get_token(auth_url, domain.get("os_admin_id"), domain.get("os_admin_pass"),
                                                     domain.get("domain_name"), project_name)
            if result_token.get("success"):
                ctrl_header = get_ctrl_header_for_recorvery(auth_url, result_token["success"])
                control.update_header(ctrl_header)
            else:
                result["error"] = result_token.get("error")
        else:
            result["error"] = result_service.get("error")
            break
    return result


def recover_vm(recovery_server_info, ctrl_header, domain):
    """
    가상머신 장애 복구 process
    :param recovery_server_info:
    :param ctrl_header:
    :param domain:
    :return:
    """
    floating_ip_id = recovery_server_info.get("floating_ip_id")
    vm_id = recovery_server_info.get("vm_id")
    vm_name = recovery_server_info.get("vm_name")
    service_id = recovery_server_info.get("service_id")
    token = ctrl_header.get("X-Auth-Token")
    auth_url = ctrl_header.get("X-Host-Uri")
    project_name = ctrl_header.get("X-Tenant-Name")
    result = {}
    err_msg_list = []
    neutron = NeutronRestAPI(auth_url, token)
    nova = NovaRestAPI(auth_url, token)
    # floatingip 필요한 정보 추출, 삭제
    result_info_or_delete_floating_ip, floating_ip = get_floating_info_and_delete(neutron, floating_ip_id)
    # port 필요한 정보 추출, 삭제
    result_info_or_delete_port_list, port_list = get_port_list_and_delete(neutron, vm_id)
    # vm 삭제
    result_delete_server = nova.delete_server(vm_id)
    if result_info_or_delete_floating_ip:
        err_msg_list.append(result_info_or_delete_floating_ip)
    err_msg_list.extend(result_info_or_delete_port_list)
    if result_delete_server.get("error"):
        err_msg_list.append(result_delete_server["error"])

    # error 가 없으면
    if len(err_msg_list) < 1:
        control = ControlEngine(ctrl_header)
        result_template = control.get_template(service_id)
        result_map = control.get_map(service_id)

        if result_template.get("success") and result_map.get("success"):
            template = get_recovery_template(result_template["success"].get("user_template"), vm_name, port_list)
            map_data = get_recovery_map(result_map["success"], vm_name)

            result_update_map = control.update_map(service_id, map_data.replace('\\', ''))
            result_update_service = control.update_service(template, service_id)
            if result_update_service.get("success"):
                result_check = check_update_status(control, auth_url, domain, project_name, service_id)
                if result_check.get("success"):
                    vm_list = result_check["success"]["service_detail"]["vm_list"]
                    recovery_vm_name = vm_name
                    if "_recovery" in vm_name:
                        p = re.compile("_recovery\[(\d)\]")
                        m = p.search(vm_name)
                        if m:
                            recovery_cnt = m.group(1)
                            recovery_cnt = str(int(recovery_cnt) + 1)
                            recovery_vm_name = vm_name.replace("_recovery[" + m.group(1) + "]",
                                                               "_recovery[" + recovery_cnt + "]")
                    else:
                        recovery_vm_name = vm_name + "_recovery[1]"
                    vm_id = [vm.get("vm_id") for vm in vm_list if vm.get("vm_name") == recovery_vm_name][0]
                    neutron.update_token(result_check["success"]["ctrl_header"].get("X-Auth-Token"))
                    result_create_floting_ip = create_floating_ip_for_recovery(neutron, recovery_server_info, vm_id)
                    if result_create_floting_ip.get("error"):
                        err_msg_list.extend(result_create_floting_ip["error"].get("err_msg_list"))
                    else:
                        result["success"] = True
                else:
                    err_msg_list.append(result_check.get("error"))
            if result_update_service.get("error"):
                err_msg_list.append(result_update_service["error"])
            if result_update_map.get("error"):
                err_msg_list.append(result_update_map["error"])
        if result_template.get("error"):
            err_msg_list.append(result_template["error"])
        if result_map.get("error"):
            err_msg_list.append(result_map["error"])
    if len(err_msg_list) > 0:
        result["error"] = {"err_msg_list": err_msg_list}
    return result


def create_floating_ip_for_recovery(neutron, recovery_server_info, vm_id):
    """
    floating ip 생성
    :param neutron:
    :param recovery_server_info:
    :return:
    """
    result = {}
    result_external = neutron.get_external_network({"router:external": True})
    err_msg_list = []
    result_ports = neutron.get_port_list({"device_id": vm_id}, ["fixed_ips", "id", "mac_address", "network_id"])
    if result_external.get("success") and result_ports.get("success"):
        ports = result_ports["success"]["ports"]
        for port in ports:
            for fixed_ip in recovery_server_info.get("fixed_ips"):
                if port["fixed_ips"][0].get("ip_address") == fixed_ip.get("ip_address"):
                    data = {
                        "floatingip": {
                            "floating_network_id": result_external["success"]["networks"][0].get("id"),
                            "port_id": port["id"],
                            "fixed_ip_address": port["fixed_ips"][0].get("ip_address"),
                            "floating_ip_address": recovery_server_info["floating_ip_address"],
                            "description": "floating ip for recovery"
                        }
                    }
                    result = neutron.create_floating_ip(data)
    else:
        if result_ports.get("error"):
            err_msg_list.append(result_ports["error"])
        elif len(result_ports["success"].get("ports")) != 1:
            err_msg_list.append(result_ports["success"])
            # err_msg_list.append({"message": "port length is not equal 1", "title": "port get error", "code": 500})
        if result_external.get("error"):
            err_msg_list.append(result_external["error"])
        result = {"error": {"err_msg_list": err_msg_list}}
    return result


def get_ctrl_header_for_recorvery(auth_url, token_info):
    """
    control 엔진 헤더
    :param auth_url:
    :param token_info:
    :return:
    """
    return {
        "X-Auth-Token": token_info.get("token"),
        "X-Tenant-Id": token_info["project"].get("id"),
        "X-Tenant-Name": token_info["project"].get("name"),
        "X-User-Id": token_info["user"].get("id"),
        "X-User-Name": token_info["user"].get("name"),
        "X-Roles": "admin",
        "X-Host-Uri": auth_url,
        "Content-Type": "application/json"
    }


def get_floating_info_and_delete(neutron, floating_ip_id):
    """
    floating 정보 얻고 해당 floating 삭제
    :param neutron:
    :param floating_ip_id:
    :return:
    """
    result_floating_ip = neutron.get_floating_ip(floating_ip_id, ["fixed_ip_address", "floating_ip_address", "port_details"])
    floating_ip = None
    err_msg = None
    if result_floating_ip.get("success"):
        floating_ip = result_floating_ip["success"].get("floatingip")
        result_delete = neutron.delete_floating_ip(floating_ip_id)
        if result_delete.get("error"):
            err_msg = result_delete["error"]
    if result_floating_ip.get("error"):
        err_msg = result_floating_ip["error"]

    return err_msg, floating_ip


def get_port_list_and_delete(neutron, vm_id):
    """
    port 정보 얻고 해당 port 삭제
    :param neutron:
    :param vm_id:
    :return:
    """
    port_list = []
    err_msg_list = []
    result_ports = neutron.get_port_list({"device_id": vm_id}, ["fixed_ips", "id", "mac_address", "network_id"])
    if result_ports.get("success"):
        ports = result_ports["success"].get("ports")
        for port in ports:
            result_network = neutron.get_network(port.get("network_id"), ["name"])
            if result_network.get("success"):
                network = result_network["success"].get("network")
                port["network_name"] = network.get("name")
            port_list.append(port)
            result_delete = neutron.delete_port(port.get("id"))
            if result_delete.get("error"):
                err_msg_list.append(result_delete["error"])
    elif result_ports.get("error"):
        err_msg_list.append(result_ports["error"])
    return err_msg_list, port_list


def get_recovery_template(template, vm_name, port_list):
    """
    장애복구 template 수정
    :param template:
    :param vm_name:
    :param port_list:
    :return:
    """
    for vm in template.get("vm_template_list"):
        if vm.get("server_name") == vm_name:
            recovery_vm_name = vm_name
            if "_recovery" in vm_name:
                p = re.compile("_recovery\[(\d)\]")
                m = p.search(vm_name)
                if m:
                    recovery_cnt = m.group(1)
                    recovery_cnt = str(int(recovery_cnt) + 1)
                    recovery_vm_name = vm_name.replace("_recovery[" + m.group(1) + "]", "_recovery[" + recovery_cnt + "]")
            else:
                recovery_vm_name = vm_name + "_recovery[1]"
            vm["server_name"] = recovery_vm_name
            for vnic in vm.get("vnic_list"):
                for port in port_list:
                    if vnic.get("tenant_net") == port.get("network_name"):
                        vnic["ip_address"] = port["fixed_ips"][0].get("ip_address")
                        vnic["mac_address"] = port.get("mac_address")
                        vnic["public_ip"] = False
    return template


def get_recovery_map(map_data, vm_name):
    """
    장애복구 map 수정
    :param map_data:
    :param vm_name:
    :return:
    """
    recovery_vm_name = vm_name
    if "_recovery" in vm_name:
        p = re.compile("_recovery\[(\d)\]")
        m = p.search(vm_name)
        if m:
            recovery_cnt = m.group(1)
            recovery_cnt = str(int(recovery_cnt) + 1)
            recovery_vm_name = vm_name.replace("_recovery[" + m.group(1) + "]", "_recovery[" + recovery_cnt + "]")
    else:
        recovery_vm_name = vm_name + "_recovery[1]"
    map_data["map_link_list"] = json.dumps(map_data.get("map_link_list")).replace(vm_name, recovery_vm_name)
    return map_data["map_link_list"]


def detail_pop(request):
    modal_title = request.GET.get("modal_title")
    return render(request, 'monitoring/detail_chart.html', {"modal_title": modal_title})