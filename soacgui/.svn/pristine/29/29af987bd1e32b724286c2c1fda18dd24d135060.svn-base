from django.http import HttpResponseRedirect


class RedirectToRefererResponse(HttpResponseRedirect):
    def __init__(self, request, *args, **kwargs):
        url = "/dashboard/"
        if request.session.get("auth_url"):
            url += "login?auth_url=" + request.session.get("auth_url")
            if request.session.get("domain_name"):
                url += "&domain_name=" + request.session.get("domain_name")
            if request.session.get("description"):
                url += "&description=" + request.session.get("description")
            if request.session.get("project_name"):
                url += "&project_name=" + request.session.get("project_name")
            if request.path:
                url += "&next=" + request.path
        redirect_to = url
        super(RedirectToRefererResponse, self).__init__(redirect_to, *args, **kwargs)
