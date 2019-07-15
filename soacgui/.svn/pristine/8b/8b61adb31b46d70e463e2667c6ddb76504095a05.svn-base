# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.identity.users import views

urlpatterns = [
    url(r'^$', views.get_user_list, name='user_index'),
    url(r'^(?P<user_id>[\w\-]+)/detail$', views.get_user_by_id, name='user_info'),
    url(r'^create$', views.create_user, name='user_create'),
    url(r'^(?P<user_id>[\w\-]+)/update$', views.update_user, name='user_update'),
    url(r'^(?P<user_id>[\w\-]+)/delete$', views.delete_user, name='user_delete'),
    url(r'^modal$', views.user_modal, name='user_modal'),
]