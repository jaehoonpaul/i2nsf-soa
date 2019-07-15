service = {
    "serviceList": {
        "success": {
            "service_list": [
                {
                    "status": "CREATE_COMPLETE",
                    "region_id": "1",
                    "stack_name": "template-2vm_1net",
                    "tenant_name": "admin",
                    "create_at": "2016-11-07T16:39:14", "updated_at": null,
                    "stack_id": "f4277364-45a5-46eb-a4d5-3560eed95ed5",
                    "user_name": "admin",
                    "service_id": "46a9ece2-a4bd-11e6-bc66-1866dae80e95",
                    "deleted_at": null,
                    "mdc_id": "1",
                    "id": 4
                }
            ]
        }
    }
}

# create
service_tamplate = {
    'description': '2 vms and 1 net',
    'name': 'template-2vm_1net',
    'network_list': [
        {
            'alloc_pools_list': [
                {
                    'end': '10.11.15.254',
                    'start': '10.11.15.2'
                }
            ],
            'cidr': '10.11.15.0/24',
            'dns_list': ['8.8.8.8'],
            'enable_dhcp': True,
            'gateway_ip': '10.11.15.1',
            'ip_version': 4,
            'name': 'private_net-1'
        }
    ],
    'region_id': 'region-0001',
    'vm_template_list': [
        {
            'admin_pass': '1111',
            'flavor': 'm1.tiny',
            'image': 'cirros-0.3.4',
            'key_name': 'my_key',
            'server_name': 'test_vm-1',
            'vnic_list': [
                {
                    'name': 'test-vnic-01',
                    'public_ip': False,
                    'tenant_net': 'private_net-1'
                }
            ]
        },
        {
            'admin_pass': '1111',
            'flavor': 'm1.tiny',
            'image': 'cirros-0.3.4',
            'key_name': 'my_key',
            'server_name': 'test_vm-2',
            'vnic_list': [
                {
                    'name': 'test-vnic-02',
                    'public_ip': False,
                    'tenant_net': 'private_net-1'
                }
            ]
        }
    ],
    'vrouter': {
        'external_net': 'ETRI_NET',
        'name': 'test-vrouter-01',
        'tenant_net_list': ['private_subnet-1']
    }
}
