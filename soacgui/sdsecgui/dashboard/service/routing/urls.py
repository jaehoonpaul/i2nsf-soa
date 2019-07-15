# _*_ coding:utf-8 _*_
from django.conf.urls import url, include
from sdsecgui.dashboard.service.routing import views

app_name = "routing"
urlpatterns = [
    url(r'^dst_rule/create$', views.create_dst_pop, name='dst_create_pop'),
    url(r'^src_rule/create$', views.create_src_pop, name='src_create_pop'),
    url(r'^(?P<router_id>[\w\-]+)$', views.list_routing, name='index'),
    url(r'^(?P<router_id>[\w\-]+)/dst_rule/create$', views.create_dst_routing, name='dst_create'),
    url(r'^(?P<router_id>[\w\-]+)/src_rule/create$', views.create_src_routing, name='src_create'),
    url(r'^(?P<router_id>[\w\-]+)/dst_rule/delete$', views.delete_dst_routing, name='dst_delete'),
    url(r'^(?P<router_id>[\w\-]+)/src_rule/delete$', views.delete_src_routing, name='src_delete'),
]