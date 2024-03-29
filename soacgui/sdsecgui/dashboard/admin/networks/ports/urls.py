# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.networks.ports import views

urlpatterns = [
    url(r'^(?P<port_id>[\w\-]+)/(?P<action>delete|update|detail)$', views.actionPort, name='port'),
    url(r'^create$', views.createPort, name='createPort'),
    url(r'^modal$', views.ports_modal, name='modal'),
]