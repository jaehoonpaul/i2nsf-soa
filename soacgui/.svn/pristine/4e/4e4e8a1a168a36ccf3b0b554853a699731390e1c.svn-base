# _*_ coding:utf-8 _*_
import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from sdsecgui.dashboard.views import common_login
from sdsecgui.tools.openstack_restapi import KeystoneRestAPI
from sdsecgui.tools.ctrlengine import ControlEngine
from sdsecgui.db.soa_db_connector import SOAManagerDBConnector
from sdsecgui.db.db_connector import SOAControlDBConnector
from sdsecgui.db.query import *
from sdsecgui.db.soa_query import *

logger = logging.getLogger("myapp.myLogger")


@csrf_exempt
def admin_login_soa(request):
    if request.method == 'POST':
        user_name = request.POST.get("user_name")
        password = request.POST.get("pass")
        auth_url = request.POST.get("auth_url")
        project_name = request.POST.get("project_name")
        logger.info("{}\n{}\n{}\n{}".format(user_name, password, auth_url, project_name))

        conn = SOAControlDBConnector.getInstance()
        try:
            select_domain = conn.select_one(SELECT_SOAC_DOMAINS, auth_url)
            domain_name = select_domain.get("domain_name")

        except Exception as e:
            result = {"error": {"message": str(e), "title": "error"}}
            logger.info("ajaxLoginPOST_error_end")
            return JsonResponse(result)

        result = common_login(request, auth_url, user_name, password, domain_name, project_name)
        logger.info("ajaxLoginPOST_end: {}".format(result))
        return JsonResponse(result)


def login_soa(request):
    data = None
    try:
        data = json.loads(request.POST.get("data"))
    except ValueError as e:
        result = {"error": {"title": e.message, "message": "json malformed error"}}
    else:
        auth_url = data.get("auth_url")
        user_name = data.get("user_name")
        password = data.get("pass")
        project_name = data.get("project_name")
        soac_conn = SOAControlDBConnector.getInstance()
        if auth_url == request.session.get("auth_url"):
            domain_name = request.session.get("domain_name")
        else:
            domain = soac_conn.select_one(SELECT_SOAC_DOMAINS, auth_url)
            domain_name = domain.get("domain_name")

        token = None
        roles = None
        roles_str = None
        project_id = None
        user_id = None
        keystone = None

        # =================================Scope Login==================================
        result = KeystoneRestAPI.get_token(auth_url, user_name, password, domain_name, project_name)
        # if type(result) == str:
        #     result = ast.literal_eval(result)  # str 타입을 dictionary 타입으로 바꿈
        if result.get('success'):
            user = result["success"].get("user")
            domain_id = user["domain"].get("id")
            if not roles:
                roles = result["success"].get("roles")
            request.session["domain_id"] = domain_id
            token = result['success']['token']
            user_id = user.get("id")
            if keystone is None:
                keystone = KeystoneRestAPI(auth_url, token)
            keystone.update_token(token)

            roles_str = ','.join(role.get("name") for role in roles)

            ctrl_engine = ControlEngine(token=token, project_id=project_id, project_name=project_name, user_id=user_id,
                                        user_name=user_name, roles=roles_str, auth_url=auth_url)
            request.session["ctrl_header"] = ctrl_engine.get_header()
        # ================================================
        request.session["passToken"] = token
        request.session["user_name"] = user_name
        request.session["domain_name"] = domain_name
        request.session["project_name"] = project_name
        request.session["auth_url"] = auth_url
        if roles_str:
            request.session["roles"] = roles_str
        else:
            request.session["roles"] = None
        if user_id:
            request.session["user_id"] = user_id
        if project_id:
            request.session["project_id"] = project_id

    return result, data


@csrf_exempt
def create_project_for_soa(request):
    if request.method == 'POST':
        result, data = login_soa(request)
        if result.get("success"):
            token = request.session.get("passToken")
            auth_url = data.get("auth_url")
            project = data.get("project")
            data = {"project": {
                "name": project.get("name"),
                "description": project.get("description"),
                "domain_id": request.session.get("domain_id"),
                "enabled": True,
                "is_domain": False,
            }}

            keystone = KeystoneRestAPI(auth_url, token)
            result = keystone.create_project(data)
            if result.get("success"):  # 프로젝트 생성 성공
                project_id = result["success"]["project"].get("id")
                try:
                    soac_conn = SOAControlDBConnector.getInstance()
                    params = (auth_url, project_id, project.get("name"))
                    soac_conn.insert(INSERT_SOAC_PROJECT, params)
                except Exception as e:
                    logger.debug("soac 프로젝트 생성 실패(" + project.get("name") + ")" + str(e))
                    result = {"error": {"title": e.message, "message": "soac db insert project error", "code": 500}}

                try:
                    soam_conn = SOAManagerDBConnector.getInstance()
                    params = (auth_url, project_id, project.get("name"), project.get("description"))
                    soam_conn.insert(INSERT_SOAM_PROJECT, params)
                except Exception as e:
                    logger.debug("soam 프로젝트 생성 실패(" + project.get("name") + ")" + str(e))
                    result = {"error": {"title": e.message, "message": "soam db insert project error", "code": 500}}

        return JsonResponse(result)


@csrf_exempt
def create_user_for_soa(request):
    if request.method == 'POST':
        result, data = login_soa(request)
        if result.get("success"):
            token = request.session.get("passToken")
            auth_url = data.get("auth_url")
            user_list = data.get("user")

            response_data = {}
            for user in user_list:
                data = {
                    "user": {
                        "default_project_id": user.get("default_project_id"),
                        "name": user.get("name"),
                        "password": user.get("password"),
                        "email": user.get("email"),
                        "domain_id": request.session.get("domain_id"),
                        "enabled": True,
                        "description": u"SOA 관리포털에서 생성"
                    }
                }

                keystone = KeystoneRestAPI(auth_url, token)
                result = keystone.create_user(data)
                if result.get("success"):
                    created_user = result["success"].get("user")

                    params = (
                        auth_url,
                        created_user.get("default_project_id"),
                        created_user.get("id"),
                        created_user.get("name")
                    )

                    try:
                        soa_conn = SOAControlDBConnector.getInstance()
                        soa_conn.insert(INSERT_SOAC_USER, params)
                    except Exception as e:
                        logger.debug("soac 사용자 생성 실패(" + created_user.get("name") + ")" + str(e))
                        result = {"error": {"title": e.message, "message": "soac db insert user error", "code": 500}}
                        # end except
                    # end if
                response_data[user.get("name")] = result
                # end for
            result = response_data
            # end if
        return JsonResponse(result)


@csrf_exempt
def delete_user_for_soa(request):
    if request.method == 'POST':
        result, data = login_soa(request)
        if result.get("success"):
            token = request.session.get("passToken")
            auth_url = data.get("auth_url")
            user_list = json.loads(data.get("user"))

            response_data = {}
            for user_id in user_list:
                keystone = KeystoneRestAPI(auth_url, token)
                result = keystone.delete_user(user_id)
                if result.get("success"):
                    deleted_user = result["success"].get("user")

                    params = (
                        auth_url,
                        user_id
                    )

                    try:
                        soa_conn = SOAControlDBConnector.getInstance()
                        soa_conn.delete(INSERT_SOAC_USER, params)
                    except Exception as e:
                        logger.debug("soac 사용자 삭제 실패(" + deleted_user.get("name") + ")" + str(e))
                        result = {"error": {"title": e.message, "message": "soac db insert user error", "code": 500}}
                        # end except
                    # end if
                response_data[user_id.get("name")] = result
                # end for
            result = response_data
            # end if

        return JsonResponse(result)
