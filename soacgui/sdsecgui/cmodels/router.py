# _*_ coding:utf-8 _*_
import json
import re

from ..tools.openstack_restapi import excuteCmd
from base import Base

class Router(Base):
    def showInfoJsonById(cls, id):
        output = json.loads(excuteCmd("neutron router-show " + id + " -f json"))
        if output:
            return output
        else:
            return None

    def setById(cls, id):
        cls.routerDic = cls.showInfoJsonById(id)