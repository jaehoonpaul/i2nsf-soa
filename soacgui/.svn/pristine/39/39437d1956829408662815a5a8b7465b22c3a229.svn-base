# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.telemeter.alarms import views

urlpatterns = [
    url(r'^$', views.get_alarm_list, name='alarmList'),
    url(r'^create$', views.create_alarm, name='create_alarm'),
    url(r'^(?P<alarm_id>[\w\-]+)/detail$', views.get_alarm_detail, name='alarmDetail'),
    url(r'^(?P<alarm_id>[\w\-]+)/update$', views.update_alarm, name='update_alarm'),
    url(r'^(?P<alarm_id>[\w\-]+)/delete$', views.delete_alarm, name='delete_alarm'),
    url(r'^(?P<alarm_id>[\w\-]+)/history$', views.getAlarmHistory, name='alarmHistory'),
    url(r'^(?P<instance_id>[\w\-]+)/instance_history$', views.get_alarm_history_by_instance_id, name='alarmHistory'),
    url(r'^accept$', views.accept_alarm_actions, name='acceptAlarm'),
    url(r'^resources$', views.get_resources, name='resources')
]