# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.identity.roles import views

urlpatterns = [
    url(r'^$', views.get_role_list, name='role_index'),
    url(r'^(?P<role_id>[\w\-]+)/detail$', views.get_role_by_id, name='role_info'),
    url(r'^create$', views.create_role, name='role_create'),
    url(r'^(?P<role_id>[\w\-]+)/update$', views.update_role, name='role_update'),
    url(r'^(?P<role_id>[\w\-]+)/delete$', views.delete_role, name='role_delete'),
    url(r'^modal$', views.role_modal, name='role_modal'),
]