# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.hypervisor import views

app_name = "hipervisors"
urlpatterns = [
    # 이미지 주소
    url(r'^$', views.get_hypervisors, name='hipervisors'),
    url(r'^(?P<image_id>[\w\-]+)/$', views.get_image_by_id, name='image'),
]