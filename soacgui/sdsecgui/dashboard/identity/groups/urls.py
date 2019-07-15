# _*_ coding:utf-8 _*_
from django.conf.urls import url, include

from sdsecgui.dashboard.identity.groups import views

urlpatterns = [
    url(r'^$', views.get_group_list, name='group_index'),
    url(r'^(?P<group_id>[\w\-]+)/detail$', views.get_group_by_id, name='group_detail'),
    url(r'^create$', views.create_group, name='group_create'),
    url(r'^(?P<group_id>[\w\-]+)/update$', views.update_group, name='group_update'),
    url(r'^(?P<group_id>[\w\-]+)/delete$', views.delete_group, name='group_delete'),
    url(r'^modal$', views.group_modal, name='group_modal'),
]