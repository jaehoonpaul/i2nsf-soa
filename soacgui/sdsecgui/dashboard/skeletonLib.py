#!/usr/bin/python
# -*- coding: utf-8 -*- from credentials import get_keystone_creds
import json
import os
import uuid
from ConfigParser import ConfigParser

# import keystoneclient.v2_0.client as ksclient
from sdsecgui.tools.openstack_restapi import NovaRestAPI, GlanceRestAPI, NeutronRestAPI
# struct -> dict, array -> list
import requests

from sdsecgui.tools.keystone_exception import Unauthorized

config = ConfigParser()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
configPath = os.path.join(BASE_DIR, 'SOAC.conf')
config.read(configPath)
section = 'SETTINGS'

class ControllerEngine:
    # AUTH_URL = config.get(section, 'AUTH_URL')
    def getToken(self, domain_name, tenant_name, user_name, password):
        # return {'success': {'message': 'The token issued', 'code': 201, 'token': "aaaaaaaaaaaaa"}}
        # KEYSTONE V3 CODE
        headers = {'Accept': 'application/json'}
        body = {
            'auth': {
                'identity': {
                    'methods': ['password'],
                    'password': {
                        'user': {
                            'name': user_name,
                            'domain': {'name': domain_name},
                            'password': password
                        }
                    }
                },
                'scope': {
                    'project': {
                        'name': tenant_name,
                        'domain': {'name': domain_name}
                    }
                }
            }

        }

        try:
            # body['auth']['identity'] = {'methods': ['password'], 'password': {'user':{'name':user_name, 'domain':{'name':domain_name}, 'password':password}}}
            # print body
            # print self.AUTH_URL+'/auth/tokens'
            response = requests.post(self.AUTH_URL + '/auth/tokens', headers=headers, json=body)
            # print response.status_code
            # print response.__dict__

            if response.status_code == 201:
                return {'success': {'message': 'The token issued', 'code': 201,
                                    'token': response.headers['X-Subject-Token']}}
            if response.status_code == 401:
                return response._content
            return response._content
        except BaseException as e:
            result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
        return result

    #
    # def getToken_v2(self, domain_name, tenant_name, user_name, password):
    #     # token_id = '2dc5d35fc791487ebdd32ec38e2edeed'
    #     # result = {'error': {'message': 'The request you have made requires authentication', 'code': 401,
    #     #                     'title': 'Unauthorized'}}
    #     # result = {'success': {'message': 'The token issued', 'code': 200, 'token': token_id}}
    #     #
    #     # # KEYSTONE V3 CODE
    #     # headers = {'Accept': 'application/json'}
    #     # body = {
    #     #     'auth': {
    #     #         'identity': {
    #     #             'methods': ['password'],
    #     #             'password': {
    #     #                 'user': {
    #     #                     'name': user_name,
    #     #                     'domain': {'name': domain_name},
    #     #                     'password': password
    #     #                 }
    #     #             }
    #     #         },
    #     #         'scope': {
    #     #             'project': {
    #     #                 'name': user_name,
    #     #                 'domain': {'name': domain_name}
    #     #             }
    #     #         }
    #     #     }
    #     #
    #     # }
    #
    #     config = ConfigParser()
    #     BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    #     configPath = os.path.join(BASE_DIR, 'SOAC.conf')
    #     config.read(configPath)
    #     section = 'SETTINGS'
    #     OPENSTACK_AUTH_URL = config.get(section, 'AUTH_URL')
    #     try:
    #         keystone = ksclient.Client(auth_url=OPENSTACK_AUTH_URL,
		# 							   username=user_name,
		# 							   password=password,
    #                                    tenant_name=tenant_name)
    #         auth_token = str(keystone.auth_token)
    #         result = {'success':{'message':'The token issued','code':200, 'token':auth_token}}
    #     except BaseException as e:
    #         result = {'error':{'message':str(e),'code':401, 'title':'Unauthorized'}}
    #         # result =  {'success':{'message':'The token issued','code':200, 'token':'4342-3412-2354634-53465'}}
    #     return result

    '''
    def checkToken(self, token):
        result = {'error':{'message':'Something wrong','code':500, 'title':'Function error'}}
        result = {'error':{'message':'The request you have made requires authentication','code':401, 'title':'Unauthorized'}}
        return result
    '''

    def createMap(self, service_id, map_data):
        return {"success": {"map_data": map_data}}

    def get_map(self, service_id):
        if service_id != "46a9ece2-a4bd-11e6-bc66-1866dae80e95":
            result = {
                "success": {
                    "map_data": {
                        "resources": [
                            {'name': 'public_network', "resource_type": "internet"},
                            {'name': 'vRouter-01', "resource_type": "router"},
                            {'name': 'vNetwork-01', "resource_type": "network"},
                            {'name': 'provider', "resource_type": "network"},
                            {'name': 'instance-test-02', "resource_type": "virtual_machine"},
                            {'name': 'instance-test-03', "resource_type": "virtual_machine"},
                            {'name': 'instance-test-01', "resource_type": "virtual_machine"},
                            {'name': "test_volume-1", "resource_type": "volume"},
                            {'name': "test_volume-2", "resource_type": "volume"},
                            {'name': "test_volume-3", "resource_type": "volume"}
                        ],
                        "links": [
                            {"source": "vNetwork-01", "target": "instance-test-02"},
                            {"source": "vNetwork-01", "target": "instance-test-03"},
                            {"source": "provider", "target": "instance-test-01"},
                            {"source": "vRouter-01", "target": "vNetwork-01"},
                            {"source": "vRouter-01", "target": "provider"},
                            {"source": "public_network", "target": "vRouter-01"},
                            {"source": "instance-test-02", "target": "test_volume-2"},
                            {"source": "instance-test-03", "target": "test_volume-3"},
                            {"source": "instance-test-01", "target": "test_volume-1"},
                        ]
                    }
                }
            }
            # result = {'error': {'message': '메시지 테스트', 'code': 301, 'title': 'Unauthorized'}}
        else:
            result = {"error":{"message":"not found service","code":"404", "title":"Not Found Error"}}
        #     result = {
        #         "success": {
        #             "map_data": {
        #                 "resources": [
        #                     {'name': 'public_network', "resource_type": "internet"},
        #                     {'name': 'vRouter-01', "resource_type": "router"},
        #                     {'name': 'vNetwork-01', "resource_type": "network"},
        #                     {'name': 'instance-test-02', "resource_type": "virtual_machine"},
        #                     {'name': 'instance-test-03', "resource_type": "virtual_machine"},
        #                     {'name': "test_volume-1", "resource_type": "volume"},
        #                     {'name': "test_volume-2", "resource_type": "volume"}
        #                 ],
        #                 "links": [
        #                     {"source": "vNetwork-01", "target": "instance-test-02"},
        #                     {"source": "vNetwork-01", "target": "instance-test-03"},
        #                     {"source": "vRouter-01", "target": "vNetwork-01"},
        #                     {"source": "public_network", "target": "vRouter-01"},
        #                     {"source": "instance-test-02", "target": "test_volume-1"},
        #                     {"source": "instance-test-03", "target": "test_volume-2"},
        #                 ]
        #             }
        #         }
        #     }
        return result

    def get_service_detail_and_link_list(self, service_id):
        """
        서비스 상세정보와 Map 출력
        :param service_id:
        :return:
        """
        service_detail = self.get_service(service_id)
        map_data = self.get_map(service_id)
        return service_detail, map_data

    # def get_service_list(self):
    # 	serviceList = {
    # 		"success": {
    # 			"service_list": [
    # 				{
    # 					"status": "CREATE_COMPLETE",
    # 					"region_id": "1",
    # 					"stack_name": "template-2vm_1net",
    # 					"tenant_name": "admin",
    # 					"create_at": "2016-11-07T16:39:14", "updated_at": None,
    # 					"stack_id": "f4277364-45a5-46eb-a4d5-3560eed95ed5",
    # 					"user_name": "admin",
    # 					"service_id": "46a9ece2-a4bd-11e6-bc66-1866dae80e95",
    # 					"deleted_at": None,
    # 					"mdc_id": "1",
    # 					"id": 4
    # 				}
    # 			]
    # 		}
    # 	}
    # 	return serviceList

    def get_service_list(self, token=None, domain_name=None, tenant_name=None, user_name=None, admin=None):
        service_list = {
            "success": {
                "service_list": [
                    # {
                    #     "status": "CREATE_COMPLETE",
                    #     "region_id": "1",
                    #     "stack_name": "template-2vm_1net",
                    #     "tenant_name": "admin",
                    #     "create_at": "2016-11-07T16:39:14", "updated_at": None,
                    #     "stack_id": "f4277364-45a5-46eb-a4d5-3560eed95ed5",
                    #     "user_name": "admin",
                    #     "service_id": "46a9ece2-a4bd-11e6-bc66-1866dae80e95",
                    #     "deleted_at": None,
                    #     "mdc_id": "1",
                    #     "id": 4,
                    #     "service_description": "Generated template",
                    # },
                    {
                        "status": "CREATE_COMPLETE",
                        "region_id": "1",
                        "stack_name": "template-3vm_2net",
                        "tenant_name": "admin",
                        "create_at": "2016-11-07T16:39:14", "updated_at": None,
                        "stack_id": "f4277364-45a5-46eb-a4d5-3560eed95ed6",
                        "user_name": "admin",
                        "service_id": "46a9ece2-a4bd-11e6-bc66-1866dae80e96",
                        "deleted_at": None,
                        "mdc_id": "1",
                        "id": 4,
                        "service_description": "Generated template"
                    }
                ]
            },
            "error": {'message': 'ControllerEngine의 경로가 올바르지 않거나 ControllerEngine에 오류가 발생하여 서비스 관련 기능을 이용하실 수 없습니다.(Demo모드로 운영)', 'code': 500, 'title': 'Controller lib'}
        }
        return service_list

    def createService(self, token, domain_name, tenant_name, user_name, service_template_list, map_info=None):
        result = {}
        # TODO: 1) CHECK USER & TOKEN (from cookie)
        # glance_endpoint = keystone.service_catalog.url_for(service_type='image')
        # glance = glclient.Client(glance_endpoint, token=keystone.auth_token)     =>    checkToken()
        # images_iter = glance.images.list()  <- If unauthorized, return error message

        # TODO: 2) CHECK PARAMETERS

        # TODO: 3) MAKE TEMPLATE
        # createTemplate()

        # TODO: 4) CALL OPENSTACk LIB
        # create_service(domain_name, tenant_name, user_name, mdc_id, stack_name, hot_path)

        # TODO: 5) STORE TEH RETURN VALUES TO DATABASE

        # TODO: 6) RETRUN VALUES

        # 토큰이 유효하지 않으면 아래와 같은 에러 메시지
        # result = {'error':{'message':'The request you have made requires authentication','code':401, 'title':'Unauthorized'}}

        result = {"success":{'region_id': 'region-0001', 'name': 'template-0001', 'service_id': '', 'status': 'CREATE_COMPLETE'}}
        return result

    def modifyService(self, token, domain_name, tenant_name, user_name, service_id, service_template_list):
        result = {}
        result = {"success":{'region_id': 'region-0001', 'name': 'template-0001', 'status': 'UPDATE_IN_PROGRESS'}}
        return result

    def deleteService(self, token, domain_name, tenant_name, user_name, service_id):
        result = {}
        result = {"success":{'region_id': 'region-0001', 'name': 'template-0001', 'status': 'DELETE_COMPLETE'}}
        return result

    # def get_service(self, token, domain_name, tenant_name, user_name, service_id):
    # 	service_detail = {}
    # 	service_detail['region_id'] = 'region-0001'
    # 	service_detail['name'] = 'template-0001'
    # 	service_detail['status'] = 'CREATE_COMPLETE'
    #
    # 	service_detail['vm_list'] = []
    # 	vm = {}
    # 	vm['vm_name'] = 'test-vm-01'
    # 	vm['vm_id'] = '0553b367-25d5-4285-a343-34b0a2bdda37'		# VM UUID
    # 	vm['vnic_list'] = []
    # 	vnic = {}
    # 	vnic['name'] = 'test-vnic-01'
    # 	vnic['mac'] = 'test-vnic-01'
    # 	vnic['private_ip'] = '192.168.10.99'
    # 	vnic['floating_ip'] = '10.121.17.8'
    # 	vm['vnic_list'].append(vnic)
    # 	vm['status'] = 'Active'
    # 	service_detail['vm_list'].append(vm)
    #
    # 	service_detail['volume_list'] = []
    # 	volume = {}
    # 	volume['volume_name'] = 'test-volume-01'
    # 	volume['volume_id'] = '0553b367-25d5-4285-a343-34b0a2bdda30'
    # 	volume['attachment'] = {}
    # 	attachment={}
    # 	attachment['vm_name'] = 'test-vm-01'
    # 	attachment['device'] = ''
    # 	volume['attachment'] = attachment
    # 	volume['status'] = ''
    # 	service_detail['volume_list'].append(volume)
    #
    # 	service_detail['network_list'] = []
    # 	network = {}
    # 	network['network_name'] = 'test-net-01'
    # 	network['network_id'] = '0553b367-25d5-4285-a343-34b0a2bdda3a'
    # 	network['subnet_id'] = ''
    # 	network['status'] = ''
    # 	service_detail['network_list'].append(network)
    #
    # 	service_detail['vrouter_list'] = []
    # 	vrouter = {}
    # 	vrouter['vrouter_name'] = 'test-vrouter-01'
    # 	vrouter['vrouter_id'] = '0553b367-25d5-4285-a343-34b0a2bdda3b'
    # 	vrouter['status'] = ''
    # 	service_detail['vrouter_list'].append(vrouter)
    #
    # 	service_detail['loadbalancer_list'] = []
    # 	loadbalancer = {}
    # 	loadbalancer['lb_name'] = 'test-lb-01'
    # 	loadbalancer['lb_pool_id'] = '0553b367-25d5-4285-a343-34b0a2bdda3d'
    # 	loadbalancer['vip'] = {}
    # 	vip = {}
    # 	vip['vip_id'] = ''
    # 	vip['private_vip'] = ''
    # 	vip['public_vip'] = ''
    # 	loadbalancer['vip'] = vip
    # 	loadbalancer['member_id'] = []
    # 	loadbalancer['monitor_id'] = []
    # 	loadbalancer['status'] = ''
    # 	service_detail['loadbalancer_list'].append(loadbalancer)
    #
    # 	service_detail['firewall_list'] = []
    # 	firewall = {}
    # 	firewall['fw_name'] = 'test-fw-01'
    # 	firewall['fw_id'] = '0553b367-25d5-4285-a343-34b0a2bdda3e'
    # 	firewall['fw_rule_id'] = []
    # 	firewall['status'] = ''
    # 	service_detail['firewall_list'].append(firewall)
    #
    # 	service_detail['vpn_list'] = []
    # 	vpn = {}
    # 	vpn['vpn_name'] = 'test-vpn-01'
    # 	vpn['vpn_id'] = '0553b367-25d5-4285-a343-34b0a2bdda3f'
    # 	vpn['status'] = ''
    # 	service_detail['vpn_list'].append(vpn)
    # 	return service_detail

    def get_service(self, token=None, domain_name=None, tenant_name=None, user_name=None, service_id=None):
        if service_id != "46a9ece2-a4bd-11e6-bc66-1866dae80e95":
            service_detail = {
                "success": {
                    "service_detail": {
                        'service_description': '3 vms and 2 net',
                        'name': 'template-3vm_2net',
                        'network_list': [
                            {
                                "network_id": "61201c61-c652-4287-af5b-df9b952eb595",
                                'alloc_pools_list': [
                                    {
                                        'end': '10.2.31.254',
                                        'start': '10.2.31.2'
                                    }
                                ],
                                'cidr': '10.2.31.0/24',
                                'dns_list': ['8.8.8.8'],
                                'enable_dhcp': True,
                                'gateway_ip': '10.2.31.1',
                                'ip_version': 4,
                                'network_name': 'vNetwork-01'
                            },
                            {
                                "network_id": "b16c4d39-d6c6-46e0-97db-7372700c7f2e",
                                'alloc_pools_list': [
                                    {
                                        'end': '192.168.10.254',
                                        'start': '192.168.10.2'
                                    }
                                ],
                                'cidr': '192.168.10.0/24',
                                'dns_list': ['8.8.8.8'],
                                'enable_dhcp': True,
                                'gateway_ip': '192.168.10.1',
                                'ip_version': 4,
                                'network_name': 'provider'
                            },
                        ],
                        'region_id': 'region-0001',
                        'vm_list': [
                            {
                                "vm_id": "e56b1d72-d300-4f5d-9324-c1df05f7d3c2",
                                'admin_pass': '1111',
                                'flavor': 'm1.nano',
                                'image': 'cirros-0.3.4',
                                'key_name': 'my_key',
                                'vm_name': 'instance-test-02',
                                'vnic_list': [
                                    {
                                        'name': 'vSubnet-01',
                                        'public_ip': False,
                                        'tenant_net': 'vNetwork-01'
                                    }
                                ]
                            },
                            {
                                "vm_id": "9d3f7a1a-fd78-43d3-8294-5ae0789bf76e",
                                'admin_pass': '1111',
                                'flavor': 'm1.nano',
                                'image': 'cirros-0.3.4',
                                'key_name': 'my_key',
                                'vm_name': 'instance-test-03',
                                'vnic_list': [
                                    {
                                        'name': 'vSubnet-02',
                                        'public_ip': False,
                                        'tenant_net': 'vNetwork-01'
                                    }
                                ]
                            },
                            {
                                "vm_id": "3cc95085-7cb3-46f3-8543-eb243507cb02",
                                'admin_pass': '1111',
                                'flavor': 'm1.nano',
                                'image': 'cirros-0.3.4',
                                'key_name': 'my_key',
                                'vm_name': 'instance-test-01',
                                'vnic_list': [
                                    {
                                        'name': 'provider',
                                        'public_ip': False,
                                        'tenant_net': 'provider'
                                    }
                                ]
                            }
                        ],
                        'vrouter_list': [
                            {
                                "vrouter_id": "7b6edeff-b4ae-49c2-8819-1d1f11dc857e",
                                'external_net': 'public_network',
                                'vrouter_name': 'vRouter-01',
                                'tenant_net_list': ['vNetwork-01', 'vNetwork-02']
                            }
                        ],
                        'volume_list': [
                            {
                                "volume_id": "6",
                                'volume_name': "instance-test-01_test_volume-1"
                            },
                            {
                                "volume_id": "7",
                                'volume_name': "instance-test-02_test_volume-2"
                            },
                            {
                                "volume_id": "8",
                                'volume_name': "instance-test-03_test_volume-3"
                            }
                        ]
                    }
                }
            }
        else:
            service_detail = {"error":{"title":"Not Found Error", "message": "not exist service", "code":"404"}}
            # service_detail = {"success": {"service_detail": {
            #     'service_description': '2 vms and 1 net',
            #     'name': 'template-2vm_1net',
            #     'network_list': [
            #         {
            #             "network_id": "4",
            #             'alloc_pools_list': [
            #                 {
            #                     'end': '10.11.15.254',
            #                     'start': '10.11.15.2'
            #                 }
            #             ],
            #             'cidr': '10.11.15.0/24',
            #             'dns_list': ['8.8.8.8'],
            #             'enable_dhcp': True,
            #             'gateway_ip': '10.11.15.1',
            #             'ip_version': 4,
            #             'network_name': 'vNetwork-01'
            #         }
            #     ],
            #     'region_id': 'region-0001',
            #     'vm_list': [
            #         {
            #             "vm_id": "9d3f7a1a-fd78-43d3-8294-5ae0789bf76e",
            #             'admin_pass': '1111',
            #             'flavor': 'm1.tiny',
            #             'image': 'cirros-0.3.4',
            #             'key_name': 'my_key',
            #             'vm_name': 'instance-test-02',
            #             'vnic_list': [
            #                 {
            #                     'name': 'test-vnic-01',
            #                     'public_ip': False,
            #                     'tenant_net': 'vNetwork-01'
            #                 }
            #             ]
            #         },
            #         {
            #             "vm_id": "177e4a78-029f-4d58-8f0d-a7d00cf39ec6",
            #             'admin_pass': '1111',
            #             'flavor': 'm1.tiny',
            #             'image': 'cirros-0.3.4',
            #             'key_name': 'my_key',
            #             'vm_name': 'instance-test-03',
            #             'vnic_list': [
            #                 {
            #                     'name': 'test-vnic-02',
            #                     'public_ip': False,
            #                     'tenant_net': 'vNetwork-01'
            #                 }
            #             ]
            #         }
            #     ],
            #     'vrouter_list': [
            #         {
            #             "vrouter_id": "3",
            #             'external_net': 'ETRI_NET',
            #             'vrouter_name': 'vRouter-01',
            #             'tenant_net_list': ['private_subnet-1']
            #         }
            #     ],
            #     'volume_list': [
            #         {
            #             "volume_id": "6",
            #             'volume_name': "test_volume-1"
            #         },
            #         {
            #             "volume_id": "7",
            #             'volume_name': "test_volume-2"
            #         }
            #     ]
            # }}}
        return service_detail

    def get_service_vm(self, token=None, domain_name=None, tenant_name=None, user_name=None, service_id=None):
        result = {
            "success": {
                "vm_list": [
                    {
                        "vm_id": "e56b1d72-d300-4f5d-9324-c1df05f7d3c2",
                        'admin_pass': '1111',
                        'flavor': 'm1.nano',
                        'image': 'cirros-0.3.4',
                        'key_name': 'my_key',
                        'vm_name': 'instance-test-02',
                        'vnic_list': [
                            {
                                'name': 'vSubnet-01',
                                'public_ip': False,
                                'tenant_net': 'vNetwork-01'
                            }
                        ]
                    },
                    {
                        "vm_id": "9d3f7a1a-fd78-43d3-8294-5ae0789bf76e",
                        'admin_pass': '1111',
                        'flavor': 'm1.nano',
                        'image': 'cirros-0.3.4',
                        'key_name': 'my_key',
                        'vm_name': 'instance-test-03',
                        'vnic_list': [
                            {
                                'name': 'vSubnet-02',
                                'public_ip': False,
                                'tenant_net': 'vNetwork-01'
                            }
                        ]
                    },
                    {
                        "vm_id": "3cc95085-7cb3-46f3-8543-eb243507cb02",
                        'admin_pass': '1111',
                        'flavor': 'm1.nano',
                        'image': 'cirros-0.3.4',
                        'key_name': 'my_key',
                        'vm_name': 'instance-test-01',
                        'vnic_list': [
                            {
                                'name': 'provider',
                                'public_ip': False,
                                'tenant_net': 'provider'
                            }
                        ]
                    }
                ]
            }
        }
        return result


    def getNetworkList(self, token, domain_name, project_name, user_name):
        result = {"success": {"networks": [
            {
                "id": "75efa3a7-14b8-451a-8c0d-43a9d0794515", "name": "public_network", "router:external": True
            }
        ]}}
        return result


    def createSampleServiceTemplate(self):
        service_template = {}
        service_template['region_id'] = 'region-0001'
        service_template['name'] = 'template-0001'
        service_template['description'] = 'test template'
        service_template['vm_template_list'] = []

        vm_template = {}
        vm_template['server_name'] = 'test-vm-01'
        vm_template['flavor'] = 'm1.tiny'
        vm_template['image'] = 'cirros'
        vm_template['vnic_list'] = []

        vnic = {}
        vnic['name'] = 'test-vnic-01'
        vnic['tenant_net'] = ''
        vnic['public_ip'] = False
        vm_template['vnic_list'].append(vnic)
        vm_template['volume_list'] = []

        volume = {}
        volume['name'] = 'test-volume-01'
        volume['type'] = 'lvm'
        volume['size'] = 1
        volume['image'] = ''
        volume['snapshot'] = ''

        vm_template['volume_list'].append(volume)
        vm_template['admin_pass'] = '1111'
        vm_template['key_name'] = 'my_key'

        service_template['vm_template_list'].append(vm_template)
        service_template['network_list'] = []

        network = {}
        network['name'] = 'test-net-01'
        network['cidr'] = '192.168.10.0/24'
        network['gateway_ip'] = '192.168.10.1'
        network['alloc_pools_list'] = []

        alloc_pools = {}
        alloc_pools['start'] = ''
        alloc_pools['end'] = ''

        network['ip_version'] = 4
        network['dns_list'] = []
        network['enable_dhcp'] = True

        service_template['network_list'].append(network)
        service_template['vrouter'] = {}

        vrouter = {}
        vrouter['name'] = 'test-vrouter-01'
        vrouter['external_net'] = 'public'
        vrouter['tenant_net_list'] = []

        service_template['vrouter'] = vrouter
        service_template['loadbalancer_list'] = []

        loadbalancer = {}
        loadbalancer['name'] = 'test-lb-01'
        loadbalancer['description'] = ''
        loadbalancer['pool_member_list'] = []

        pool_member = {}
        pool_member['name'] = 'test-pool-01'
        pool_member['protocol_port'] = ''
        pool_member['weight'] = 1

        loadbalancer['pool_member_list'].append(pool_member)
        loadbalancer['tenant_net'] = ''
        loadbalancer['public_vip'] = False
        loadbalancer['lb_method'] = ''
        loadbalancer['protocol'] = ''
        loadbalancer['port'] = 80
        loadbalancer['connection_limit'] = 100
        loadbalancer['persistence'] = ''
        loadbalancer['cookie_name'] = ''
        loadbalancer['monitors_list'] = []

        monitors = {}
        monitors['name'] = 'test-monitor-01'
        monitors['type'] = 'HTTP'
        monitors['delay'] = 60
        monitors['timeout'] = 600
        monitors['max_retries'] = 6
        monitors['http_method'] = ''
        monitors['url_path'] = ''
        monitors['expected_codes_list'] = []

        service_template['loadbalancer_list'].append(loadbalancer)
        service_template['firewall'] = {}

        firewall = {}
        firewall['name'] = 'test-fw-01'
        firewall['description'] = ''
        firewall['fw_rule_list'] = []

        fw_rule = {}
        fw_rule['name'] = 'test-fw-rule-01'
        fw_rule['description'] = ''
        fw_rule['protocol'] = 'TCP'
        fw_rule['src_ip'] = '192.168.0.99'
        fw_rule['dst_ip'] = ''
        fw_rule['src_port'] = ''
        fw_rule['dst_port'] = ''
        fw_rule['action'] = 'ALLOW'
        fw_rule['enabled'] = True

        service_template['firewall'] = firewall
        service_template['vpn_list'] = []

        vpn = {}
        vpn['name'] = 'test-vpn-01'
        vpn['description'] = ''
        vpn['tenant_net'] = ''
        vpn['peer_region_id'] = ''
        vpn['peer_tenant_net'] = ''
        vpn['mtu'] = 1500
        vpn['psk'] = ''
        service_template['vpn_list'].append(vpn)
        return service_template

    def suspendService(self, token, domain_name, tenant_name, user_name, service_id, region_id=None):
        result = {}
        result = {'region_id': 'region-0001', 'name': 'template-0001', 'status': 'SUSPEND_COMPLETE'}
        return result

    def resumeService(self, token, domain_name, tenant_name, user_name, service_id, region_id=None):
        result = {}
        result = {'region_id': 'region-0001', 'name': 'template-0001', 'status': 'RESUME_COMPLETE'}
        return result

    def suspendResource(self, token, domain_name, tenant_name, user_name, service_id, region_id, resource_id,
                        resource_type):
        # RESOURCE_TYPE : VM, NETWORK, PORT, ROUTER, VOLUME, LB, FW, VPN
        result = {}
        result = {'status': 'SUSPENDED'}
        return result

    def resumeResource(self, token, domain_name, tenant_name, user_name, service_id, region_id, resource_id,
                       resource_type):
        result = {}
        result = {'status': 'ACTIVE'}
        return result

    def showResource(self, token, domain_name, project_name, user_name, resource_type, resource_id):
        if resource_type == "SERVER":
            nova = NovaRestAPI("http://192.168.10.25:35357/v3", token)
            result = nova.get_server(resource_id)
            if result.get("success"):
                result["success"]["server"]["image"] = {"id": "0123"}
        elif resource_type == "NETWORK":
            neutron = NeutronRestAPI("http://192.168.10.25:35357/v3", token)
            # result = {"success":{"network":neutron.getNetwork(resource_id)}}
            result = neutron.getNetwork(resource_id)
        elif resource_type == "ROUTER":
            neutron = NeutronRestAPI("http://192.168.10.25:35357/v3", token)
            result = neutron.getRouter(resource_id)
            # result = {"success":{"router":getNetworkById(sess, "94a247dd-ddec-4459-9281-809710d1f704")._info}}
        else:
            result = {'status': 'ACTIVE'}
        return result

    def getFlavorList(self, token, domain_name, project_name, user_name):
        nova = NovaRestAPI("http://192.168.10.25:35357/v3", token)
        result = nova.get_flavor_list()
        return result

    def getFlavorDetails(self, token, domain_name, project_name, user_name, fid):
        nova = NovaRestAPI("http://192.168.10.25:35357/v3", token)
        result = nova.get_flavor(fid)
        return result

    def getImageList(self, token, domain_name, project_name, user_name):
        glance = GlanceRestAPI("http://192.168.10.25:35357/v3", token)
        result = glance.get_image_list()
        return result
    def getImageDetails(self, token, domain_name, project_name, user_name, iid):
        # sess = login(token, domain_name, project_name)
        # result = {"success": {"image":get_image(sess, iid).__dict__}}
        result = {"success":{"image":{"name":"가데이터이미지","id":"0123"}}}
        return result

    def flow_classifier_create(self, token, domain_name, tenant_name, user_name, flow_classifier):
        """Create a Flow Classifier."""
        """
        self.debug(msg="", title='Create a Flow Classifier.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url
        # return {'error':{'message':'getService Error','code':str(500), 'title':'getService Error'}}

        url_regex = '/v2.0/sfc/flow_classifiers'
        url = network_url + url_regex

        result = {}

        body = {}
        if flow_classifier.get('name'):
            body['name'] = flow_classifier['name']
        if flow_classifier.get('desc'):
            body['description'] = flow_classifier['desc']
        if flow_classifier.get('tenant_id'):
            body['tenant_id'] = flow_classifier['tenant_id']
        if flow_classifier.get('protocol'):
            body['protocol'] = flow_classifier['protocol']
        if flow_classifier.get('source_port_range_min'):
            body['source_port_range_min'] = flow_classifier['source_port_range_min']
        if flow_classifier.get('source_port_range_max'):
            body['source_port_range_max'] = flow_classifier['source_port_range_max']
        if flow_classifier.get('destination_port_range_min'):
            body['destination_port_range_min'] = flow_classifier['destination_port_range_min']
        if flow_classifier.get('destination_port_range_max'):
            body['destination_port_range_max'] = flow_classifier['destination_port_range_max']
        if flow_classifier.get('source_ip_prefix'):
            body['source_ip_prefix'] = flow_classifier['source_ip_prefix']
        if flow_classifier.get('destination_ip_prefix'):
            body['destination_ip_prefix'] = flow_classifier['destination_ip_prefix']
        if flow_classifier.get('logical_source_port'):
            body['logical_source_port'] = flow_classifier['logical_source_port']
        if flow_classifier.get('logical_destination_port'):
            body['logical_destination_port'] = flow_classifier['logical_destination_port']

        body['tenant_id'] = project_id
        body = {'flow_classifier': body}
        self.debug(msg=body)

        (status_code, headers, contents) = self.post_with_token(token, url, body)
        """
        return {'success': {'message': 'Flow classifier was created', 'code': 201,
                            'id': "contents['flow_classifier']['id']"}}

    def flow_classifier_delete(self, token, domain_name, tenant_name, user_name, flow_classifier_id):
        """Delete a flow classifier."""
        """
        self.debug(msg="", title='Delete a flow classifier.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url

        url_regex = '/v2.0/sfc/flow_classifiers'
        url = network_url + url_regex + '/' + flow_classifier_id

        result = {}
        body = {}

        (status_code, headers, contents) = self.delete_with_token(token, url)

        if status_code == 200:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair was deleted', 'code': 200, 'id': flow_classifier_id}}
        if status_code == 204:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair was deleted', 'code': 204, 'id': flow_classifier_id}}
        """
        return {'success': {'message': 'port pair was deleted', 'code': 200, 'id': "flow_classifier_id"}}

    # if status_code == 401:
    #	return contents

    def port_pair_create(self, token, domain_name, tenant_name, user_name, service_function):
        """Create a Port pair."""
        """
        self.debug(msg="", title='Create a Port Pair.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url

        url_regex = '/v2.0/sfc/port_pairs'
        url = network_url + url_regex

        result = {}
        body = {}

        if service_function.get('sf_name'):
            body['name'] = service_function['sf_name']
        if service_function.get('sf_desc'):
            body['description'] = service_function['sf_desc']
        if service_function.get('ingress'):
            body['ingress'] = service_function['ingress']
        if service_function.get('egress'):
            body['egress'] = service_function['egress']

        body['tenant_id'] = project_id
        body = {'port_pair': body}

        self.debug(msg=body)

        (status_code, headers, contents) = self.post_with_token(token, url, body)

        if status_code == 201:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair was created', 'code': 201, 'id': contents['port_pair']['id']}}
        # if status_code == 401:
        #	return contents
        return contents
        """
        return {'success': {'message': 'port pair was created', 'code': 201, 'id': "contents['port_pair']['id']"}}

    def port_pair_delete(self, token, domain_name, tenant_name, user_name, port_pair_id):
        """Delete a Port Pair."""
        """
        self.debug(msg="", title='Delete a Port Pair.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url

        url_regex = '/v2.0/sfc/port_pairs'
        url = network_url + url_regex + '/' + port_pair_id

        result = {}
        body = {}

        (status_code, headers, contents) = self.delete_with_token(token, url)

        if status_code == 200:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair was deleted', 'code': 200, 'id': port_pair_id}}
        if status_code == 204:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair was deleted', 'code': 204, 'id': port_pair_id}}
        # if status_code == 401:
        #	return contents
        return contents
        """
        return {'success': {'message': 'port pair was deleted', 'code': 200, 'id': "port_pair_id"}}

    def port_pair_group_create(self, token, domain_name, tenant_name, user_name, service_function_group,
                               port_pairs):
        """Create a Port Pair Group."""
        """
        self.debug(msg="", title='Create a Port Pair Group.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url

        url_regex = '/v2.0/sfc/port_pair_groups'
        url = network_url + url_regex

        result = {}
        body = {}

        if service_function_group.get('name'):
            body['name'] = service_function_group['name']
        if service_function_group.get('desc'):
            body['description'] = service_function_group['desc']
        body['port_pairs'] = port_pairs
        body['tenant_id'] = project_id
        body = {'port_pair_group': body}

        self.debug(msg=body)

        (status_code, headers, contents) = self.post_with_token(token, url, body)

        if status_code == 201:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair group was created', 'code': 201,
                                'id': contents['port_pair_group']['id']}}
        # if status_code == 401:
        #	return contents
        return contents
        """
        return {'success': {'message': 'port pair group was created', 'code': 201,
                            'id': "contents['port_pair_group']['id']"}}

    def port_pair_group_delete(self, token, domain_name, tenant_name, user_name, port_pair_group_id):
        """Delete a Port Pair Group."""
        """
        self.debug(msg="", title='Delete a Port Pair Group.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url

        url_regex = '/v2.0/sfc/port_pair_groups'
        url = network_url + url_regex + '/' + port_pair_group_id

        result = {}
        body = {}

        (status_code, headers, contents) = self.delete_with_token(token, url)

        if status_code == 200:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair group was deleted', 'code': 200, 'id': port_pair_group_id}}
        if status_code == 204:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair group was deleted', 'code': 204, 'id': port_pair_group_id}}
        # if status_code == 401:
        #	return contents
        return contents
        """
        return {'success': {'message': 'port pair group was deleted', 'code': 200, 'id': "port_pair_group_id"}}

    def port_pair_chain_create(self, token, domain_name, tenant_name, user_name, sfc_name, sfc_desc,
                               flow_classifiers, port_pair_groups):
        """Create a Port Pair Chain."""
        """
        self.debug(msg="", title='Create a Port Pair Chain.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url

        url_regex = '/v2.0/sfc/port_chains'
        url = network_url + url_regex

        result = {}
        body = {}

        body['name'] = sfc_name + '_chain'
        body['description'] = sfc_desc
        body['flow_classifiers'] = flow_classifiers
        body['port_pair_groups'] = port_pair_groups
        body['tenant_id'] = project_id
        body = {'port_chain': body}

        self.debug(msg=body)

        (status_code, headers, contents) = self.post_with_token(token, url, body)

        if status_code == 201:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair chain was created', 'code': 201,
                                'id': contents['port_chain']['id'], 'chain_id': contents['port_chain']['chain_id']}}
        # if status_code == 401:
        #	return contents
        return contents
        """
        return {'success': {'message': 'port pair chain was created', 'code': 201, 'id': "contents['port_chain']['id']",
                            'chain_id': "contents['port_chain']['chain_id']"}}

    def port_pair_chain_delete(self, token, domain_name, tenant_name, user_name, sfc_id):
        """Delete a Port Pair Chain."""
        """
        self.debug(msg="", title='Delete a Port Pair Chain.')

        network_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'network')
        if project_id == 'error' or project_id == None:
            return network_url

        url_regex = '/v2.0/sfc/port_chains'
        url = network_url + url_regex + '/' + sfc_id

        result = {}
        body = {}

        (status_code, headers, contents) = self.delete_with_token(token, url)

        if status_code == 200:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair chain was deleted', 'code': 200, 'id': sfc_id}}
        if status_code == 204:
            # TODO: the result of flow_classifier_create INSERT INTO DB
            return {'success': {'message': 'port pair chain was deleted', 'code': 204, 'id': sfc_id}}
        # if status_code == 401:
        #	return contents
        return contents
        """
        return {'success': {'message': 'port pair chain was deleted', 'code': 200, 'id': "sfc_id"}}

    def createSFC(self, token, domain_name, tenant_name, user_name, sfc_name, sfc_desc, flow_classifier_list,
                  service_function_group_list):
        flow_classifiers = []
        port_pairs_list = []
        port_pair_groups = []
        # port_pair_chain = []
        # port_pair_chain_id = []
        """
        for flow_classifier in flow_classifier_list:
            try:
                # 1) flow_classifier
                flow_classifier_result = self.flow_classifier_create(token, domain_name, tenant_name, user_name,
                                                                     flow_classifier)  # Real
                flow_classifiers.append(flow_classifier_result['success']['id'])  # Real
            # flow_classifiers = ['4a334cd4-fe9c-4fae-af4b-321c5e2eb051','4a334cd4-fe9c-4fae-af4b-321c5e2eb052'] # For test
            except BaseException as e:
                return flow_classifier_result

        for service_function_group in service_function_group_list:
            port_pairs = []
            try:
                # 2) port_pairs
                for sf in service_function_group['sf_list']:
                    port_pairs_result = self.port_pair_create(token, domain_name, tenant_name, user_name,
                                                              sf)  # Real
                    port_pairs.append(port_pairs_result['success']['id'])  # Real
                # port_pairs = ['78dcd363-fc23-aeb6-f44b-56dc5e2fb3ae','78dcd363-fc23-aeb6-f44b-56dc5e2fb3a2'] # For test
                port_pairs_list.append(str(','.join(port_pairs)))
            except BaseException as e:
                return {'error': {'message': 'createSFC Failed', 'code': 500, 'title': 'port_pair_create failed'}}

            try:
                # 3) port_pair_groups
                port_pair_group_result = self.port_pair_group_create(token, domain_name, tenant_name, user_name,
                                                                     service_function_group, port_pairs)  # Real
                port_pair_groups.append(port_pair_group_result['success']['id'])  # Real
            # port_pair_groups = ['4512d643-24fc-4fae-af4b-321c5e2eb3d1','4512d643-24fc-4fae-af4b-321c5e2eb3d2'] # For test
            except BaseException as e:
                return port_pair_group_result

        try:
            # 4) port_pair_chain
            port_pair_chain_result = self.port_pair_chain_create(token, domain_name, tenant_name, user_name,
                                                                 sfc_name, sfc_desc, flow_classifiers,
                                                                 port_pair_groups)
            print port_pair_chain_result
            port_pair_chain = port_pair_chain_result['success']['id']
            port_pair_chain_id = port_pair_chain_result['success']['chain_id']
        # port_pair_chain = '1278dcd4-459f-62ed-754b-87fc5e4a6751' # For test
        # port_pair_chain_id = '10034' # For test
        except BaseException as e:
            return port_pair_chain_result

        try:
            # 5) DB Insert
            self.DB.insert_sfc(tenant_name=tenant_name,
                               user_name=user_name,
                               sfc_name=sfc_name,
                               sfc_desc=sfc_desc,
                               sfc_status='CREATED',
                               sfc_id=port_pair_chain,
                               chain_id=port_pair_chain_id,
                               flow_classifiers=str(','.join(flow_classifiers)),
                               port_pairs=str(','.join(port_pairs_list)),
                               port_pair_groups=str(','.join(port_pair_groups))
                               )

            # 6) RETRUN VALUES
            result = {
                'success': {'message': 'service function chain was created', 'code': 201, 'id': port_pair_chain,
                            'chain_id': port_pair_chain_id}}
        except BaseException as e:
            result = {'error': {'message': str(e), 'code': 500, 'title': 'DB insert_sfc failed'}}

        return result
        """
        result = {
            'success': {'message': 'service function chain was created', 'code': 201, 'id': "port_pair_chain",
                        'chain_id': "port_pair_chain_id"}}
        return result

    def pauseSFC(self, user_token, domain_name, tenant_name, user_name, sfc_id):
        """"""
        # 1) call port_pair_chain_delete
        """
        port_pair_chain_result = self.port_pair_chain_delete(user_token, domain_name, tenant_name, user_name,
                                                             sfc_id)
        # 2) DB Update
        params = {'updated_at': datetime.datetime.now(), 'sfc_status': 'PAUSED'}
        self.DB.update_sfc(tenant_name, user_name, sfc_id, params)
        """
        result = {'success': {'message': 'service function chain was paused', 'code': 204, 'id': sfc_id}}
        return result

    def resumeSFC(self, user_token, domain_name, tenant_name, user_name, sfc_name):
        # 1) check the status of SFC
        # get_sfc_result = self.DB.get_sfc(tenant_name, user_name, None, sfc_name)
        # if len(get_sfc_result) != 1:
        # 	return {'error': {'message': str(sfc_name), 'code': 500, 'title': 'CHECK SFC_NAME'}}
        #
        # # 2) GET VALUES
        # flow_classifiers = get_sfc_result[0]['flow_classifiers'].split(',')
        # # print type(flow_classifiers)
        # port_pair_groups = get_sfc_result[0]['port_pair_groups'].split(',')
        # # print port_pair_groups
        # sfc_id = get_sfc_result[0]['sfc_id']
        # sfc_desc = get_sfc_result[0]['sfc_desc']
        #
        # sfc_status = get_sfc_result[0]['sfc_status']
        # if sfc_status != 'PAUSED':
        # 	return {'error': {'message': str(sfc_status), 'code': 500, 'title': 'CHECK STATUS'}}

        # 3) call port_pair_chain_create

        # try:
        # 	port_pair_chain_result = self.port_pair_chain_create(user_token, domain_name, tenant_name, user_name,
        # 														 sfc_name, sfc_desc, flow_classifiers,
        # 														 port_pair_groups)
        # 	port_pair_chain = port_pair_chain_result['success']['id']
        # 	port_pair_chain_id = port_pair_chain_result['success']['chain_id']
        # # port_pair_chain = '1278dcd4-459f-62ed-754b-87fc5e4a6751' # For test
        # # port_pair_chain_id = '10034' # For test
        # except Exception as e:
        # 	raise
        # 	# TODO: flow_classifieres와 port_pair_groups를 DB에서 받아올때 unicode라 다른 변수로 사용할때 에러 가능성 있음.
        # 	return port_pair_chain_result
        #
        # try:
        # 	# 4) DB Update
        # 	params = {'sfc_id': port_pair_chain, 'chain_id': port_pair_chain_id,
        # 			  'updated_at': datetime.datetime.now(), 'sfc_status': 'RESUMED'}
        # 	self.DB.update_sfc(tenant_name, user_name, sfc_id, params)
        #
        # 	# 6) RETRUN VALUES
        # 	result = {
        # 		'success': {'message': 'service function chain was resumed', 'code': 201, 'id': port_pair_chain,
        # 					'chain_id': port_pair_chain_id}}
        # except BaseException as e:
        # 	result = {'error': {'message': str(e), 'code': 500, 'title': 'DB update_sfc failed'}}
        result = {'success': {'message': 'service function chain was resumed', 'code': 201, 'id': "port_pair_chain",
                              'chain_id': "port_pair_chain_id"}}
        return result

    def deleteSFC(self, user_token, domain_name, tenant_name, user_name, sfc_id):
        # 1) check the status of SFC
        # get_sfc_result = self.DB.get_sfc(tenant_name, user_name, sfc_id)
        # print get_sfc_result
        #
        # if len(get_sfc_result) != 1:
        # 	return {'error': {'message': str(sfc_id), 'code': 500, 'title': 'CHECK SFC_ID'}}
        #
        # # 2) GET VALUES
        # sfc_id = get_sfc_result[0]['sfc_id']
        # port_pair_groups = get_sfc_result[0]['port_pair_groups'].split(',')
        # port_pairs = get_sfc_result[0]['port_pairs'].split(',')
        # flow_classifiers = get_sfc_result[0]['flow_classifiers'].split(',')
        #
        # # 3) call port_pair_chain_delete
        # port_pair_chain_result = self.port_pair_chain_delete(user_token, domain_name, tenant_name, user_name,
        # 													 sfc_id)
        #
        # # 4) call port_pair_group_delete
        # for id in port_pair_groups:
        # 	port_pair_group_result = self.port_pair_group_delete(user_token, domain_name, tenant_name, user_name,
        # 														 id)
        #
        # # 5) call port_pair_delete
        # for id in port_pairs:
        # 	port_pair_result = self.port_pair_delete(user_token, domain_name, tenant_name, user_name, id)
        #
        # # 6) call clow_classifier_delete
        # for id in flow_classifiers:
        # 	flow_classifier_result = self.flow_classifier_delete(user_token, domain_name, tenant_name, user_name,
        # 														 id)
        #
        # # 2) DB Update
        # params = {'deleted_at': datetime.datetime.now(), 'sfc_status': 'DELETED'}
        # self.DB.update_sfc(tenant_name, user_name, sfc_id, params)

        result = {'success': {'message': 'service function chain was deleted', 'code': 204, 'id': "sfc_id"}}
        return result

    def listSFC(self, user_token, domain_name, tenant_name, user_name, service_id):
        # sfcs = self.DB.get_sfc(tenant_name, user_name)
        # # TODO : Update the result type
        sfc_list = [
            {
                "sfc_id": "id1",
                "sfc_name": "SFC01-01ABCD",
                "sfc_status": "CREATED",
                "fc_list": [
                    {"name": "FC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     },
                    {"name": "FC2",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf2",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf3",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf22",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf23",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    },
                    {
                        "name": "SFG3",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf22",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf23",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    }
                ]
            },
            {
                "sfc_id": "id2",
                "sfc_name": "sfc02",
                "sfc_status": "PAUSED",
                "fc_list": [
                    {"name": "AFC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     },
                    {"name": "FC2",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf2",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    }
                ]
            },
            {
                "sfc_id": "id3",
                "sfc_name": "sfc03",
                "sfc_status": "RESUMED",
                "fc_list": [
                    {"name": "AFC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "ROUTER",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     },
                    {"name": "FC2",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf2",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            },
                            {
                                "sf_name": "sf3",
                                "sf_desc": "sf_desc3",
                                "ingress": "ingress3",
                                "egress": "egress3"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            },
                            {
                                "sf_name": "sf22",
                                "sf_desc": "sf_desc2",
                                "ingress": "ingress2",
                                "egress": "egress2"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    },
                    {
                        "name": "SFG2",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf21",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    }
                ]
            },
            {
                "sfc_id": "id4",
                "sfc_name": "sfc04",
                "sfc_status": "DELETED",
                "fc_list": [
                    {"name": "AFC1",
                     "desc": "Flow rule for classifying TCP traffic",
                     "type": "VM",
                     "resource_name": "VM-01",
                     "protocol": "TCP",
                     "ip_version": "ip_v",
                     "src_port_min": 22,
                     "src_port_max": 4000,
                     "dst_port_min": 80,
                     "dst_port_max": 80,
                     "logical_dst_port": "",
                     "logical_src_port": "ea363483-869b-45d3-be4b-398f1a840307",
                     "src_ip_prefix": 'null',
                     "dst_ip_prefix": "22.12.34.45"
                     }
                ],
                "sfg_list": [
                    {
                        "name": "SFG1",
                        "desc": "desc",
                        "sf_list": [
                            {
                                "sf_name": "sf1",
                                "sf_desc": "sf_desc1",
                                "ingress": "ingress1",
                                "egress": "egress1"
                            }
                        ]
                    }
                ]
            }
        ]
        result = {'success': {'title': 'listSFC', 'code': 200, 'list': sfc_list}}
        return result

    def showSFC(self, user_token, domain_name, tenant_name, user_name, sfc_id):
        # sfcs = self.DB.get_sfc(tenant_name, user_name, sfc_id)
        # if len(sfcs) == 1:
        # 	result = {'success': {'title': 'listSFC', 'code': 200, 'sfc': sfcs[0]}}
        # else:
        # 	result = {'error': {'title': 'Check sfc_id', 'code': 500}}
        result = {'success': {'title': 'listSFC', 'code': 200, 'sfc': "sfcs[0]"}}
        return result

    def post_with_token(self, token, url, body):
        # self.debug(msg="", title='CURL POST')
        #
        # headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        # response = requests.post(url, headers=headers, json=body)
        # # print url
        # # print headers
        # # print response.status_code
        # # print response.__dict__
        # # print response._content
        #
        # try:
        # 	contents = json.loads(response._content)
        # except ValueError:
        # 	contents = {'error': {'message': str(response._content), 'code': str(response.status_code),
        # 						  'title': 'POST ERROR'}}

        ## SFC TEST RESPONSE
        '''
        contents_flow_classifier =  {"flow_classifier": {"name": "FC1",
            "tenant_id": "1814726e2d22407b8ca76db5e567dcf1",
            "description": "Flow rule for classifying TCP traffic",
            "protocol": "TCP",
            "source_port_range_min": 22, "source_port_range_max": 4000,
            "destination_port_range_min": 80, "destination_port_range_max": 80,
            "source_ip_prefix": 'null' , "destination_ip_prefix": "22.12.34.45",
            "id": "4a334cd4-fe9c-4fae-af4b-321c5e2eb051"}
            }


        contents_port_pair = {"port_pair": {"name": "SF1",
            "tenant_id": "d382007aa9904763a801f68ecf065cf5",
            "description": "Firewall SF instance",
            "ingress": "dace4513-24fc-4fae-af4b-321c5e2eb3d1",
            "egress": "aef3478a-4a56-2a6e-cd3a-9dee4e2ec345",
            "id": "78dcd363-fc23-aeb6-f44b-56dc5e2fb3ae",}
            }

        contents_port_pair_group = {"port_pair_group": {"name": "Firewall_PortPairGroup",
            "tenant_id": "d382007aa9904763a801f68ecf065cf5",
            "description": "Grouping Firewall SF instances",
            "port_pairs": [
                "78dcd363-fc23-aeb6-f44b-56dc5e2fb3ae"
            ],
            "id": "4512d643-24fc-4fae-af4b-321c5e2eb3d1",}
            }

        contents_port_chain	= {"port_chain": {"name": "PC2",
            "tenant_id": "d382007aa9904763a801f68ecf065cf5",
            "description": "Steering TCP and UDP traffic first to Firewall and then to Loadbalancer",
            "flow_classifiers": [
                "4a334cd4-fe9c-4fae-af4b-321c5e2eb051",
                "105a4b0a-73d6-11e5-b392-2c27d72acb4c"
            ],
            "port_pair_groups": [
                "4512d643-24fc-4fae-af4b-321c5e2eb3d1",
                "4a634d49-76dc-4fae-af4b-321c5e23d651"
            ],
            "chain_id": "10034",
            "id": "1278dcd4-459f-62ed-754b-87fc5e4a6751"
            }
        }
        #return (201, {'name':'dummy value'}, contents_port_chain)
        '''

        return "(response.status_code, response.headers, contents)"
    def getPortList(self, token, domain_name, project_name, user_name, resource_type, resource_id):
        p_list = {
            'success': {
                'ports': [
                    {
                        'allowed_address_pairs': [],
                        'extra_dhcp_opts': [],
                        'updated_at': '2016-11-22T12:57:44',
                        'device_owner': 'network:router_gateway',
                        'port_security_enabled': False,
                        'binding:profile': {},
                        'fixed_ips': [{
                            'subnet_id': 'ede9da8a-fa4c-483e-acb7-d1d149b63bdd',
                            'ip_address': '129.254.173.171'
                        }],
                        'id': '259a1caf-f622-4ee8-bda6-43a84e2f0b13',
                        'security_groups': [],
                        'binding:vif_details': {},
                        'binding:vif_type': 'binding_failed',
                        'mac_address': 'fa:16:3e:8e:1f:49',
                        'status': 'DOWN',
                        'binding:host_id': 'mitaka2-controller',
                        'description': '',
                        'device_id': '2b50b009-8569-4052-9bbc-00f09ee53bd8',
                        'name': '',
                        'admin_state_up': True,
                        'network_id': '563c4b8a-a49a-47a2-b73c-ec66be29915f',
                        'dns_name': None,
                        'created_at': '2016-11-22T12:57:44',
                        'binding:vnic_type': 'normal',
                        'tenant_id': ''
                    }, {
                        'allowed_address_pairs': [],
                        'extra_dhcp_opts': [],
                        'updated_at': '2016-11-22T12:57:54',
                        'device_owner': 'network:router_interface',
                        'port_security_enabled': False,
                        'binding:profile': {},
                        'fixed_ips': [{
                            'subnet_id': '907a6e1e-44e8-4bec-8db5-2fd44d337f5d',
                            'ip_address': '10.15.30.1'
                        }],
                        'id': 'e48e021e-7499-400c-972a-e93a57a5eb7b',
                        'security_groups': [],
                        'binding:vif_details': {
                            'port_filter': True,
                            'ovs_hybrid_plug': True
                        },
                        'binding:vif_type': 'ovs',
                        'mac_address': 'fa:16:3e:57:b1:75',
                        'status': 'ACTIVE',
                        'binding:host_id': 'mitaka2-controller',
                        'description': '',
                        'device_id': '2b50b009-8569-4052-9bbc-00f09ee53bd8',
                        'name': '',
                        'admin_state_up': True,
                        'network_id': '97798b24-b2b1-4803-b4ac-035977229c53',
                        'dns_name': None,
                        'created_at': '2016-11-22T12:57:47',
                        'binding:vnic_type': 'normal',
                        'tenant_id': '21c56ffc1ba94d8180b6c792b4b3fa79'
                    }, {
                        'allowed_address_pairs': [],
                        'extra_dhcp_opts': [],
                        'updated_at': '2016-11-22T12:57:54',
                        'device_owner': 'network:router_interface',
                        'port_security_enabled': False,
                        'binding:profile': {},
                        'fixed_ips': [{
                            'subnet_id': '9e78b4fa-0788-4ee6-b2b4-b67b80e43739',
                            'ip_address': '10.15.29.1'
                        }],
                        'id': 'ea363483-869b-45d3-be4b-398f1a840307',
                        'security_groups': [],
                        'binding:vif_details': {
                            'port_filter': True,
                            'ovs_hybrid_plug': True
                        },
                        'binding:vif_type': 'ovs',
                        'mac_address': 'fa:16:3e:4b:da:8d',
                        'status': 'ACTIVE',
                        'binding:host_id': 'mitaka2-controller',
                        'description': '',
                        'device_id': '2b50b009-8569-4052-9bbc-00f09ee53bd8',
                        'name': '',
                        'admin_state_up': True,
                        'network_id': 'c7fd1fcc-e845-4994-814d-03ad5371b13e',
                        'dns_name': None,
                        'created_at': '2016-11-22T12:57:48',
                        'binding:vnic_type': 'normal',
                        'tenant_id': '21c56ffc1ba94d8180b6c792b4b3fa79'
                    }]
            }
        }
        # return {"success":{"ports":[port for port in getPortList(sess, resource_id)]}}
        return {"success":{"ports":p_list}}

    def getAvailabilityZone(self, token, domain_name, tenant_name, user_name):
        try:
            nova = NovaRestAPI("http://192.168.10.25:35357/v3", token)
            contents = nova.getAvailabilityZones()
            return contents
        except Exception as e:
            return {"error":{"title":"Unauthorized", "message":"The request you have made requires authentication.", "code":"401"}}

        # service_url, project_id = self.getService(token, domain_name, tenant_name, user_name, 'compute')
        # if project_id == 'error' or project_id == None:
        #     return service_url

        # url_regex = "/os-availability-zone"
        # url = service_url + url_regex

        # result = {}

        # (status_code, headers, contents) = self.get_with_token(token, url)

        # if status_code in (200, 201, 202):
        #     return {'success': contents}
        # if status_code in (400, 401, 403, 404, 409, 500, 501):
        #     return {'error':contents}
            # return contents

    def get_with_token(self, token, url):
        headers = {'Accept': 'application/json', 'X-Auth-Token': token}
        body = {}
        response = requests.get(url, headers=headers, json=body)
        # print response.status_code
        # print response.__dict__
        try:
            contents = json.loads(response._content)
        except ValueError:
            # contents = {'error':{'message':str(response._content),'code':str(response.status_code), 'title':'GET ERROR'}}
            contents = {}

        return (response.status_code, response.headers, contents)

    def getService(self, token, domain_name, tenant_name, user_name, service_type):
        # url = self.AUTH_URL+'/auth/catalog'
        # (status_code, headers, contents) =  self.get_with_token(token, url)

        service_url = None
        project_id = None

        try:

            url = self.AUTH_URL + '/auth/catalog'
            (status_code, headers, contents) = self.get_with_token(token, url)
            self.CATALOG = contents['catalog']

            # Get service_url
            for catalog in self.CATALOG:
                if catalog['type'] == service_type:
                    for endpoint in catalog['endpoints']:
                        # print endpoint
                        if endpoint['interface'] == 'public':
                            # return (endpoint['url'], endpoint['id'])
                            service_url = endpoint['url']

            # get project_id
            url = self.AUTH_URL + '/auth/projects'
            (status_code, headers, contents) = self.get_with_token(token, url)
            self.PROJECTS = contents['projects']

            for project in self.PROJECTS:
                # print project
                if project['name'] == tenant_name:
                    project_id = project['id']

            return (service_url, project_id)

        except Exception as e:
            result = {'error': {'message': str(e), 'code': 401, 'title': 'Unauthorized'}}
            return (result, 'error')
        # _get_endpoint_url
        return (None, None)

    def getFlavorListwithDetail(self, token, domain_name, project_name, user_name):
        return {"success":{"flavors":[{"id":"1", "name": "name"}, {"id":"2","name":"name2"}]}}

    def getImageListwithDetail(self, token, domain_name, project_name, user_name):
        return {"success":{"images":[{"id":"0123", "name": "name"}, {"id":"2","name":"name2"}]}}

    def showTemplate(self, service_id):
        template = {
            u'name': u'test_template03',
            u'policy_list': [],
            u'network_list': [
                {
                    u'ip_version': u'4',
                    u'dns_list': [],
                    u'cidr': u'192.168.13.0/24',
                    u'admin_state': u'UP',
                    u'name': u'vNetwork-01'
                },
                {
                    u'dns_list': [],
                    u'name': u'provider',
                    u'enable_dhcp': True,
                    u'share': False,
                    u'host_route': [],
                    u'admin_state': u'UP',
                    u'ip_version': 4,
                    u'gateway_ip': u'',
                    u'cidr': u'192.168.14.0/24',
                    u'alloc_pools_list': []
                }
            ],
            u'volume': [],
            u'vrouter_list': [
                {
                    u'admin_state': u'SOAC-NET',
                    u'tenant_net_list': [u'provider',
                                         u'vNetwork-01'],
                    u'name': u'vRouter-01',
                    u'external_net': u'public_network'
                }
            ],
            u'vm_template_list': [
                {
                    u'booting_source_type': u'image',
                    u'server_name': u'instance-test-02',
                    u'key_name': u'',
                    u'image': u'cirros-0.3.4',
                    u'vnic_list': [
                        {
                            u'public_ip': False,
                            u'tenant_net': u'vNetwork-01',
                            u'name': u'0'
                        }
                    ],
                    u'custom_script': u'',
                    u'volume_list': [
                        {
                            u'image': u'cirros-0.3.4',
                            u'name': u'test_volume-1',
                            u'size': 1
                        }
                    ],
                    u'security_group': u'',
                    u'flavor': u'm1.tiny',
                    u'availability': u'nova'
                },
                {
                    u'booting_source_type': u'image',
                    u'server_name': u'instance-test-03',
                    u'key_name': u'',
                    u'image': u'cirros-0.3.4',
                    u'vnic_list': [
                        {
                            u'public_ip': False,
                            u'tenant_net': u'vNetwork-01',
                            u'name': u'0'
                        }
                    ],
                    u'custom_script': u'',
                    u'volume_list': [
                        {
                            u'image': u'cirros-0.3.4',
                            u'name': u'test_volume-2',
                            u'size': 1
                        }
                    ],
                    u'security_group': u'',
                    u'flavor': u'm1.tiny',
                    u'availability': u'nova'
                },
                {
                    u'booting_source_type': u'image',
                    u'server_name': u'instance-test-01',
                    u'key_name': u'',
                    u'image': u'cirros-0.3.4',
                    u'vnic_list': [
                        {
                            u'public_ip': False,
                            u'tenant_net': u'provider',
                            u'name': u'0'
                        }
                    ],
                    u'custom_script': u'',
                    u'volume_list': [
                        {
                            u'image': u'cirros-0.3.4',
                            u'name': u'test_volume-3',
                            u'size': 1
                        }
                    ],
                    u'security_group': u'',
                    u'flavor': u'm1.tiny',
                    u'availability': u'nova'
                }
            ],
            u'description': u'test2'
        }

        return {"success":{"code":200, "map_data":template, "title":"showTemplate"}}

    def updateMap(self, service_id, map_data):
        return {"success": {"map_data": map_data}}

# c1 = ControllerEngine()
#
# # sample_uuid = uuid.uuid1()	# Generate uuid
# sample_uuid = '25d87c92-6b40-11e6-9961-0800277992df'
# sample_service_template_list = []
# sample_service_template = c1.createSampleServiceTemplate()
# sample_service_template_list.append(sample_service_template)



# print c1.get_token('demo', 'demo', 'admin', 'supersecret')
# print
# print c1.create_service('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid, sample_service_template_list)
# print
# print c1.modifyService('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid, sample_service_template_list)
# print
# print c1.delete_service('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid)
# print
# print c1.suspend_service('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid)
# print
# print c1.resume_service('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid)
# print
# pprint (c1.get_service('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid))
# print
# print c1.suspendResource('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid, 'region-0001', '0553b367-25d5-4285-a343-34b0a2bdda37', 'VM')
# print
# print c1.resumeResource('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid, 'region-0001', '0553b367-25d5-4285-a343-34b0a2bdda37', 'VM')
# print
# print c1.showResource('demo', '2dc5d35fc791487ebdd32ec38e2edeed', 'admin', sample_uuid, 'region-0001', '0553b367-25d5-4285-a343-34b0a2bdda37', 'VM')
