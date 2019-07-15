# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.security import views

urlpatterns = [
    url(r'^$', views.get_security_resource_list, name='get_security_resource_list'),
    url(r'^create$', views.createSecurityResourceGroup, name='createSecurityResourceGroup'),
    # 병천 입력 부분
    # Capability 팝업창 열리게
    url(r'^create/capability$', views.create_security_resource_group_capability, name='create_security_resource_group_capability'),
    url(r'^capability/send$', views.send_capability_xml, name='send_capability_xml'),
    # 병천 입력 부분 끝
    url(r'^(?P<security_id>[\w\-]+)/modify$', views.modify_security_resource_group, name='modify_security_resource_group'),
    url(r'^(?P<security_id>[\w\-]+)/detail$', views.get_security_resource, name='get_security_resource'),
    url(r'^(?P<security_id>[\w\-]+)/delete$', views.delete_security_resource, name='delete_security_resource'),
    url(r'^search$', views.get_security_group_info, name='get_security_group_info'),
]
