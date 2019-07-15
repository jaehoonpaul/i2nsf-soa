import logging
import traceback

from django import http
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render
from django.template import Context, Template
from django.utils.deprecation import MiddlewareMixin
from django.views.defaults import server_error

from sdsecgui.exceptions import BusinessLogicException
from sdsecgui.responses import RedirectToRefererResponse
from sdsecgui.tools.keystone_exception import Unauthorized


class HandleBusinessExceptionMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        if isinstance(exception, BusinessLogicException):
            message = "Invalid operation %s" % unicode(exception)
            messages.error(request, message)
            return RedirectToRefererResponse(request)


class HandleUnauthorizedExceptionMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        logger = logging.getLogger("myapp.myLogger")
        logger.error("[process_exception] %s catch" % unicode(exception))
        accepts = request.META.get("HTTP_ACCEPT")
        response_type = ""
        if isinstance(exception, Unauthorized):
            message = "revoked token %s" % unicode(exception)
            messages.error(request, message)

            if "modal" in request.path:
                response = JsonResponse({"error": {"title": exception.message, "message": exception.details, "code": 401}})
                response_type = "JsonResponse(401)/modal"
                response.status_code = 401
            elif "application/json" in accepts:
                response = JsonResponse(
                    {"error": {'title': exception.message, "message": traceback.format_exc().strip().split('\n')}})
                response.status_code = 401
                response_type = "JsonResponse(401)/json"
            else:
                response = RedirectToRefererResponse(request)
                response_type = "RedirectToRefererResponse"
        elif "application/json" in accepts:
            response = JsonResponse({"error": {'title': exception.message, "message": traceback.format_exc().strip().split('\n')}})
            response.status_code = 500
            response_type = "JsonResponse(error)"
        elif "text/html" in accepts:
            # t = Template("500 Error: {{ exception }}<br/><textarea>{{ traceback }}</textarea>")
            response_html = render(request, "error/500.html", {'exception': exception, "traceback": traceback.format_exc()})
            response_type = "HttpResponse(errorPage)"

            response = http.HttpResponse(response_html)
            response.status_code = 500
        else:
            response = JsonResponse({"error": {'title': exception.message, "message": traceback.format_exc()}})
            response.status_code = 500
            response_type = "JsonResponse(error)/else"

        error_str = """
        ======================== Error ===============================
        Title: {}
        Traceback: {}
        """.format(exception.message, traceback.format_exc().strip().split('\n'))

        if response:
            error_str += """
        ======================== return replace ======================
        status_code: {}
        response: {}
        response_type: {}
            """.format(response.status_code, response, response_type)

        error_str += "\n        =============================================================="

        logger.error(error_str)
        return response
