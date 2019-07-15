# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.info import views

app_name = "info"
urlpatterns = [
    url(r'^$', views.retrieve_service_list, name='serviceList'),
    url(r'^nova_service$', views.retrieve_nova_service_list, name='novaServiceList'),
    url(r'^block_storage_service', views.retrieve_block_storage_service_list, name='blockStorageServiceList'),
    url(r'^agent$', views.retrieve_agent_list, name='agentList'),
]