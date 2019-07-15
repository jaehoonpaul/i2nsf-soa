# _*_ coding=utf-8 _*_
import datetime

from django import template

from sdsecgui.tools.zabbix_restapi import ZabbixRestAPI

register = template.Library()


@register.simple_tag
def get_conditiontype(value):
    conditiontype = {
        # Possible values for trigger actions
        "0": "host group",
        "1": "host",
        "2": "trigger",
        "3": "trigger name",
        "4": "trigger severity",
        "6": "time period",
        "13": "host template",
        "15": "application",
        "16": "maintenance status",
        "25": "event tag",
        "26": "event tag value",
        # Possible values for discovery actions
        "7": "host IP",
        "8": "discovered service type",
        "9": "discovered service port",
        "10": "discovery status",
        "11": "uptime or downtime duration",
        "12": "received value",
        "18": "discovery rule",
        "19": "discovery check",
        "20": "proxy",
        "21": "discovery object",
        # Possible values for auto-registration actions
        # "20": "proxy",
        "22": "host name",
        "24": "host metadata",
        # Possible values for internal actions
        # "0": "host group",
        # "1": "host",
        # "13": "host template",
        # "15": "application",
        "23": "event type",
    }
    return conditiontype.get(value)


@register.simple_tag
def get_operator(value):
    operator = {
        "0": "=",
        "1": "<>",
        "2": "like",
        "3": "not like",
        "4": "in",
        "5": ">=",
        "6": "<=",
        "7": "not in",
    }
    return operator.get(value)


@register.simple_tag
def get_trigger_info_and_host(trigger_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_triggers(triggerids=trigger_id, selectHosts="extend")
    if result.get("result"):
        triggers = result.get("result")
        for trigger in triggers:
            hosts = trigger.get("hosts")
            trigger["host_name"] = ""
            for host in hosts:
                trigger["host_name"] += host.get("host")
            trigger["description"] = trigger.get("description").replace("{HOST.NAME}", trigger["host_name"])
        trigger = triggers[0]
        trigger_info = trigger.get("host_name") + " : " + trigger.get("description")
    else:
        trigger_info = result
    return trigger_info


@register.simple_tag
def get_trigger_info(trigger_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_triggers(triggerids=trigger_id, selectHosts="extend")
    if result.get("result"):
        triggers = result.get("result")
        for trigger in triggers:
            hosts = trigger.get("hosts")
            trigger["host_name"] = ""
            for host in hosts:
                trigger["host_name"] += host.get("host")
            trigger["description"] = trigger.get("description").replace("{HOST.NAME}", trigger["host_name"])
        trigger = triggers[0]
        trigger_info = trigger.get("description")
    else:
        trigger_info = result
    return trigger_info


@register.simple_tag
def parse_ns_to_datetime_dic(ns):
    dt = datetime.datetime.fromtimestamp(ns / 1e9)
    return '{}.{:09.0f}'.format(dt, ns % 1e9)


@register.simple_tag
def get_user_info(user_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_user(userids=user_id)
    if result.get("result"):
        users = result.get("result")
        user_name = ""
        for user in users:
            user_name = user.get("alias")
            if user.get("name") or user.get("surname"):
                # first_name + family_name
                user_name += " ("
                if user.get("name"):
                    user_name +=user["name"]
                    if user.get("surname"):
                        user_name += " "
                if user.get("surname"):
                    user_name += user["surname"]
                user_name += ")"
        user_info = user_name
    else:
        user_info = result
    return user_info


@register.simple_tag
def get_group_info(group_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_group(usrgrpids=group_id)
    if result.get("result"):
        groups = result.get("result")
        group_name = ""
        for group in groups:
            group_name = group.get("name")
        group_info = group_name
    else:
        group_info = result
    return group_info


@register.simple_tag
def get_mediatype_info(mediatype_id):
    auth = ZabbixRestAPI.get_auth("Admin", "zabbix")
    zabbix = ZabbixRestAPI(auth)
    result = zabbix.get_mediatype(mediatypeids=mediatype_id)
    if result.get("result"):
        mediatypes = result.get("result")
        mediatype_name = ""
        for mediatype in mediatypes:
            mediatype_name = mediatype.get("description")
        mediatype_info = mediatype_name
    else:
        mediatype_info = result
    return mediatype_info


@register.simple_tag
def parse_hour(hour):
    if hour == 0:
        dt = u"즉시"
    else:
        dt = datetime.timedelta(hours=hour)
    return '{}'.format(dt)


@register.simple_tag
def second_to_string(sec):
    second = int(sec)
    return datetime.datetime(1970, 1, 1) + datetime.timedelta(seconds=second)


@register.simple_tag
def nanosecond_to_string(ns):
    second = int(ns) / 1000
    td = datetime.timedelta(seconds=second)
    result = ""
    if td.days > 0:
        result += str(td.days) + "d "

    if td.seconds // 3600 > 0:
        result += str(td.seconds // 3600) + "h "

    if (td.seconds // 60) % 60 > 0:
        result += str((td.seconds // 60) % 60) + "m "

    return result


@register.simple_tag
def calc_recovery_time(event_time, ns):
    second = int(event_time) + int(int(ns) / 1000)
    return datetime.datetime(1970, 1, 1) + datetime.timedelta(seconds=second)
