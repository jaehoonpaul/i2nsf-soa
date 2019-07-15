# _*_ coding:utf-8 _*_
from django.conf.urls import url

from sdsecgui.dashboard.admin.defaults import views

app_name = "quota"
urlpatterns = [
    # 볼륨 주소
    url(r'^$', views.retrieveQuotaList, name='quotaList'),
]