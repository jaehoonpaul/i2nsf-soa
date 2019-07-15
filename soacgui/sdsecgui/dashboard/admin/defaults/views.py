# _*_ coding:utf-8 _*_

from django.http import JsonResponse
from django.shortcuts import render, redirect

from sdsecgui.tools.openstack_restapi import CinderRestAPI, NovaRestAPI
from sdsecgui.tools.keystone_exception import Unauthorized


def retrieveQuotaList(request):
    if request.is_ajax() and request.method == 'POST':
        # sess = login("admin", "chiron", "admin", "http://192.168.10.6/identity/v3", 'default')
        token = request.session.get('passToken')
        domain_name = request.session.get("domain_name")
        project_id = request.session.get("project_id")
        auth_url = request.session.get("auth_url")
        description = request.session.get("description")
        # sess = login(token, domain_name, project_name)
        try:
            nova = NovaRestAPI(auth_url, token)
        except Unauthorized as e:
            request.session["error"] = {"title": e.message, "message": e.details, "code":401}
            return redirect("/dashboard/login/?auth_url=" + auth_url + "&domain_name=" + domain_name + "&description=" + description)
        resultNovaQuotaList = nova.get_nova_default_quotas(project_id).get("success").get("quota_set")
        quotaList = []

        for key in resultNovaQuotaList.keys():
            if key == "id" or key == "floating_ips" or key == "security_group_rules" or key == "fixed_ips" or key == "security_groups":
                continue
            quota = {"name":key, "limit":resultNovaQuotaList[key]}
            quotaList.append(quota)

        cinder = CinderRestAPI(auth_url, token)

        resultCinderQuotaList = cinder.get_cinder_quotas_defulat(project_id).get("success")
        if resultCinderQuotaList:
            for key in resultCinderQuotaList:
                if key == "id" or key == "floating_ips" or key == "security_group_rules" or key == "fixed_ips" or key == "security_groups":
                    continue
                quota = {"name": key, "limit": resultCinderQuotaList[key]}
                quotaList.append(quota)


        return JsonResponse({"success":{ 'quotaList' : quotaList }})
    else:
        token = request.session.get('passToken')
        if not token:
            return redirect("/dashboard/domains/?next=/dashboard/admin/defaults")
        return render(request, 'admin/defaults/index.html', { 'instanceList' : "" })