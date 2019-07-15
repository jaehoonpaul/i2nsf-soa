# _*_ coding:utf-8 _*_
from django.conf.urls import url, include
from sdsecgui.dashboard.service import views
from chaining import urls as chaining_url
from routing import urls as routing_url
from intent import urls as intent_url
urlpatterns = [
    url(r'^$', views.list_service, name='service_list'),
    url(r'^right_pop/?$', views.loadRightPopHtml, name='right_pop'),
    url(r'^all_service/?$', views.get_all_service_list, name='all_service_list'),

    url(r'^new_service/$', views.new_service, name='new_service'),
    url(r'^new_service/save$', views.create_service, name='new_service_save'),
    url(r'^new_service/get_availability_zone$', views.availabilityZone, name='new_service_get_availability_zone'),
    url(r'^new_service/get_images$', views.imageList, name='new_service_get_images'),
    url(r'^new_service/get_volumes$', views.volume_list, name='new_service_get_volumes'),
    url(r'^new_service/get_flavors$', views.flavor_list, name='new_service_get_flavors'),

    url(r'^fw_rule/modal$', views.modal_fw_rule_list, name='modal_fw_rule_list'),
    url(r'^fw_rule/create_modal$', views.modal_fw_rule_create, name='modal_fw_rule_create'),


    url(r'^resource_data$', views.get_resource_data, name='resource_data'),
    url(r'^get_stack_resource$', views.get_as_group, name='get_resource_in_stack'),
    url(r'^get_asg_vm$', views.get_vm_in_asg, name='get_vm_in_asg'),
    url(r'^console_url', views.get_console_url, name='console_url'),

    url(r'^(?P<service_id>[\w\-]+)/delete$', views.delete_service, name='service_delete'),
    url(r'^(?P<service_id>[\w\-]+)/suspend$', views.suspend_service, name='service_suspend'),
    url(r'^(?P<service_id>[\w\-]+)/resume$', views.resume_service, name='service_resume'),
    url(r'^(?P<service_id>[\w\-]+)/detail$', views.detail_service, name='service_detail'),
    url(r'^(?P<service_id>[\w\-]+)/get_servers$', views.getServerListInService, name='get_servers_in_service'),
    url(r'^(?P<service_id>[\w\-]+)/simple$', views.simpleService, name='service_simple'),
    url(r'^(?P<service_id>[\w\-]+)/modify$', views.modifyService, name='service_modify'),
    url(r'^(?P<service_id>[\w\-]+)/modify/save$', views.updateService, name='modify_service_save'),

    url(r'^(?P<service_id>[\w\-]+)/chaining/', include(chaining_url, namespace="chaining")),
    # url(r'^(?P<service_id>[\w\-]+)/chain/(?P<chain_id>[\w\-]+)/detail$', views.serviceChaining, name='chain_detail'),

    url(r'^routing/', include(routing_url, namespace="routing")),
    url(r'^intent/', include(intent_url, namespace="intent")),
]

