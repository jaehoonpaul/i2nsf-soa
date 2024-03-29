# _*_ coding:utf-8 _*_
import requests
import logging
import pprint

from sdsec.settings import config
from sdsecgui.tools.keystone_exception import Unauthorized

logger = logging.getLogger("myapp.myLogger")
section = "SETTINGS"
LOG_LEVEL = config.get(section, "LOG_LEVEL")


class CustomHTTPClient:

    @staticmethod
    def get_method(url, headers=None, body=None):
        return requests.get(url, headers=headers, json=body)

    @staticmethod
    def post_method(url, headers=None, body=None, verify=None, cert=None):
        return requests.post(url, headers=headers, json=body, verify=verify, cert=cert)

    @staticmethod
    def delete_method(url, headers=None, body=None):
        return requests.delete(url, headers=headers, json=body)

    @staticmethod
    def put_method(url, headers=None, body=None):
        return requests.put(url, headers=headers, json=body)

    @staticmethod
    def patch_method(url, headers=None, body=None):
        return requests.patch(url, headers=headers, json=body)

    @staticmethod
    def head_method(url, headers=None):
        return requests.head(url, headers=headers)

    @staticmethod
    def post_with_token(token, url, body=None, subject=None):
        # type: (str, str, dict, str) -> dict
        headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        if subject:
            headers["X-Subject-Token"] = subject

        response = requests.post(url, headers=headers, json=body)

        return CustomHTTPClient.confirm_status(response)

    @staticmethod
    def get_with_token(token, url, subject=None, log=True):
        headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        if subject:
            headers["X-Subject-Token"] = subject
        response = requests.get(url, headers=headers)

        return CustomHTTPClient.confirm_status(response, log)

    @staticmethod
    def put_with_token(token, url, body=None, subject=None):
        headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        if subject:
            headers["X-Subject-Token"] = subject

        response = requests.put(url, headers=headers, json=body)

        return CustomHTTPClient.confirm_status(response)

    @staticmethod
    def delete_with_token(token, url, body=None, subject=None):
        headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        if subject:
            headers["X-Subject-Token"] = subject

        response = requests.delete(url, headers=headers, json=body)
        return CustomHTTPClient.confirm_status(response)

    @staticmethod
    def head_with_token(token, url, subject=None):
        headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        if subject:
            headers["X-Subject-Token"] = subject

        response = requests.head(url, headers=headers)

        return CustomHTTPClient.confirm_status(response)

    @staticmethod
    def patch_with_token(token, url, body=None, subject=None):
        headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        if subject:
            headers["X-Subject-Token"] = subject

        response = requests.patch(url, headers=headers, json=body)

        return CustomHTTPClient.confirm_status(response)

    @staticmethod
    def create_url_by_query(url, q):
        if q:
            for idx, key in enumerate(q.keys()):
                if idx == 0:
                    url += "?"
                else:
                    url += "&"
                if type(q.get(key)) == list and key == "query":
                    for q_idx, query in enumerate(q[key]):
                        for k_idx, queryKey in enumerate(query.keys()):
                            if q_idx != 0 or k_idx != 0:
                                url += "&"
                            url += "q." + queryKey + "=" + query[queryKey]
                elif type(q.get(key)) == list and key == "fields":
                    for l_idx, field in enumerate(q[key]):
                        if l_idx != 0:
                            url += "&"
                        url += key + "=" + field
                elif type(q.get(key)) == list:
                    print "q[key] == list일때 ===========error======="
                    raise Exception(q)
                else:
                    url += key + "=" + str(q[key])
        return url

    @staticmethod
    def confirm_status(response, log=True, r_header=False):
        status = response.status_code
        if status == requests.codes.ok or 100 <= status < 300:
            try:
                if type(response.json()) == dict:
                    if "success" in response.json().keys():
                        contents = response.json()
                    else:
                        if "message" in response.json().keys():
                            result = response.json()
                            contents = {result.get("message").lower(): {"result": result.get("result")}}
                        else:
                            contents = {"success": response.json()}
                    contents["success"]["code"] = status
                elif type(response.json()) == list:
                    contents = {"success": response.json()}
                elif type(response._content) == str:
                    contents = {"success": response._content}
                else:
                    contents = {"success": response.json()}
            except ValueError:
                # TODO: logger(file).error(contents)
                print "Error"
                contents = response._content
                print type(contents)
                print contents
        elif 401 == status:
            contents = {"error": {"message": "The request you have made requires authentication.", "code": 401, "title":"Unauthorized"}}
        elif 403 == status:
            contents = {"error": {"message": str(response.content), "code":status, "title": "Forbidden"}}
        elif 400 <= status < 500:
            from simplejson import JSONDecodeError
            try:
                contents = {"error": response.json()}
            except JSONDecodeError as e:
                contents = {"error": {"message": str(response.content), "code": status,
                                      "title": ""}}  # TODO: defualt 기본 할당량에 os-quota-set 못가져옴 수정해야함(못가져온다는 에러라도 lobibox로 볼수있게)
                print contents
        elif 500 <= status < 600:
            # TODO: logger(file).error(contents)
            contents = response.content
        else:
            # TODO: logger(file).error(contents)
            contents = response.content
        if not contents and status == 204:
            contents = {"success": {"title": "success", "message": "success", "code": 204}}
        if LOG_LEVEL == "DEBUG" and log:
            request = response.request
            log_str = """
            ============================= Request ===============================
            [CURL {}] {}
            HEADERS: {}
            BODY: {}
            ============================= Response ===============================
            """.format(request.method, request.url, request.headers, request.body)
            if "tokens" in request.url:
                log_str += "headers: {}\n".format(response.headers)
            log_str += "            status: {}\n".format(str(status))
            if not "tokens" in request.url:
                log_str += "            contents: {}\n".format(contents)
                log_str += "            response: {}\n".format(response.content)
                log_str += "            ================================ end ================================="
            logger.debug(log_str)
        if 401 == status:
            raise Unauthorized(contents["error"]["title"], contents["error"]["message"])
        return contents

    @staticmethod
    def printResponse(url, headers, body, response):
        print "=========response===============test=============="
        print "url:\n        ", url
        print "headers:\n        ", headers
        print "body:\n        ", body
        print "response.status_code:\n        ", response.status_code
        print "response._content:\n        ",
        pprint.pprint(response._content)
        print "response.json():\n        ",
        pprint.pprint(response.json())
        print "response.raise_for_status():\n        ", response.raise_for_status()
        print "=================================================="
