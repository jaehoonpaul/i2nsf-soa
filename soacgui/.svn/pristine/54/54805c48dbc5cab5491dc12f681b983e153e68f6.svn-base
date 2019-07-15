# _*_ coding:utf-8 _*_
import json
import re

from ..tools.openstack_restapi import excuteCmd
from base import Base

# set_log_dir()
# logger = get_logger("myapp.myLogger")

class Network:
    def outputToInfo(self, outputList):
        infoDic = {}
        for row in outputList[3:-1]:
            cols = row[1:-1].split("|")
            key = cols[0].strip().replace(" ", "_")
            value = cols[1].strip()
            infoDic[key] = value
        return infoDic

    def showInfoJsonById(self, id):
        # id로 네트워크를 찾는다.
        # logger.debug("showNetworkById")
        output = json.loads(excuteCmd("neutron net-show " + id + " -f json"))

        if output:
            return output
        else:
            return None

    def toJSON(self):
        # return json._default_encoder.encode(self.__dict__)
        return json.loads(json.dumps(self, default=lambda o:o.__dict__, sort_keys=True, indent=4))

    def __init__(self):
        self.provider = {}
        self.router = {}
        self.ipv6_address_scope = ""
        self.revision_number = ""
        self.port_security_enabled = ""
        self.id = ""
        self.availability_zone_hints = ""
        self.availability_zones = ""
        self.ipv4_address_scope = ""
        self.shared = ""
        self.project_id = ""
        self.status = ""
        self.subnets = ""
        self.description = ""
        self.tags = ""
        self.updated_at = ""
        self.name = ""
        self.admin_state_up = ""
        self.tenant_id = ""
        self.created_at = ""
        self.mtu = ""
        pass

    def setById(self, id):
        networkDic = self.showInfoJsonById(id)
        if networkDic == None:
            raise Exception, unicode(id).encode("utf-8") + "의 세부 정보를 찾지 못했습니다."
        self.provider["physical_network"] = networkDic.get("provider:physical_network")
        self.provider["network_type"] = networkDic.get("provider:network_type")
        self.provider["segmentation_id"] = networkDic.get("provider:segmentation_id")
        self.router["external"] = networkDic.get("router:external")
        self.ipv6_address_scope = networkDic.get("ipv6_address_scope")
        self.revision_number = networkDic.get("revision_number")
        self.port_security_enabled = networkDic.get("port_security_enabled")
        self.id = networkDic.get("id")
        self.availability_zone_hints = networkDic.get("availability_zone_hints")
        self.availability_zones = networkDic.get("availability_zones")
        self.ipv4_address_scope = networkDic.get("ipv4_address_scope")
        self.shared = networkDic.get("shared")
        self.project_id = networkDic.get("project_id")
        self.status = networkDic.get("status")

        self.subnet_id_list = networkDic.get("subnets").split("\n")
        self.subnets = self.getSubnetList()
        self.dhcpAgents = self.getDHCPagentList()

        self.description = networkDic.get("description")
        self.tags = networkDic.get("tags")
        self.updated_at = networkDic.get("updated_at")
        self.name = networkDic.get("name")
        self.admin_state_up = networkDic.get("admin_state_up")
        self.tenant_id = networkDic.get("tenant_id")
        self.created_at = networkDic.get("created_at")
        self.mtu = networkDic.get("mtu")

    def getSubnetList(self):
        subnets = []
        for subnet_id in self.subnet_id_list:
            subnet = Subnet()
            subnet.setById(subnet_id)
            subnets.append(subnet)
        return subnets

    def setPortList(self):
        self.ports = []
        tempPortList = json.loads(excuteCmd("neutron port-list -f json"))
        for tempPort in tempPortList:
            self.ports.append(json.loads(excuteCmd("neutron port-show " + tempPort["id"] + " -f json")))

    def getDHCPagentList(self):
        output = json.loads(excuteCmd("neutron dhcp-agent-list-hosting-net " + self.id + " -f json"))
        return output
        

class Subnet(Base):
    def __init__(self):
        self.service_types = ""
        self.description = ""
        self.enable_dhcp = ""
        self.network_id = ""
        self.tenant_id = ""
        self.created_at = ""
        self.dns_nameservers = ""
        self.updated_at = ""
        self.ipv6_ra_mode = ""
        self.allocation_pools = ""
        self.gateway_ip = ""
        self.revision_number = ""
        self.ipv6_address_mode = ""
        self.ip_version = ""
        self.host_routes = ""
        self.cidr = ""
        self.project_id = ""
        self.id = ""
        self.subnetpool_id = ""
        self.name = ""
        pass

    def showInfoJsonById(cls, id):
        output = json.loads(excuteCmd("neutron subnet-show " + id + " -f json"))

        if output:
            return output
        else:
            return None

    def toJSON(cls):
        return json.loads(json.dumps(cls, default=lambda o:o.__dict__, sort_keys=True, indent=4))

    def setById(cls, id):
        subnetDic = cls.showInfoJsonById(id)
        if subnetDic == None:
            raise Exception, unicode(id).encode("utf-8") + "의 세부 정보를 찾지 못했습니다."
        cls.service_types = subnetDic.get("service_types")
        cls.description = subnetDic.get("description")
        cls.enable_dhcp = subnetDic.get("enable_dhcp")
        cls.network_id = subnetDic.get("network_id")
        cls.tenant_id = subnetDic.get("tenant_id")
        cls.created_at = subnetDic.get("created_at")
        cls.dns_nameservers = subnetDic.get("dns_nameservers")
        cls.updated_at = subnetDic.get("updated_at")
        cls.ipv6_ra_mode = subnetDic.get("ipv6_ra_mode")
        cls.allocation_pools = []
        for allocation_pool in subnetDic.get("allocation_pools").split("\n"):
            cls.allocation_pools.append(json.loads(allocation_pool))
        cls.gateway_ip = subnetDic.get("gateway_ip")
        cls.revision_number = subnetDic.get("revision_number")
        cls.ipv6_address_mode = subnetDic.get("ipv6_address_mode")
        cls.ip_version = subnetDic.get("ip_version")
        cls.host_routes = subnetDic.get("host_routes")
        cls.cidr = subnetDic.get("cidr")
        cls.project_id = subnetDic.get("project_id")
        cls.id = subnetDic.get("id")
        cls.subnetpool_id = subnetDic.get("subnetpool_id")
        cls.name = subnetDic.get("name")
        ipv4_pattern = re.compile("[\d]+\.[\d]+\.[\d]+\.([\d]+)")
        ipv6_pattern = re.compile("[\w]+:[\w]+:[\w]+:[\w]*:([\w:]+)")
        """
        ^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$
        """
        # cls.remain_ip = cls.allocation_pools.get("start")

class Port(Base):
    def showInfoJsonById(cls, id):
        output = json.loads(excuteCmd("neutron port-show " + id + " -f json"))
        if output:
            return output
        else:
            return None

    def setById(cls, id):
        cls.portDic = cls.showInfoJsonById(id)


class DHCPagent(Base):
    def __init__(self):
        self.host = ""
        self.id = ""
        self.alive = ""
        self.admin_state_up = ""
    def showInfoJsonById(cls, id):
        output = json.loads(excuteCmd("neutron dhcp-agent-list-hosting-net " + id + " -f json"))
        if output:
            return output
        else:
            return None

    def setById(cls, id):
        dhcpAgentDic = cls.showInfoJsonById(id)
        cls.host = dhcpAgentDic.get("host")
        cls.id = dhcpAgentDic.get("id")
        cls.alive = dhcpAgentDic.get("alive")
        cls.admin_state_up = dhcpAgentDic.get("admin_state_up")