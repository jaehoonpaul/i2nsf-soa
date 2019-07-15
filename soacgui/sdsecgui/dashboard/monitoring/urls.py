# _*_ coding:utf-8 _*_
from django.conf.urls import url, include

from sdsecgui.dashboard.monitoring import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^synchronize_server$', views.synchronize_floating_server_host, name='synchronize_server'),
    url(r'^(?P<host_id>[\w\-]+)/detail$', views.info, name='info'),
    url(r'^(?P<host_id>[\w\-]+)/chart$', views.chart, name='chart'),
    url(r'^(?P<host_id>[\w\-]+)/interfaces$', views.network_interface, name='network_interface'),
    url(r'^(?P<host_id>[\w\-]+)/chart_data$', views.chart_data, name='chart_data'),
    url(r'^(?P<host_id>[\w\-]+)/chart_data_detail$', views.chart_data_detail, name='chart_data_detail'),
    url(r'^action$', views.action, name='action'),
    url(r'^action/modal$', views.action_modal, name='modal'),
    url(r'^action/modal/operation$', views.get_operation, name='modal_operation'),
    url(r'^action/submit$', views.submit_action, name='submit_action'),
    url(r'^alarm_log$', views.alarms, name='alarm_log$'),
    url(r'^trigger_list$', views.trigger_list, name='trigger_list'),
    url(r'^get_triggers$', views.get_triggers, name='get_triggers'),
    url(r'^history$', views.history, name='history'),
    url(r'^detail_pop', views.detail_pop, name='detail_pop'),
]