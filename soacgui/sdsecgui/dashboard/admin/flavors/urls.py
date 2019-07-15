# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.flavors import views

app_name = "flavor"
urlpatterns = [
    # flavor 주소
    url(r'^$', views.get_flavor_list, name='flavor_list'),
    # url(r'^(?P<flavor_id>[\w\-]+)/detail$', views.get_flavor, name='detail'),
    url(r'^create$', views.create_flavor, name='create'),
    url(r'^(?P<flavor_id>[\w\-]+)/update$', views.update_flavor, name='update'),
    url(r'^(?P<flavor_id>[\w\-]+)/delete$', views.delete_flavor, name='delete'),
    url(r'^modal$', views.flavor_modal, name='modal'),
]