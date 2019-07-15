# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.routers import views

app_name = "router"
urlpatterns = [
    url(r'^$', views.get_router_list, name='routerList'),
    url(r'interface/$', views.get_interface_list_in_router, name='interface'),
    # url(r'^(?P<router_id>[\w\-]+)/detail$', views.retrieveRouterById, name='router'),

    url(r'^(?P<router_id>[\w\-]+)/(?P<action>delete|update|detail)$', views.action_router, name='router'),
    url(r'^metadata_create_router$', views.get_metadata_for_create_router, name='metadata_create_router'),
    url(r'^create$', views.create_router, name='create_router'),
    url(r'^(?P<router_id>[\w\-]+)/sync_modal$', views.sync_modal, name='sync_router_modal'),
    url(r'^(?P<router_id>[\w\-]+)/sync$', views.sync, name='sync_router'),
]