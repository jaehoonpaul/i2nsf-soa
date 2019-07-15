# _*_ coding:utf-8 _*_
import ast
import json
import os
import requests
import logging

from sdsec.settings import config
from keystone_exception import Unauthorized
from sdsecgui.tools.custom_httpclient import CustomHTTPClient

logger = logging.getLogger("myapp.myLogger")
section = "SETTINGS"
LOG_LEVEL = config.get(section, "LOG_LEVEL")


class KeystoneRestAPI:
    def __init__(self, auth_url, token):
        self.AUTH_URL = auth_url
        self.TOKEN = token
        # headers = {'Accept': 'application/json', 'X-Auth-Token': token, 'X-Subject-Token': token}
        # response = CustomHTTPClient.get_method(auth_url + '/auth/tokens', headers=headers)
        # check = CustomHTTPClient.confirm_status(response)
        # if check.get("error"):
        #     raise Unauthorized(check.get("error").get("title"), check.get("error").get("message"))

    @staticmethod
    def check_status(auth_url):
        response = CustomHTTPClient.get_method(auth_url)
        content = response.json()
        return content

    @staticmethod
    def get_unscoped_token_with_token(auth_url, token):
        body = {
            "auth": {
                "identity": {
                    "methods": [
                        "token"
                    ],
                    "token": {
                        "id": token
                    }
                },
                "scope": "unscoped"
            }
        }
        response = CustomHTTPClient.post_method(auth_url + '/auth/tokens', body=body)
        content = response.json()
        log_str = """
        ============================= Request ================================
        body: {}
        ============================= Response ===============================
        url: {}
        status: {}
        contents: {}
        =========================== end Response =============================""".format(body, response.url, str(response.status_code), content)
        logger.debug(log_str)
        if response.status_code == 201:
            return response.headers['X-Subject-Token']
        else:
            raise Unauthorized()


    @staticmethod
    def get_token(auth_url, user_name, password, domain_name, project_name=None):
        """
        토큰 얻기
        :param auth_url:
        :param user_name:
        :param password:
        :param domain_name:
        :param project_name:
        :return:
        """
        headers = {'Accept': 'application/json'}
        body = {
            'auth': {
                'identity': {
                    'methods': ['password'],
                    'password': {
                        'user': {
                            'name': user_name,
                            'password': password,
                            'domain': {'name': domain_name}
                        }
                    }
                },
            }
        }
        if project_name:
            body["auth"]["scope"] = {
                'project': {
                    'name': project_name,
                    'domain': {'name': domain_name}
                }
            }
        try:
            response = CustomHTTPClient.post_method(auth_url + '/auth/tokens', headers=headers, body=body)
            content = response.json()
            log_str = """
            ============================= Request ================================
            header: {}
            body: {}
            ============================= Response ===============================
            url: {}
            status: {}
            contents: {}
            =========================== end Response =============================""".format(headers, body, response.url, str(response.status_code), content)
            logger.debug(log_str)
            if response.status_code == 201:
                result = {
                    'success': {
                        'message': 'The token issued', 'code': 201,
                        'token': response.headers['X-Subject-Token'],
                        'user': content['token'].get('user'),
                    }
                }
                if content["token"].get("project"):
                    result["success"]["project"] = content['token'].get('project')
                if content["token"].get("roles"):
                    result["success"]["roles"] = content['token'].get('roles')
                if content["token"].get("catalog"):
                    result["success"]["catalog"] = content['token'].get('catalog')
                return result
            else:
                return response.json()
        except BaseException as e:
            result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
            return result

    @staticmethod
    def get_service_url(auth_url, token, service_type, auth_type):
        """
        서비스 url 얻기
        :param auth_url:
        :param token: token
        :param service_type:
            "identity", "compute", "network",  "image", "volume", "volumev2", "orchestration", "cloudformation",   "metering", "alarming"
            "keystone",    "nova", "neutron", "glance", "cinder", "cinderv2",          "heat",       "heat-cfn", "ceilometer",     "aodh"
        :param auth_type: "public", "internal", "admin"
        :return:
        """
        if auth_url is None or token is None:
            raise Unauthorized()
        url = auth_url + "/auth/tokens"
        response_body = CustomHTTPClient.get_with_token(token, url, subject=token, log=False)
        if response_body.get("success"):
            if response_body["success"].get("token"):
                if response_body["success"]["token"].get("catalog"):
                    catalog_list = response_body["success"]["token"].get("catalog")

                    for catalog in catalog_list:
                        if catalog.get("type") == service_type:
                            for endpoint in catalog.get('endpoints'):
                                if endpoint['interface'] == auth_type:
                                    service_url = endpoint['url']
                                    result = service_url
                                    return result
        else:
            return response_body

    def get_token_with_scoped_by_token(self, domain_name=None, project_id=None, project_name=None):
        """
        토큰으로 스코프 방식 로그인(토큰 얻기)
        :param domain_name:
        :param project_id:
        :param project_name:
        :return:
        """
        body = {
            'auth': {
                'identity': {
                    'methods': ['token'],
                    'token': {
                        'id': self.TOKEN
                    }
                }
            }
        }

        if domain_name and project_name:
            body["auth"]["scope"] = {
                'project': {
                    'name': project_name,
                    'domain': {'name': domain_name}
                }
            }
        elif domain_name:
            body["auth"]["scope"] = {
                'domain': {'name': domain_name}
            }
        elif project_id:
            body["auth"]["scope"] = {
                'project': {'id': project_id}
            }

        url = self.AUTH_URL + '/auth/tokens'
        headers = {'Accept': 'application/json', 'X-Auth-Token': self.TOKEN}
        response = requests.post(url, headers=headers, json=body)
        if response.status_code == 201:
            result = {'success': {
                'message': 'The token issued', 'code': 201,
                'token': response.headers['X-Subject-Token']
            }}
            temp = CustomHTTPClient.confirm_status(response)
            if temp.get("success"):
                result["success"]["user"] = temp["success"]["token"].get("user")
                result["success"]["project"] = temp["success"]["token"].get("project")
                result["success"]["roles"] = temp["success"]["token"].get("roles")
            return result
        else:
            return CustomHTTPClient.confirm_status(response)

    def update_token(self, token):
        """
        KeystoneRestAPI 객체 토큰 변경
        :param token:
        :return:
        """
        self.TOKEN = token

    def get_info_for_token(self, subject=None):
        """
        토큰 정보 조회
        :param subject:
        :return:
        """
        url = self.AUTH_URL + "/auth/tokens"
        if not subject:
            subject = self.TOKEN
        return CustomHTTPClient.get_with_token(self.TOKEN, url, subject)

    def revoke_token(self, subject=None):
        url = self.AUTH_URL + "/auth/tokens"
        if subject is None:
            subject = self.TOKEN
        return CustomHTTPClient.delete_with_token(self.TOKEN, url, subject=subject)

    def get_endpoint_list(self):
        """
        endpoint 리스트 조회
        :return:
        """
        url = self.AUTH_URL + "/endpoints"
        return CustomHTTPClient.get_with_token(self.TOKEN, url).get("success").get("endpoints")

    def get_domain_list(self, q=None):
        """
        도메인 리스트 조회
        :param q:
        :return:
        """
        url = self.AUTH_URL + "/domains"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_available_domain_scopes(self):
        """
        사용가능한 도메인 스코프 리스트 조회
        :return:
        """
        url = self.AUTH_URL + "/auth/domains"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_available_project_scopes(self):
        """
        사용가능한 프로젝트 스코프 리스트 조회
        :return:
        """
        url = self.AUTH_URL + "/auth/projects"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def create_project(self, q):
        """
        프로젝트 생성
        :param q: {
            "project": {
                "description": "My new project",
                "domain_id": "default",
                "enabled": true,
                "is_domain": false,
                "name": "myNewProject"
            }
        }
        :return:
        """
        if not q["project"].get("is_domain"):
            q["project"]["is_domain"] = False
        url = self.AUTH_URL + "/projects"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_project_list(self, q=None, fields=None):
        """
        프로젝트 리스트 조회
        :param q:
        :return:
        """
        url = self.AUTH_URL + "/projects"
        query = {}
        if fields:
            query["fields"] = fields
        if q:
            query.update(q)
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_project(self, project_id, q=None, fields=None):
        """
        프로젝트 조회
        :param project_id:
        :param q:
        :param fields:
        :return:
        """
        url = self.AUTH_URL + "/projects/" + project_id
        f = {}
        if fields:
            f["fields"] = fields
        if q:
            f.update(q)
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, f)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_project(self, project_id, q):
        """
        프로젝트 수정
        :param project_id: 
        :param q: 
        :return: 
        """
        if not q["project"].get("is_domain"):
            q["project"]["is_domain"] = False
        url = self.AUTH_URL + "/projects/" + project_id
        return CustomHTTPClient.patch_with_token(self.TOKEN, url, q)

    def delete_project(self, project_id):
        """
        프로젝트 삭제
        :param project_id:
        :return:
        """
        url = self.AUTH_URL + "/projects/" + project_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def assign_role_to_user_on_projects(self, project_id, user_id, role_id):
        """
        프로젝트에 사용자 추가, 역할 할당
        :param project_id:
        :param user_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/projects/" + project_id + "/users/" + user_id + "/roles/" + role_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url)

    def unassign_role_to_user_on_projects(self, project_id, user_id, role_id):
        """
        프로젝트에서 사용자 삭제, 역할 할당 해제
        :param project_id:
        :param user_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/projects/" + project_id + "/users/" + user_id + "/roles/" + role_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def inherited_role_to_user_on_projects(self, project_id, user_id, role_id):
        """
        프로젝트에 사용자 추가, 역할 상속
        :param project_id:
        :param user_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/OS-INHERIT"
        url += "/projects/" + project_id + "/users/" + user_id + "/roles/" + role_id + "/inherited_to_projects"
        return CustomHTTPClient.put_with_token(self.TOKEN, url)

    def revoke_role_to_user_on_projects(self, project_id, user_id, role_id):
        """
        프로젝트에 사용자 제거, 역할 상속 제거
        :param project_id:
        :param user_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/OS-INHERIT"
        url += "/projects/" + project_id + "/users/" + user_id + "/roles/" + role_id + "/inherited_to_projects"
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def assign_role_to_group_on_projects(self, project_id, group_id, role_id):
        """
        프로젝트에 그룹 추가, 역할 할당
        :param project_id:
        :param group_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/projects/" + project_id + "/groups/" + group_id + "/roles/" + role_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url)

    def unassign_role_to_group_on_projects(self, project_id, group_id, role_id):
        """
        프로젝트에서 그룹 삭제, 역할 할당 해제
        :param project_id:
        :param group_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/projects/" + project_id + "/groups/" + group_id + "/roles/" + role_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def inherited_role_to_group_on_projects(self, project_id, group_id, role_id):
        """
        프로젝트에 그룹 추가, 역할 상속
        :param project_id:
        :param group_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/OS-INHERIT"
        url += "/projects/" + project_id + "/groups/" + group_id + "/roles/" + role_id + "/inherited_to_projects"
        return CustomHTTPClient.put_with_token(self.TOKEN, url)

    def revoke_role_to_group_on_projects(self, project_id, group_id, role_id):
        """
        프로젝트에 그룹 제거, 역할 상속 제거
        :param project_id:
        :param group_id:
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/OS-INHERIT"
        url += "/projects/" + project_id + "/groups/" + group_id + "/roles/" + role_id + "/inherited_to_projects"
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def get_role_assignments(self, fields=None):
        """
        할당된 역할 리스트
        :param fields:{
            "role.id": "{uuid}",
            "user.id": "{uuid}",
            "scope.project.id":"{uuid}",
            "scope.domain.id":"{uuid}"
        }
        :return:
        """
        url = self.AUTH_URL + "/role_assignments"
        if fields:
            url = CustomHTTPClient.create_url_by_query(url, fields)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def create_user(self, q):
        """
        사용자 생성
        :param q: {
            "user": {
                "default_project_id": "263fd9",
                "domain_id": "1789d1",
                "enabled": true,
                "name": "jsKang",
                "password": "secretsecret",
                "description": "jsKang user",
                "email": "jskang@chironsoft.com"
            }
        }
        :return:
        """
        url = self.AUTH_URL + "/users"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_user(self, user_id):
        """
        사용자 조회
        :param user_id:
        :return:
        """
        url = self.AUTH_URL + "/users/" + user_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_user_list(self, q=None):
        """
        사용자 리스트 조회
        :param q:
        :return:
        """
        url = self.AUTH_URL + "/users"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_user(self, user_id, q):
        """
        사용자 수정
        :param user_id:
        :param q:
        :return:
        """
        url = self.AUTH_URL + "/users/" + user_id
        return CustomHTTPClient.patch_with_token(self.TOKEN, url, q)

    def update_password_of_user(self, user_id, q):
        """
        사용자 비밀번호 수정
        :param user_id:
        :param q:{
            "user": {
                "password": "new_secretsecret",
                "original_password": "secretsecret"
            }
        }
        :return:
        """
        url = self.AUTH_URL + "/users/" + user_id + "/password"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def delete_user(self, user_id):
        """
        사용자 삭제
        :param user_id:
        :return:
        """
        url = self.AUTH_URL + "/users/" + user_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def get_project_list_for_user(self, user_id):
        """
        사용자의 프로젝트 목록 조회
        :param user_id:
        :return:
        """
        url = self.AUTH_URL + "/users/" + user_id + "/projects"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_default_project_id(self, user_id):
        """
        사용자 default 프로젝트 조회
        :param user_id:
        :return:
        """
        result = self.get_user(user_id)
        default_project_id = None
        if result.get("success"):
            default_project_id = result["success"].get("user").get("default_project_id")
        return default_project_id

    def get_group_list_for_user(self, user_id):
        """
        사용자의 그룹 목록 조회
        :param user_id:
        :return:
        """
        url = self.AUTH_URL + "/users/" + user_id + "/groups"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_role_for_user(self):
        """
        사용자 역할 조회
        :return:
        """
        result = self.get_info_for_token()
        roles_str = None
        if result.get("success"):
            roles = result["success"]["token"].get("roles")
            roles_str = ','.join(role.get("name") for role in roles)
        return roles_str

    def create_role(self, q):
        """
        역할 생성
        :param q:{
            "role": {
                "domain_id": "92e782c4988642d783a95f4a87c3fdd7", #(option)
                "name": "developer"
            }
        }
        :return:
        """
        url = self.AUTH_URL + "/roles"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_role_list(self, q=None):
        """
        역할 목록 조회
        :return:
        """
        url = self.AUTH_URL + "/roles"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_role(self, role_id):
        """
        역할 조회
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/roles/" + role_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_role(self, role_id, q):
        """
        역할 수정
        :param role_id:
        :param q:
        :return:
        """
        url = self.AUTH_URL + "/roles/" + role_id
        return CustomHTTPClient.patch_with_token(self.TOKEN, url, q)

    def delete_role(self, role_id):
        """
        역할 삭제
        :param role_id:
        :return:
        """
        url = self.AUTH_URL + "/roles/" + role_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def create_group(self, q):
        """
        그룹 생성
        :param q:{
            "group": {
                "description": "Contract developers",
                "domain_id": "default",
                "name": "Contract developers"
            }
        }
        :return:
        """
        url = self.AUTH_URL + "/groups"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_group_list(self, q=None):
        """
        그룹 목록 조회
        :return:
        """
        url = self.AUTH_URL + "/groups"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_group(self, group_id):
        """
        그룹 조회
        :param group_id:
        :return:
        """
        url = self.AUTH_URL + "/groups/" + group_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_group(self, group_id, q):
        """
        그룹 수정
        :param group_id:
        :param q:
        :return:
        """
        url = self.AUTH_URL + "/groups/" + group_id
        return CustomHTTPClient.patch_with_token(self.TOKEN, url, q)

    def delete_group(self, group_id):
        """
        그룹 삭제
        :param group_id:
        :return:
        """
        url = self.AUTH_URL + "/groups/" + group_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def get_users_in_group(self, group_id):
        """
        그룹내 사용자 목록 조회
        :param group_id:
        :return:
        """
        url = self.AUTH_URL + "/groups/" + group_id + "/users"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def add_user_to_group(self, group_id, user_id):
        """
        그룹에 사용자 추가
        :param group_id:
        :param user_id:
        :return:
        """
        url = self.AUTH_URL + "/groups/" + group_id + "/users/" + user_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url)

    def remove_user_to_group(self, group_id, user_id):
        """
        그룹에서 사용자 제거
        :param group_id:
        :param user_id:
        :return:
        """
        url = self.AUTH_URL + "/groups/" + group_id + "/users/" + user_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def get_service_list(self):
        """
        서비스 목록 조회
        :return:
        """
        url = self.AUTH_URL + "/services"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_limits(self, q=None):
        """

        :param q:
        :return:
        """
        url = self.AUTH_URL + "/registered_limits"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        CustomHTTPClient.get_with_token(self.TOKEN, self.AUTH_URL + "/limits")
        return CustomHTTPClient.get_with_token(self.TOKEN, url)


class NovaRestAPI:
    def __init__(self, auth_url, token):
        self.AUTH_URL = auth_url
        service_type = "compute"
        auth_type = "public"
        self.NOVA_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        self.TOKEN = token
        if "controller" in self.NOVA_URL:
            self.NOVA_URL = self.NOVA_URL.replace("controller", auth_url[auth_url.index("://") + 3:auth_url.rindex(
                ":")])  # + "/compute/v2.1"
        # elif type(self.NOVA_URL) == dict and self.NOVA_URL.get("success"):
        elif type(self.NOVA_URL) == dict and self.NOVA_URL.get("error"):
            raise Unauthorized(self.NOVA_URL.get("error").get("title"), self.NOVA_URL.get("error").get("message"))

    def update_token(self, token):
        self.TOKEN = token

    def create_server(self, q):
        """
        q = {
            "server": {
                "accessIPv4": "1.2.3.4",
                "accessIPv6": "80fe::",
                "name": "new-server-test",
                "imageRef": "70a599e0-31e7-49b7-b260-868f441e862b",
                "flavorRef": "1",
                "availability_zone": "nova",
                "OS-DCF:diskConfig": "AUTO",
                "metadata": {
                    "My Server Name": "Apache1"
                },
                "personality": [
                    {
                        "path": "/etc/banner.txt",
                        "contents": "ICAgICAgDQoiQSBjbG91ZCBkb2VzIG5vdCBrbm93IHdoeSBp dCBtb3ZlcyBpbiBqdXN0IHN1Y2ggYSBkaXJlY3Rpb24gYW5k IGF0IHN1Y2ggYSBzcGVlZC4uLkl0IGZlZWxzIGFuIGltcHVs c2lvbi4uLnRoaXMgaXMgdGhlIHBsYWNlIHRvIGdvIG5vdy4g QnV0IHRoZSBza3kga25vd3MgdGhlIHJlYXNvbnMgYW5kIHRo ZSBwYXR0ZXJucyBiZWhpbmQgYWxsIGNsb3VkcywgYW5kIHlv dSB3aWxsIGtub3csIHRvbywgd2hlbiB5b3UgbGlmdCB5b3Vy c2VsZiBoaWdoIGVub3VnaCB0byBzZWUgYmV5b25kIGhvcml6 b25zLiINCg0KLVJpY2hhcmQgQmFjaA=="
                    }
                ],
                "security_groups": [
                    {
                        "name": "default"
                    }
                ],
                "user_data": "IyEvYmluL2Jhc2gKL2Jpbi9zdQplY2hvICJJIGFtIGluIHlvdSEiCg=="
            },
            "OS-SCH-HNT:scheduler_hints": {
                "same_host": "48e6a9f6-30af-47e0-bc04-acaed113bb4e"
            }
        }
        """
        url = self.NOVA_URL + "/servers"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_server(self, server_id, fields=None):
        url = self.NOVA_URL + "/servers/" + server_id
        query = {}
        if fields:
            query["fields"] = fields
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_server_list(self, q=None, fields=None):
        url = self.NOVA_URL + "/servers"
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_server_detail_list(self, q=None, fields=None):
        url = self.NOVA_URL + "/servers/detail"
        query = {}
        if q:
            query = q

        if fields:
            query["fields"] = fields
        if q or fields:
            url = CustomHTTPClient.create_url_by_query(url, query)

        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_server(self, server_id, q):
        url = self.NOVA_URL + "/servers/" + server_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, q)

    def delete_server(self, server_id):
        url = self.NOVA_URL + "/servers/" + server_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def action_server(self, server_id, q):
        url = self.NOVA_URL + "/servers/" + server_id + "/action"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def remote_consoles_server(self, server_id):
        url = self.NOVA_URL + "/servers/" + server_id + "/remote-consoles"
        q = {
            "remote_console": {
                "protocol": "vnc",
                "type": "novnc"
            }
        }
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_usages(self, start, end, tenant_id=None):
        url = self.NOVA_URL + "/os-simple-tenant-usage"

        if tenant_id:
            url += "/" + tenant_id

        q = { "start": start, "end": end, "detailed": "1"}
        url = CustomHTTPClient.create_url_by_query(url, q)

        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_flavor(self, flavor_id):
        url = self.NOVA_URL + "/flavors/" + flavor_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_flavor_list(self):
        url = self.NOVA_URL + "/flavors"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_flavor_detail_list(self):
        url = self.NOVA_URL + "/flavors/detail"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def create_flavor(self, q):
        """
        {
            "flavor": {
                "name": "test_flavor",
                "ram": 1024,
                "vcpus": 2,
                "disk": 10,
                "id": "10",
                "rxtx_factor": 2.0
            }
        }
        :param q:
        :return:
        """
        url = self.NOVA_URL + "/flavors"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def update_flavor(self, flavor_id, q):
        url = self.NOVA_URL + "/flavors/" + flavor_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, q)

    def delete_flavor(self, flavor_id):
        url = self.NOVA_URL + "/flavors/" + flavor_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def add_flavor_access(self, flavor_id, project_id_list):
        url = self.NOVA_URL + "/flavors/" + flavor_id + "/action"
        result = {}
        for project_id in project_id_list:
            body = {"addTenantAccess": {"tenant": project_id}}
            result[project_id] = CustomHTTPClient.post_with_token(self.TOKEN, url, body)
            if result[project_id].get("error"):
                if not result.get("error"):
                    result["error"] = {"title": "accessFail", "message": "access add fail Project list is [" + project_id}
                else:
                    result["error"]["message"] += ", " + project_id
        if result.get("error"):
            result["error"]["message"] += "]"
        return result

    def get_flavor_access(self, flavor_id):
        url = self.NOVA_URL + "/flavors/" + flavor_id + "/os-flavor-access"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def remove_flavor_access(self, flavor_id, project_id_list):
        url = self.NOVA_URL + "/flavors/" + flavor_id + "/action"
        result = {}
        for project_id in project_id_list:
            body = {"removeTenantAccess": {"tenant": project_id}}
            result[project_id] = CustomHTTPClient.post_with_token(self.TOKEN, url, body)
            if result[project_id].get("error"):
                if not result.get("error"):
                    result["error"] = {"title": "accessFail", "message": "access remove fail Project list is [" + project_id}
                else:
                    result["error"]["message"] += ", " + project_id
        return result

    def get_quotas(self, project_id):
        url = self.NOVA_URL + "/os-quota-sets/" + project_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_nova_default_quotas(self, project_id):
        url = self.NOVA_URL + "/os-quota-sets/" + project_id + "/defaults"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_aggregate_list(self):
        url = self.NOVA_URL + "/os-aggregates"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_aggregate(self, aggregate_id):
        url = self.NOVA_URL + "/os-aggregates/" + aggregate_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def create_aggregate(self, data):
        """
        :param data: {
            "aggregate": {
                "name": "name",
                "availability_zone": "london"
            }
        }
        :return:
        """
        url = self.NOVA_URL + "/os-aggregates"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, data)

    def update_aggregate(self, aggregate_id, data):
        url = self.NOVA_URL + "/os-aggregates/" + aggregate_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, data)

    def delete_aggregate(self, aggregate_id):
        url = self.NOVA_URL + "/os-aggregates/" + aggregate_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def add_host_to_aggregate(self, aggregate_id, add_host):
        url = self.NOVA_URL + "/os-aggregates/" + str(aggregate_id) + "/action"
        data = {"add_host": {"host": str(add_host)}}
        return CustomHTTPClient.post_with_token(self.TOKEN, url, data)

    def remove_host_to_aggregate(self, aggregate_id, remove_host):
        url = self.NOVA_URL + "/os-aggregates/" + str(aggregate_id) + "/action"
        data = {"remove_host": {"host": str(remove_host)}}
        return CustomHTTPClient.post_with_token(self.TOKEN, url, data)

    def get_compute_service(self, q=None):
        url = self.NOVA_URL + "/os-services"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_availability_zone(self):
        url = self.NOVA_URL + "/os-availability-zone"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_availability_zone_detail(self):
        url = self.NOVA_URL + "/os-availability-zone/detail"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_nova_service_list(self):
        url = self.NOVA_URL + "/os-services"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_keypairs_list(self, q=None):
        url = self.NOVA_URL + "/os-keypairs"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_hypervisor_list(self, q=None):
        url = self.NOVA_URL + "/os-hypervisors"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_hypervisor_detail_list(self, q=None):
        url = self.NOVA_URL + "/os-hypervisors/detail"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_limits(self, q=None):
        url = self.NOVA_URL + "/limits"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_quotas(self, project_id, quota):
        url = self.NOVA_URL + "/os-quota-sets/" + project_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, quota)


class CeilometerRestAPI:
    def __init__(self, auth_url, token):
        service_type = "metering"
        auth_type = "public"
        self.CEILOMETER_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        self.TOKEN = token
        if "controller" in self.CEILOMETER_URL:
            self.CEILOMETER_URL = self.CEILOMETER_URL.replace("controller",
                                                              auth_url[auth_url.index("://") + 3: auth_url.rindex(":")])
        elif type(self.CEILOMETER_URL) == dict and self.CEILOMETER_URL.get("error"):
            raise Unauthorized(self.CEILOMETER_URL.get("error").get("title"), self.CEILOMETER_URL.get("error").get("message"))
        self.CEILOMETER_URL = self.CEILOMETER_URL + "/v2"

    def getResource(self, resource_id):
        url = self.CEILOMETER_URL + "/resources/" + resource_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_samples(self, q=None):
        url = self.CEILOMETER_URL + "/samples"
        query = {}
        if q:
            query.update(q)
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_resource_list(self, q=None, fields=None):
        url = self.CEILOMETER_URL + "/resources"
        logger.debug("[CURL GET]" + url)
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, query)

        result = CustomHTTPClient.get_with_token(self.TOKEN, url, log=False)
        return result

    def getMeterList(self, q=None, limit=None, unique=None):
        url = self.CEILOMETER_URL + "/meters"
        data = {}
        if limit:
            data["limit"] = limit
        if unique:
            data["unique"] = unique
        if limit or unique:
            url = CustomHTTPClient.create_url_by_query(url, data)
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)

        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def getMeter(self, q=None, limit=None, unique=False):
        url = self.CEILOMETER_URL + "/meters"
        data = {}
        if limit:
            data["limit"] = limit
        if unique:
            data["unique"] = unique
        if limit or unique:
            url = CustomHTTPClient.create_url_by_query(url, data)
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)

        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def getStatisticsList(self, meter_name, query=None, period=None, groupby=None, aggregates=None):
        url = self.CEILOMETER_URL + "/meters/" + meter_name + "/statistics"
        logger.debug("[CURL GET]" + url)
        data = {}
        if query:
            data["query"] = query
        if period:
            data["period"] = period
        if groupby:
            data["groupby"] = groupby
        if aggregates:
            data["aggregates"] = aggregates
        if query or period or groupby or aggregates:
            url = CustomHTTPClient.create_url_by_query(url, data)
        result = CustomHTTPClient.get_with_token(self.TOKEN, url, log=False)
        return result

    def getStatisticsListWithJson(self, meter_name, query=None, period=None, groupby=None, aggregates=None):
        url = self.CEILOMETER_URL + "/meters/" + meter_name + "/statistics"
        data = {}
        if query:
            data["query"] = query
        if period:
            data["period"] = period
        if groupby:
            data["groupby"] = groupby
        if aggregates:
            data["aggregates"] = aggregates
        if query or period or groupby or aggregates:
            url = CustomHTTPClient.create_url_by_query(url, data)

        return CustomHTTPClient.get_with_token(self.TOKEN, url)


class AodhRestAPI:
    AODH_URL = ""
    TOKEN = ""

    def __init__(self, auth_url, token):
        service_type = "alarming"
        auth_type = "public"
        self.AODH_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        self.TOKEN = token
        if "controller" in self.AODH_URL:
            self.AODH_URL = self.AODH_URL.replace("controller",
                                                  auth_url[auth_url.index("://") + 3:auth_url.rindex(":")])
        elif type(self.AODH_URL) == dict and self.AODH_URL.get("error"):
            raise Unauthorized(self.AODH_URL.get("error").get("title"), self.AODH_URL.get("error").get("message"))
        self.AODH_URL += "/v2"

    def update_token(self, token):
        self.TOKEN = token

    def create_alarm(self, q):
        url = self.AODH_URL + "/alarms"
        result = CustomHTTPClient.post_with_token(self.TOKEN, url, q)
        return result
        # result = self.client().alarms.create(**q)
        # try:
        #     return {"success":{"alarm":{"name":result.name, "id":result.alarm_id}}}
        # except AttributeError as e:
        #     result = {'error': {'message': str(e), 'code': 400, 'title': 'Name Already Exists'}}
        # except Exception as e:
        #     result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
        # return result

    def get_alarm(self, alarm_id):
        url = self.AODH_URL + "/alarms/" + alarm_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_alarm_list(self, q=None):
        """
        q.alarm_id={alarm_id}
        :param q: ['alarm_id', 'enabled', 'exclude', 'meter', 'name', 'project', 'severity', 'state', 'type', 'user']
        :return:
        """
        url = self.AODH_URL + "/alarms"
        if q:
            url = CustomHTTPClient.create_url_by_query(url, q)
        result = CustomHTTPClient.get_with_token(self.TOKEN, url)
        if type(result) == str:
            result = ast.literal_eval(result.replace("null", "None"))
        if result.get("error_message"):
            if "Table 'aodh.alarm' doesn't exist" in result["error_message"].get("faultstring"):
                result = {"error": {"title": "Not Found", "message": "Table 'aodh.alarm' doesn't exist", "code": "500"}}
            else:
                result = {"error": {"title": "", "message": json.dumps(result.get("error_message")), "code": "500"}}
        return result
        # try:
        #     result = self.client().alarms.list(q)
        #     return {"success":result}
        # except Exception as e:
        #     result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
        #     return (result, 'error')

    def delete_alarm(self, alarm_id):
        url = self.AODH_URL + "/alarms/" + alarm_id
        result = CustomHTTPClient.delete_with_token(self.TOKEN, url)
        return result

    def update_alarm(self, alarm_id, q):
        url = self.AODH_URL + "/alarms/" + alarm_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, q)

    # def setAlarmState(self, alarm_id, state):
    #     try:
    #         result = self.client().alarms.set_state(alarm_id, state)
    #         return {"success":result}
    #     except Exception as e:
    #         result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
    #         return (result, 'error')

    # def getAlarmState(self, alarm_id):
    #     try:
    #         result = self.client().alarms.get_state(alarm_id)
    #         return {"success":result}
    #     except Exception as e:
    #         result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
    #         return (result, 'error')

    def get_alarm_history(self, alarm_id, q=None):
        url = self.AODH_URL + "/alarms/" + alarm_id + "/history"
        return CustomHTTPClient.get_with_token(self.TOKEN, url, q)
        # try:
        #     result = self.client().alarms.get_history(alarm_id, q)
        #     return {"success":[{"title": type(alarmHistory).__name__, "id":alarm_id, "data":alarmHistory._info} for alarmHistory in result]}
        # except Exception as e:
        #     result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
        #     return (result, 'error')


class CinderRestAPI:
    def __init__(self, auth_url, token):
        self.AUTH_URL = auth_url
        service_type = "volume"
        auth_type = "public"
        self.CINDER_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        self.TOKEN = token
        if "controller" in self.CINDER_URL:
            self.CINDER_URL = self.CINDER_URL.replace("v1", "v3")
            self.CINDER_URL = self.CINDER_URL.replace("controller", auth_url[auth_url.index("://") + 3:auth_url.rindex(
                ":")])  # + "/v3"
        elif type(self.CINDER_URL) == dict and self.CINDER_URL.get("error"):
            raise Unauthorized(self.CINDER_URL.get("error").get("title"), self.CINDER_URL.get("error").get("message"))
        else:
            self.CINDER_URL = self.CINDER_URL.replace("v1", "v3")

        service_type = "volumev2"
        self.CINDER2_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        if "controller" in self.CINDER2_URL:
            self.CINDER2_URL = self.CINDER2_URL.replace("v1", "v2")
            self.CINDER2_URL = self.CINDER2_URL.replace("controller", auth_url[
                                                                      auth_url.index("://") + 3:auth_url.rindex(
                                                                          ":")])  # + "/v2"
        elif type(self.CINDER2_URL) == dict and self.CINDER2_URL.get("error"):
            raise Unauthorized(self.CINDER2_URL.get("error").get("title"), self.CINDER2_URL.get("error").get("message"))
        else:
            self.CINDER2_URL = self.CINDER2_URL.replace("v1", "v2")

    def updateToken(self, token):
        self.TOKEN = token

    def get_cinder_quotas(self, project_id):
        url = self.CINDER_URL + "/os-quota-sets/" + project_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_cinder_quotas_defulat(self, project_id):
        url = self.CINDER_URL + "/os-quota-sets/" + project_id + "/defaults"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_volume_type_list(self):
        url = self.CINDER_URL + "/types"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_volume_by_id(self, volume_id):
        url = self.CINDER_URL + "/volumes/" + volume_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_volume_list(self):
        url = self.CINDER_URL + "/volumes"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_volume_detail_list(self):
        url = self.CINDER_URL + "/volumes/detail"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def create_volume(self, data):
        """
        {
            "volume": {
                "size": 10,
                "availability_zone": null,
                "source_volid": null,
                "description": null,
                "multiattach ": false,
                "snapshot_id": null,
                "name": null,
                "imageRef": null,
                "volume_type": null,
                "metadata": {},
                "consistencygroup_id": null
            }
        }
        """
        url = self.CINDER_URL + "/volumes"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, data)

    def updateVolume(self, volume_id, data):
        url = self.CINDER_URL + "/volumes/" + volume_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, data)

    def delete_volume(self, volume_id):
        url = self.CINDER_URL + "/volumes/" + volume_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def actionVolume(self, volume_id, data):
        url = self.CINDER_URL + "/volumes/" + volume_id + "/action"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, data)

    def getBlockStorageServiceList(self):
        url = self.CINDER_URL + "/os-services"
        try:
            return CustomHTTPClient.get_with_token(self.TOKEN, url)
        except Exception as e:
            result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
            return (result, 'error')

    def getSnapshotList(self, project_name, q=None):
        keystone = KeystoneRestAPI(self.AUTH_URL, self.TOKEN)
        projects = keystone.get_project_list({"name":project_name})
        project_id = projects.get("success").get("projects")[0].get("id")
        url = self.CINDER_URL + project_id + "/snapshots"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_limits(self, project_id):
        url = self.CINDER_URL + "/limits"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_quotas(self, project_id, quota):
        url = self.CINDER_URL + "/os-quota-sets/" + project_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, quota)


class GlanceRestAPI:
    def __init__(self, auth_url, token):
        service_type = "image"
        auth_type = "public"
        self.GLANCE_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        self.TOKEN = token
        if "controller" in self.GLANCE_URL:
            self.GLANCE_URL = self.GLANCE_URL.replace("controller",
                                                      auth_url[auth_url.index("://") + 3:auth_url.rindex(":")]) + "/v2"
        elif type(self.GLANCE_URL) == dict and self.GLANCE_URL.get("error"):
            raise Unauthorized(message=self.GLANCE_URL.get("error").get("title"), details=self.GLANCE_URL.get("error").get("message"))
        else:
            self.GLANCE_URL = self.GLANCE_URL + "/v2"

    def create_image(self, data):
        url = self.GLANCE_URL + "/images"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, data)

    def get_image(self, image_id):
        url = self.GLANCE_URL + "/images/" + image_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_image_list(self, q=None, fields=None):
        url = self.GLANCE_URL + "/images"
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, query)
        try:
            return CustomHTTPClient.get_with_token(self.TOKEN, url)
        except Exception as e:
            result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
            return (result, 'error')

    def get_image_schema(self):
        url = self.GLANCE_URL + "/schemas/images"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def delete_image(self, image_id):
        url = self.GLANCE_URL + "/images/" + image_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)


class NeutronRestAPI:
    def __init__(self, auth_url, token):
        service_type = "network"
        auth_type = "public"
        self.NEUTRON_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        self.TOKEN = token
        if "controller" in self.NEUTRON_URL:
            self.NEUTRON_URL = self.NEUTRON_URL.replace("controller",
                                                        auth_url[auth_url.index("://") + 3:auth_url.rindex(":")])
        elif type(self.NEUTRON_URL) == dict and self.NEUTRON_URL.get("error"):
            raise Unauthorized(self.NEUTRON_URL.get("error").get("title"), self.NEUTRON_URL.get("error").get("message"))
        self.NEUTRON_URL += "/v2.0"

    def update_token(self, token):
        self.TOKEN = token

    def createNetwork(self, q):
        url = self.NEUTRON_URL + "/networks"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_network_list(self, q=None, fields=None):
        url = self.NEUTRON_URL + "/networks"
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, query)
        logger.info("url: {}".format(url))
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_external_network(self, q=None, fields=None):
        """
        network["router:external"]가 True인것만 가져옴
        :param q:
        :param fields:
        :return:
        """
        result = self.get_network_list(q, fields)
        if result.get("success"):
            networks = result["success"].get("networks")
            public_network = filter(lambda network: network["router:external"], networks)
            result["success"]["networks"] = public_network

        return result

    """
    create
    NAME                                    IN      TYPE
    network                                 body    object
    admin_state_up (Optional)               body    boolean
    dns_domain (Optional)                   body    string
    mtu (Optional)                          body    integer
    name (Optional)                         body    string
    port_security_enabled (Optional)        body    boolean
    project_id (Optional)                   body    string
    provider:network_type (Optional)        body    string
    provider:physical_network (Optional)    body    string
    provider:segmentation_id (Optional)     body    integer
    qos_policy_id (Optional)                body    string
    router:external (Optional)              body    boolean
    segments (Optional)                     body    array
    shared (Optional)                       body    boolean
    tenant_id (Optional)                    body    string
    vlan_transparent (Optional)             body    boolean
    description (Optional)                  body    string
    """
    def get_network(self, network_id, fields=None):
        url = self.NEUTRON_URL + "/networks/" + network_id
        query = {}
        if fields:
            query["fields"] = fields
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    """
    update
    NAME                                IN      TYPE
    network_id                          path    string
    network                             body    object
    admin_state_up (Optional)           body    boolean
    dns_domain (Optional)               body    string
    mtu (Optional)                      body    integer
    name (Optional)                     body    string
    port_security_enabled (Optional)    body    boolean
    provider:network_type               body    string
    provider:physical_network           body    string
    provider:segmentation_id            body    integer
    qos_policy_id (Optional)            body    string
    router:external (Optional)          body    boolean
    segments                            body    array
    shared (Optional)                   body    boolean
    description (Optional)              body    string
    """

    def updateNetwork(self, network_id, q):
        url = self.NEUTRON_URL + "/networks/" + network_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, q)

    def deleteNetwork(self, network_id):
        url = self.NEUTRON_URL + "/networks/" + network_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def createSubnet(self, q):
        url = self.NEUTRON_URL + "/subnets"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_subnet_list(self, q=None, fields=None):
        url = self.NEUTRON_URL + "/subnets"
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_subnet(self, subnet_id, q=None, fields=None):
        url = self.NEUTRON_URL + "/subnets/" + subnet_id
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if fields or q:
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def updateSubnet(self, subnet_id, q):
        url = self.NEUTRON_URL + "/subnets/" + subnet_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, q)

    def deleteSubnet(self, subnet_id):
        url = self.NEUTRON_URL + "/subnets/" + subnet_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def createPort(self, q):
        url = self.NEUTRON_URL + "/ports"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def get_port_list(self, q=None, fields=None):
        url = self.NEUTRON_URL + "/ports"
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if q or fields:
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def getPort(self, port_id, fields=None):
        url = self.NEUTRON_URL + "/ports/" + port_id
        query = {}
        if fields:
            query["fields"] = fields
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def updatePort(self, port_id, q):
        url = self.NEUTRON_URL + "/ports/" + port_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, q)

    def delete_port(self, port_id):
        url = self.NEUTRON_URL + "/ports/" + port_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def createRouter(self, q):
        url = self.NEUTRON_URL + "/routers"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, q)

    def getRouterList(self, fields=None):
        url = self.NEUTRON_URL + "/routers"
        query = {}
        if fields:
            query["fields"] = fields
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def getRouter(self, router_id, fields=None):
        url = self.NEUTRON_URL + "/routers/" + router_id
        query = {}
        if fields:
            query["fields"] = fields
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def updateRouter(self, router_id, q):
        url = self.NEUTRON_URL + "/routers/" + router_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, q)

    def deleteRouter(self, router_id):
        url = self.NEUTRON_URL + "/routers/" + router_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def getDHCPAgentHostingNetworkList(self, network_id):
        url = self.NEUTRON_URL + "/networks/" + network_id + "/dhcp-agents"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def getAgentList(self):
        url = self.NEUTRON_URL + "/agents"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_floating_ips(self, fields=None, q=None):
        url = self.NEUTRON_URL + "/floatingips"
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if query:
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_floating_ip(self, floatingip_id, fields=None):
        url = self.NEUTRON_URL + "/floatingips/" + floatingip_id
        query = {}
        if fields:
            query["fields"] = fields
        if query:
            url = CustomHTTPClient.create_url_by_query(url, query)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def create_floating_ip(self, data):
        url = self.NEUTRON_URL + "/floatingips"
        return CustomHTTPClient.post_with_token(self.TOKEN, url, data)

    def delete_floating_ip(self, floatingip_id):
        url = self.NEUTRON_URL + "/floatingips/" + floatingip_id
        return CustomHTTPClient.delete_with_token(self.TOKEN, url)

    def get_quotas_non_default(self):
        url = self.NEUTRON_URL + "/quotas"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_quotas(self, project_id):
        url = self.NEUTRON_URL + "/quotas/" + project_id
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def get_quotas_default(self, project_id):
        url = self.NEUTRON_URL + "/quotas/" + project_id + "/default"
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def update_quotas(self, project_id, quota):
        url = self.NEUTRON_URL + "/quotas/" + project_id
        return CustomHTTPClient.put_with_token(self.TOKEN, url, quota)


class HeatRestAPI:
    def __init__(self, auth_url, token):
        service_type = "orchestration"
        auth_type = "public"
        self.HEAT_URL = KeystoneRestAPI.get_service_url(auth_url, token, service_type, auth_type)
        self.TOKEN = token
        if "controller" in self.HEAT_URL:
            self.HEAT_URL = self.HEAT_URL.replace("controller", auth_url[auth_url.index("://") + 3:auth_url.rindex(":")])
        elif type(self.HEAT_URL) == dict and self.HEAT_URL.get("error"):
            raise Unauthorized(self.HEAT_URL.get("error").get("title"), self.HEAT_URL.get("error").get("message"))

    def get_resource_in_stack(self, stack_name, stack_id, q=None, fields=None):
        url = self.HEAT_URL + "/stacks/" + stack_name + "/" + stack_id + "/resources"
        query = {}
        if q:
            query.update(q)
        if fields:
            query["fields"] = fields
        if query:
            url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

    def find_server_in_autoscaling(self, stack_identity, q=None, fields=None):
        url = self.HEAT_URL + "/stacks/" + stack_identity + "/resources"
        # query = {}
        # if q:
        #     query.update(q)
        # if fields:
        #     query["fields"] = fields
        # if query:
        #     url = CustomHTTPClient.create_url_by_query(url, q)
        return CustomHTTPClient.get_with_token(self.TOKEN, url)

"""
https://docs.openstack.org/admin-guide/telemetry-measurements.html

Name 	                            Type 	    Unit 	        Resource 	    Origin 	                Support 	                        Note
Meters added in the Mitaka release or earlier
memory          	                Gauge 	    MB 	            instance ID 	Notification 	        Libvirt, Hyper-V 	                Volume of RAM allocated to the instance
memory.usage 	                    Gauge 	    MB 	            instance ID 	Pollster 	            Libvirt, Hyper-V, vSphere, XenAPI 	Volume of RAM used by the instance from the amount of its allocated memory
memory.resident 	                Gauge 	    MB 	            instance ID 	Pollster 	            Libvirt 	                        Volume of RAM used by the instance on the physical machine
cpu 	                            Cumulative 	ns 	            instance ID 	Pollster 	            Libvirt, Hyper-V 	                CPU time used
cpu.delta 	                        Delta 	    ns 	            instance ID 	Pollster 	            Libvirt, Hyper-V 	                CPU time used since previous datapoint
cpu_util 	                        Gauge 	    % 	            instance ID 	Pollster 	            vSphere, XenAPI 	                Average CPU utilization
vcpus 	                            Gauge 	    vcpu 	        instance ID 	Notification 	        Libvirt, Hyper-V 	                Number of virtual CPUs allocated to the instance
disk.read.requests 	                Cumulative 	request 	    instance ID 	Pollster 	            Libvirt, Hyper-V 	                Number of read requests
disk.read.requests.rate 	        Gauge 	    request/s 	    instance ID 	Pollster 	            Libvirt, Hyper-V, vSphere 	        Average rate of read requests
disk.write.requests 	            Cumulative 	request 	    instance ID 	Pollster 	            Libvirt, Hyper-V 	                Number of write requests
disk.write.requests.rate 	        Gauge 	    request/s 	    instance ID 	Pollster 	            Libvirt, Hyper-V, vSphere 	        Average rate of write requests
disk.read.bytes 	                Cumulative 	B 	            instance ID 	Pollster 	            Libvirt, Hyper-V 	                Volume of reads
disk.read.bytes.rate 	            Gauge 	    B/s 	        instance ID 	Pollster 	            Libvirt, Hyper-V, vSphere, XenAPI 	Average rate of reads
disk.write.bytes 	                Cumulative 	B 	            instance ID 	Pollster 	            Libvirt, Hyper-V 	                Volume of writes
disk.write.bytes.rate 	            Gauge 	    B/s 	        instance ID 	Pollster 	            Libvirt, Hyper-V, vSphere, XenAPI 	Average rate of writes
disk.device.read.requests 	        Cumulative 	request 	    disk ID 	    Pollster 	            Libvirt, Hyper-V 	                Number of read requests
disk.device.read.requests.rate 	    Gauge 	    request/s 	    disk ID 	    Pollster 	            Libvirt, Hyper-V, vSphere 	        Average rate of read requests
disk.device.write.requests 	        Cumulative 	request 	    disk ID 	    Pollster 	            Libvirt, Hyper-V 	                Number of write requests
disk.device.write.requests.rate 	Gauge 	    request/s 	    disk ID 	    Pollster 	            Libvirt, Hyper-V, vSphere 	        Average rate of write requests
disk.device.read.bytes 	            Cumulative 	B 	            disk ID 	    Pollster 	            Libvirt, Hyper-V 	                Volume of reads
disk.device.read.bytes .rate 	    Gauge 	    B/s 	        disk ID 	    Pollster 	            Libvirt, Hyper-V, vSphere 	        Average rate of reads
disk.device.write.bytes 	        Cumulative 	B 	            disk ID 	    Pollster 	            Libvirt, Hyper-V 	                Volume of writes
disk.device.write.bytes .rate 	    Gauge 	    B/s 	        disk ID 	    Pollster 	            Libvirt, Hyper-V, vSphere 	        Average rate of writes
disk.root.size 	                    Gauge 	    GB 	            instance ID 	Notification 	        Libvirt, Hyper-V 	                Size of root disk
disk.ephemeral.size 	            Gauge 	    GB 	            instance ID 	Notification 	        Libvirt, Hyper-V 	                Size of ephemeral disk
disk.latency 	                    Gauge 	    ms 	            instance ID 	Pollster 	            Hyper-V 	                        Average disk latency
disk.iops 	                        Gauge 	    count/s 	    instance ID 	Pollster 	            Hyper-V 	                        Average disk iops
disk.device.latency 	            Gauge 	    ms 	            disk ID 	    Pollster 	            Hyper-V 	                        Average disk latency per device
disk.device.iops 	                Gauge 	    count/s 	    disk ID 	    Pollster 	            Hyper-V 	                        Average disk iops per device
disk.capacity 	                    Gauge 	    B 	            instance ID 	Pollster 	            Libvirt 	                        The amount of disk that the instance can see
disk.allocation 	                Gauge 	    B 	            instance ID 	Pollster 	            Libvirt 	                        The amount of disk occupied by the instance on the host machine
disk.usage 	                        Gauge 	    B 	            instance ID 	Pollster 	            Libvirt 	                        The physical size in bytes of the image container on the host
disk.device.capacity 	            Gauge 	    B 	            disk ID 	    Pollster 	            Libvirt 	                        The amount of disk per device that the instance can see
disk.device.allocation 	            Gauge 	    B 	            disk ID 	    Pollster 	            Libvirt 	                        The amount of disk per device occupied by the instance on the host machine
disk.device.usage 	                Gauge 	    B 	            disk ID 	    Pollster 	            Libvirt 	                        The physical size in bytes of the image container on the host per device
network.incoming.bytes 	            Cumulative 	B 	            interface ID 	Pollster 	            Libvirt, Hyper-V 	                Number of incoming bytes
network.incoming.bytes.rate 	    Gauge 	    B/s 	        interface ID 	Pollster 	            Libvirt, Hyper-V, vSphere, XenAPI 	Average rate of incoming bytes
network.outgoing.bytes 	            Cumulative 	B 	            interface ID 	Pollster 	            Libvirt, Hyper-V 	                Number of outgoing bytes
network.outgoing.bytes.rate 	    Gauge 	    B/s 	        interface ID 	Pollster 	            Libvirt, Hyper-V, vSphere, XenAPI 	Average rate of outgoing bytes
network.incoming.packets 	        Cumulative 	packet 	        interface ID 	Pollster 	            Libvirt, Hyper-V 	                Number of incoming packets
network.incoming.packets.rate 	    Gauge 	    packet/s 	    interface ID 	Pollster 	            Libvirt, Hyper-V, vSphere, XenAPI 	Average rate of incoming packets
network.outgoing.packets 	        Cumulative 	packet 	        interface ID 	Pollster 	            Libvirt, Hyper-V 	                Number of outgoing packets
network.outgoing.packets.rate 	    Gauge 	    packet/s 	    interface ID 	Pollster 	            Libvirt, Hyper-V, vSphere, XenAPI 	Average rate of outgoing packets

Meters added in the Newton release
cpu_l3_cache 	                    Gauge 	    B 	            instance ID 	Pollster 	            Libvirt 	                        L3 cache used by the instance
memory.bandwidth.total 	            Gauge 	    B/s 	        instance ID 	Pollster 	            Libvirt 	                        Total system bandwidth from one level of cache
memory.bandwidth.local 	            Gauge 	    B/s 	        instance ID 	Pollster 	            Libvirt 	                        Bandwidth of memory traffic for a memory controller
perf.cpu.cycles 	                Gauge 	    cycle 	        instance ID 	Pollster 	            Libvirt 	                        the number of cpu cycles one instruction needs
perf.instructions 	                Gauge 	    instruction 	instance ID 	Pollster 	            Libvirt 	                        the count of instructions
perf.cache.references 	            Gauge 	    count 	        instance ID 	Pollster 	            Libvirt 	                        the count of cache hits
perf.cache.misses 	                Gauge 	    count 	        instance ID 	Pollster 	            Libvirt 	                        the count of cache misses

Meters removed as of Ocata release
instance 	                        Gauge 	    instance 	    instance ID 	Notification, Pollster 	Libvirt, Hyper-V, vSphere 	        Existence of instance

Meters added in the Ocata release
network.incoming.packets.drop 	    Cumulative 	packet 	        interface ID 	Pollster 	            Libvirt 	                        Number of incoming dropped packets
network.outgoing.packets.drop 	    Cumulative 	packet 	        interface ID 	Pollster 	            Libvirt 	                        Number of outgoing dropped packets
network.incoming.packets.error 	    Cumulative 	packet 	        interface ID 	Pollster 	            Libvirt 	                        Number of incoming error packets
network.outgoing.packets.error 	    Cumulative 	packet 	        interface ID 	Pollster 	            Libvirt 	                        Number of outgoing error packets


    query = [
        {
            "counter_name": "ram_util",
            "user_id": "4790fbafad2e44dab37b1d7bfc36299b",
            "resource_id": "87acaca4-ae45-43ae-ac91-846d8d96a89b",
            "resource_metadata": {
              "display_name": "my_instance",
              "my_custom_metadata_1": "value1",
              "my_custom_metadata_2": "value2"
             },
            "counter_unit": "%",
            "counter_volume": 8.57762938230384,
            "project_id": "97f9a6aaa9d842fcab73797d3abb2f53",
            "counter_type": "gauge"
        }
    ]
    query = {
        "meter_id": "YmQ5NDMxYzEtOGQ2OS00YWQzLTgwM2EtOGQ0YTZiODlmZDM2K2luc3RhbmNl",
        "name": "instance",
        "project_id": "35b17138-b364-4e6a-a131-8f3099c5be68",
        "resource_id": "bd9431c1-8d69-4ad3-803a-8d4a6b89fd36",
        "source": "openstack",
        "type": "gauge",
        "unit": "instance",
        "user_id": "efd87807-12d2-4b38-9c70-5f5c2ac427ff"
    }
    query = [dict(field='resource_id', op='eq', value='5a301761-f78b-46e2-8900-8b4f6fe6675a'),
             dict(field='meter', op='eq', value='cpu_util')]
    query = {"group_by":"project","stats_attr":"avg","date_options":7,"date_from":"","date_to":""}
"""



def excuteCmd(command):
    # 명령 실행, 출력 반환
    # logger.debug("excuteCmd>> "+command)
    f = os.popen(command)
    result = f.read()
    # logger.debug(result)
    return result


def parsingOutputToList(output):
    # 출력을 받아 parsing함
    rows = output.splitlines()
    if rows:
        # index 0 = 테두리
        # index 1 = 키(컬럼명)
        keyList = rows[1][1:-1].split("|")
        for idx, key in enumerate(keyList):
            # 양끝 공백을 없애고 사이공백은 밑줄로 전환
            keyList[idx] = key.lower().strip().replace(" ", "_")
        resultList = []
        for row in rows[3:-1]:
            # index 3 ~ = 목록
            # 한 줄당 하나의 가상서버
            # 하나의 가상서버를 Dictionary에 담는다
            resultDic = {}
            cols = row[1:-1].split("|")
            for idx, col in enumerate(cols):
                key = keyList[idx]
                value = col.strip()
                resultDic[key] = value
            # Dictionary를 List에 담아 반환한다.
            resultList.append(resultDic)
        return resultList
    else:
        # 가상서버 하나도 없을 때
        # logger.debug("List is empty")
        return None