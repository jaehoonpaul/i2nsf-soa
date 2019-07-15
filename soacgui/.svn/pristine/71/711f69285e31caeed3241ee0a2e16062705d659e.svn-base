# _*_ coding:utf-8 _*_
from django.conf.urls import url, include

from sdsecgui.dashboard.identity.projects import views

urlpatterns = [
    url(r'^$', views.get_project_list, name='project_index'),
    url(r'^(?P<project_id>[\w\-]+)/detail$', views.get_project_by_id, name='project_detail'),
    url(r'^create$', views.create_project, name='project_create'),
    url(r'^(?P<project_id>[\w\-]+)/update$', views.update_project, name='project_update'),
    url(r'^(?P<project_id>[\w\-]+)/delete$', views.delete_project, name='project_delete'),
    url(r'^modal$', views.project_modal, name='project_modal'),
]