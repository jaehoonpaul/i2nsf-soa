# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.instances import views

app_name = "server"
urlpatterns = [
    # 가상서버 주소
    url(r'^$', views.get_instance_list, name='server_list'),
    # url(r'^get_server$', views.get_server_list, name='notadmin_server_list'),
    url(r'^create$', views.create_server, name='create_server'),
    url(r'^server_metadata$', views.get_create_metadata, name='serverMetadata'),
    url(r'^(?P<server_id>[\w\-]+)/detail$', views.retrieve_instance_by_id, name='detail_server'),
    url(r'^modal$', views.create_modal, name='create_modal'),
    url(r'^(?P<server_id>[\w\-]+)/modal', views.update_modal, name='update_modal'),

    url(r'^(?P<server_id>[\w\-]+)/delete$', views.delete_server, name='delete_server'),
    url(r'^(?P<server_id>[\w\-]+)/update$', views.update_server, name='update_server'),

    url(r'^(?P<server_id>[\w\-]+)/action$', views.action_server, name='action_server'),

    url(r'^(?P<server_id>[\w\-]+)/sync_modal$', views.sync_modal, name='sync_server_modal'),
    url(r'^(?P<server_id>[\w\-]+)/sync$', views.sync, name='sync_server'),
]
