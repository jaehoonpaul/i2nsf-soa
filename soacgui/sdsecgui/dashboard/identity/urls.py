# _*_ coding:utf-8 _*_
from django.conf.urls import url, include

from sdsecgui.dashboard.identity.projects import urls as projects_urls
from sdsecgui.dashboard.identity.groups import urls as groups_urls
from sdsecgui.dashboard.identity.users import urls as users_urls
from sdsecgui.dashboard.identity.roles import urls as roles_urls
from sdsecgui.dashboard.identity import views

urlpatterns = [
    url(r'^$', views.main, name='identity_main'),
    url(r'^domains$', views.get_domain_list, name='getDomains'),
    url(r'^projects/', include(projects_urls, namespace='project')),
    url(r'^groups/', include(groups_urls, namespace='groups')),
    url(r'^users/', include(users_urls, namespace='users')),
    url(r'^roles/', include(roles_urls, namespace='roles')),
]