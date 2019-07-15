# _*_ coding:utf-8 _*_
from django.conf.urls import url, include

from sdsecgui.dashboard.domain import views

urlpatterns = [
    # url(r'^.*$', RedirectView.as_view(url=reverse_lazy(views.user_login))),
    # url(r'^$', views.user_login, name='login'),
    # url(r'^dashboard/$', views.user_login, name='login'),
    url(r'^dashboard/domains/?$', views.get_domains, name='getDomains'),
    url(r'^login$', views.root_login, name="root_login"),
    url(r'^domain/login$', views.setting_domain_login, name="domain_login"),
    url(r'^domain/setting$', views.setting_domain, name="domain_setting"),
    url(r'^domain/create$', views.create_domain, name="create_domain"),
    url(r'^domain/(?P<domain_key>[\w\-]+)/up$', views.setting_domain_sequp, name="up_domain"),
    url(r'^domain/(?P<domain_key>[\w\-]+)/down$', views.setting_domain_seqdown, name="down_domain"),
    url(r'^domain/(?P<domain_key>[\w\-]+)/update$', views.update_domain, name="create_domain"),
    url(r'^domain/(?P<domain_key>[\w\-]+)/delete$', views.delete_domain, name="delete_domain"),
    url(r'^domain/modal', views.domain_modal, name="domain_modal"),
    url(r'^domain/(?P<domain_key>[\w\-]+)/modal', views.domain_modal, name="update_domain_modal"),
    url(r'^domain/check$', views.check_domain, name='check_domain'),
    url(r'^domain/db_set$', views.set_database, name='db_set'),
]
