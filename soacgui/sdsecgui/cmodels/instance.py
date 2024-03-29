# _*_ coding:utf-8 _*_

from ..tools.openstack_restapi import excuteCmd

# set_log_dir()
# logger = get_logger("myapp.myLogger")

class Instance:
    def outputToInfo(self, infoDic, outputList):
        for row in outputList[3:-1]:
            cols = row[1:-1].split("|")
            key = cols[0].strip().replace(" ", "_")
            value = cols[1].strip()
            infoDic[key] = value
            # if infoDic.get(key):
            #     infoDic[key] = value
            # else:
            #     raise Exception, key + "에 해당하는 키가 없습니다."
        return infoDic

    def showInfoById(self, id):
        # id로 가상서버를 찾는다.
        # logger.debug("showInstanceById")
        output = excuteCmd("nova show " + id)

        outputList = output.splitlines()
        if outputList:
            instanceDic = {
                "OS-DCF:diskConfig": "",
                "OS-EXT-AZ:availability_zone": "",
                "OS-EXT-SRV-ATTR:host": "",
                "OS-EXT-SRV-ATTR:hostname": "",
                "OS-EXT-SRV-ATTR:hypervisor_hostnam": "",
                "OS-EXT-SRV-ATTR:instance_name": "",
                "OS-EXT-SRV-ATTR:kernel_id": "",
                "OS-EXT-SRV-ATTR:launch_index": "",
                "OS-EXT-SRV-ATTR:ramdisk_id": "",
                "OS-EXT-SRV-ATTR:reservation_id": "",
                "OS-EXT-SRV-ATTR:root_device_name": "",
                "OS-EXT-SRV-ATTR:user_data": "",
                "OS-EXT-STS:power_state": "",
                "OS-EXT-STS:task_state": "",
                "OS-EXT-STS:vm_state": "",
                "OS-SRV-USG:launched_at": "",
                "OS-SRV-USG:terminated_at": "",
                "accessIPv4": "",
                "accessIPv6": "",
                "config_drive": "",
                "created": "",
                "description": "",
                "flavor": "",
                "hostId": "",
                "host_status": "",
                "id": "",
                "image": "",
                "key_name": "",
                "locked": "",
                "metadata": "",
                "name": "",
                "os-extended-volumes:volumes_attached": "",
                "progress": "",
                "public_network": "",
                "security_groups": "",
                "status": "",
                "tags": "",
                "tenant_id": "",
                "updated": "",
                "user_id": "",
            }
            return self.outputToInfo(instanceDic, outputList)
        else:
            # logger.debug(str("'" + unicode(id).encode("utf-8") + "' 에 해당하는 가상서버가 없습니다."))
            return None

    def __init__(self):
        self.os_dce = {}
        self.os_ext_az = {}
        self.os_ext_srv_attr = {}
        self.os_ext_sts = {}
        self.os_srv_usg = {}
        self.os_extended_volumes = {}
        # self.os_dce["diskConfig"] = ""
        # self.os_ext_az["availability_zone"] = ""
        # self.os_ext_srv_attr["host"] = ""
        # self.os_ext_srv_attr["hostname"] = ""
        # self.os_ext_srv_attr["hypervisor_hostnam"] = ""
        # self.os_ext_srv_attr["instance_name"] = ""
        # self.os_ext_srv_attr["kernel_id"] = ""
        # self.os_ext_srv_attr["launch_index"] = ""
        # self.os_ext_srv_attr["ramdisk_id"] = ""
        # self.os_ext_srv_attr["reservation_id"] = ""
        # self.os_ext_srv_attr["root_device_name"] = ""
        # self.os_ext_srv_attr["user_data"] = ""
        # self.os_ext_sts["power_state"] = ""
        # self.os_ext_sts["task_state"] = ""
        # self.os_ext_sts["vm_state"] = ""
        # self.os_extended_volumes["volumes_attached"] = ""
        # self.os_srv_usg["launched_at"] = ""
        # self.os_srv_usg["terminated_at"] = ""
        # self.accessIPv4 = ""
        # self.accessIPv6 = ""
        # self.config_drive = ""
        # self.created = ""
        # self.description = ""
        # self.flavor = ""
        # self.hostId = ""
        # self.host_status = ""
        # self.id = ""
        # self.image = ""
        # self.key_name = ""
        # self.locked = ""
        # self.metadata = ""
        # self.name = ""
        # self.progress = ""
        # self.public_network = ""
        # self.security_groups = ""
        # self.status = ""
        # self.tags = ""
        # self.tenant_id = ""
        # self.updated = ""
        # self.user_id = ""

    def setById(self, id):
        instanceDic = self.showInfoById(id)
        if instanceDic == None:
            raise Exception, unicode(id).encode("utf-8") + "에 해당하는 가상서버가 없습니다."

        self.os_dce["diskConfig"] = instanceDic.get("OS-DCF:diskConfig")
        self.os_ext_az["availability_zone"] = instanceDic.get("OS-EXT-AZ:availability_zone")
        self.os_ext_srv_attr["host"] = instanceDic.get("OS-EXT-SRV-ATTR:host")
        self.os_ext_srv_attr["hostname"] = instanceDic.get("OS-EXT-SRV-ATTR:hostname")
        self.os_ext_srv_attr["hypervisor_hostnam"] = instanceDic.get("OS-EXT-SRV-ATTR:hypervisor_hostnam")
        self.os_ext_srv_attr["instance_name"] = instanceDic.get("OS-EXT-SRV-ATTR:instance_name")
        self.os_ext_srv_attr["kernel_id"] = instanceDic.get("OS-EXT-SRV-ATTR:kernel_id")
        self.os_ext_srv_attr["launch_index"] = instanceDic.get("OS-EXT-SRV-ATTR:launch_index")
        self.os_ext_srv_attr["ramdisk_id"] = instanceDic.get("OS-EXT-SRV-ATTR:ramdisk_id")
        self.os_ext_srv_attr["reservation_id"] = instanceDic.get("OS-EXT-SRV-ATTR:reservation_id")
        self.os_ext_srv_attr["root_device_name"] = instanceDic.get("OS-EXT-SRV-ATTR:root_device_name")
        self.os_ext_srv_attr["user_data"] = instanceDic.get("OS-EXT-SRV-ATTR:user_data")
        self.os_ext_sts["power_state"] = instanceDic.get("OS-EXT-STS:power_state")
        self.os_ext_sts["task_state"] = instanceDic.get("OS-EXT-STS:task_state")
        self.os_ext_sts["vm_state"] = instanceDic.get("OS-EXT-STS:vm_state")
        self.os_extended_volumes["volumes_attached"] = instanceDic.get("os-extended-volumes:volumes_attached")
        self.os_srv_usg["launched_at"] = instanceDic.get("OS-SRV-USG:launched_at")
        self.os_srv_usg["terminated_at"] = instanceDic.get("OS-SRV-USG:terminated_at")

        self.accessIPv4 = instanceDic.get("accessIPv4")
        self.accessIPv6 = instanceDic.get("accessIPv6")
        self.config_drive = instanceDic.get("config_drive")
        self.created = instanceDic.get("created")
        self.description = instanceDic.get("description")
        self.flavor = instanceDic.get("flavor")
        self.hostId = instanceDic.get("hostId")
        self.host_status = instanceDic.get("host_status")
        self.id = instanceDic.get("id")
        self.image = instanceDic.get("image")
        self.key_name = instanceDic.get("key_name")
        self.locked = instanceDic.get("locked")
        self.metadata = instanceDic.get("metadata")
        self.name = instanceDic.get("name")
        self.progress = instanceDic.get("progress")
        self.public_network = instanceDic.get("public_network")
        self.security_groups = instanceDic.get("security_groups")
        self.status = instanceDic.get("status")
        self.tags = instanceDic.get("tags")
        self.tenant_id = instanceDic.get("tenant_id")
        self.updated = instanceDic.get("updated")
        self.user_id = instanceDic.get("user_id")

    def setDic(self, instanceDic, flavor, image):
        self.os_ext_az["availability_zone"] = instanceDic.get("OS-EXT-AZ:availability_zone")
        self.os_dce["diskConfig"] = instanceDic.get("OS-DCF:diskConfig")
        self.os_ext_srv_attr["host"] = instanceDic.get("OS-EXT-SRV-ATTR:host")
        self.os_ext_srv_attr["hypervisor_hostname"] = instanceDic.get("OS-EXT-SRV-ATTR:hypervisor_hostname")
        self.os_ext_srv_attr["instance_name"] = instanceDic.get("OS-EXT-SRV-ATTR:instance_name")
        self.os_ext_sts["power_state"] = instanceDic.get("OS-EXT-STS:power_state")
        self.os_ext_sts["task_state"] = instanceDic.get("OS-EXT-STS:task_state")
        self.os_ext_sts["vm_state"] = instanceDic.get("OS-EXT-STS:vm_state")
        self.os_srv_usg["launched_at"] = instanceDic.get("OS-SRV-USG:launched_at")
        self.os_srv_usg["terminated_at"] = instanceDic.get("OS-SRV-USG:terminated_at")
        self.addresses = instanceDic.get("addresses")
        self.networks = {}
        for key in self.addresses.keys():
            self.networks[key] = []
            for address in self.addresses[key]:
                self.networks[key].append(address["addr"])
        self.accessIPv4 = instanceDic.get("accessIPv4")
        self.accessIPv6 = instanceDic.get("accessIPv6")
        self.config_drive = instanceDic.get("config_drive")
        self.created = instanceDic.get("created")
        self.flavor = {
            "name" : flavor.name,
            "id" : flavor.id,
            "vcpus" : flavor.vcpus,
            "ram" : flavor.ram,
            "disk" : flavor.disk
        }
        self.hostId = instanceDic.get("hostId")
        self.id = instanceDic.get("id")
        if image:
            self.image = {
                "name" : image.name,
                "id" : image.id
            }
        self.key_name = instanceDic.get("key_name")
        self.metadata = instanceDic.get("metadata")
        self.name = instanceDic.get("name")
        self.os_extended_volumes["volumes_attached"] = instanceDic.get("os-extended-volumes:volumes_attached")
        self.progress = instanceDic.get("progress")
        self.security_groups = instanceDic.get("security_groups")
        self.status = instanceDic.get("status")
        self.tenant_id = instanceDic.get("tenant_id")
        self.updated = instanceDic.get("updated")
        self.user_id = instanceDic.get("user_id")
