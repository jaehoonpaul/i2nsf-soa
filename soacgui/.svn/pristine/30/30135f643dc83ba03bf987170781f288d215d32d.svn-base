# _*_ coding:utf-8 _*_
from django.conf.urls import url
from sdsecgui.dashboard.service.chaining import views

urlpatterns = [
    url(r'^$', views.listChaining, name='list_chaining'),
    url(r'^list$', views.getChainingList, name='list_chaining'),
    url(r'^exec$', views.execChaining, name='exec_chaining'),
    url(r'^create/$', views.createChaining, name='create_chaining'),
    url(r'^create/save$', views.saveChaining, name='save_chaining'),
    url(r'^create/ports$', views.getPortList, name='get_ports'),
]