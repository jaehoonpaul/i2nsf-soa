# _*_ coding:utf-8 _*_
from django.conf.urls import url, include

from sdsecgui.dashboard.admin.networks import views
from sdsecgui.dashboard.admin.networks.subnets import urls as subnets_urls
from sdsecgui.dashboard.admin.networks.ports import urls as ports_urls

app_name = "network"
urlpatterns = [
    url(r'^$', views.get_network_list, name='networks'),
    url(r'^modal$', views.network_modal, name='network_modal'),
    url(r'^create$', views.create_network, name='create_network'),
    url(r'^(?P<network_id>[\w\-]+)/detail$', views.get_network, name='network'),
    url(r'^(?P<network_id>[\w\-]+)/update$', views.update_network, name='update_network'),
    url(r'^(?P<network_id>[\w\-]+)/delete$', views.delete_network, name='delete_network'),

    url(r'subnets/', include(subnets_urls, namespace='subnet')),

    url(r'ports/', include(ports_urls, namespace='ports')),

    url(r'^(?P<network_id>[\w\-]+)/sync_modal$', views.sync_modal, name='sync_network_modal'),
    url(r'^(?P<network_id>[\w\-]+)/sync$', views.sync, name='sync_network'),
]