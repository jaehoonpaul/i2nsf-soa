# _*_ coding:utf-8 _*_
from django.conf.urls import url, include

from sdsecgui.soa import views

urlpatterns = [
    url(r'^dashboard/login/soa$', views.admin_login_soa, name='ajax_login_soa'),
    url(r'^dashboard/identity/projects/create/soa$', views.create_project_for_soa, name='project_create_for_soa'),
    url(r'^dashboard/identity/users/create/soa$', views.create_user_for_soa, name='create_user_for_soa'),
    url(r'^dashboard/identity/users/delete/soa$', views.delete_user_for_soa, name='delete_user_for_soa'),
]
