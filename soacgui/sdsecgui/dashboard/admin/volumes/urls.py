# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.volumes import views

app_name = "volume"
urlpatterns = [
    # 볼륨 주소
    url(r'^$', views.get_volume_list, name='volume_list'),
    url(r'(?P<volume_id>[\w\-]+)/$', views.get_volume_by_id, name='volume'),
    url(r'create$', views.create_volume, name='create_volume'),
    url(r'(?P<volume_id>[\w\-]+)/delete$', views.delete_volume, name='delete_volume'),

    url(r'^(?P<volume_id>[\w\-]+)/sync_modal$', views.sync_modal, name='sync_volume_modal'),
    url(r'^(?P<volume_id>[\w\-]+)/sync$', views.sync, name='sync_volume'),
]