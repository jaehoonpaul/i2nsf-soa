image = {
    '__original__': {
        'checksum': '2d27589a547f4a2f49d76104372366e0',
        'container_format': 'bare',
        'created_at': '2016-11-03T00:43:21Z',
        'description': '',
        'disk_format': 'qcow2',
        'file': '/v2/images/a513ec64-2aa8-40fa-a1a6-d7cff2d5f020/file',
        'id': 'a513ec64-2aa8-40fa-a1a6-d7cff2d5f020',
        'min_disk': 8,
        'min_ram': 2048,
        'name': 'Lubuntu-14.04',
        'owner': '21c56ffc1ba94d8180b6c792b4b3fa79',
        'protected': False,
        'schema': '/v2/schemas/image',
        'size': 8592031744,
        'status': 'active',
        'tags': [],
        'updated_at': '2016-11-03T00:43:52Z',
        'virtual_size': None,
        'visibility': 'public'
    },
    'changes': {},
    'schema': {
        'additionalProperties': {
            'type': 'string'
        },
        'links': [
            {
                'href': '{self}', 'rel': 'self'
            },
            {
                'href': '{file}', 'rel': 'enclosure'
            },
            {
                'href': '{schema}', 'rel': 'describedby'
            }
        ],
        'name': 'image',
        'properties': {
            'architecture': {
                'description': 'Operating system architecture as specified in http://docs.openstack.org/trunk/openstack-compute/admin/content/adding-images.html',
                'is_base': False,
                'type': 'string'
            },
            'checksum': {
                'description': 'md5 hash of image contents.',
                'maxLength': 32,
                'readOnly': True,
                'type': ['null', 'string']
            },
            'container_format': {
                'description': 'Format of the container',
                'enum': [None, 'ami', 'ari', 'aki', 'bare', 'ovf', 'ova', 'docker'],
                'type': ['null', 'string']
            },
            'created_at': {
                'description': 'Date and time of image registration',
                'readOnly': True,
                'type': 'string'
            },
            'direct_url': {
                'description': 'URL to access the image file kept in external store',
                'readOnly': True,
                'type': 'string'
            },
            'disk_format': {
                'description': 'Format of the disk',
                'enum': [None, 'ami', 'ari', 'aki', 'vhd', 'vmdk', 'raw', 'qcow2', 'vdi', 'iso', 'root-tar'],
                'type': ['null', 'string']
            },
            'file': {
                'description': 'An image file url',
                'readOnly': True,
                'type': 'string'
            },
            'id': {
                'description': 'An identifier for the image',
                'pattern': '^([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}$',
                'type': 'string'
            },
            'instance_uuid': {
                'description': 'Metadata which can be used to record which instance this image is associated with. (Informational only, does not create an instance snapshot.)',
                'is_base': False,
                'type': 'string'
            },
            'kernel_id': {
                'description': 'ID of image stored in Glance that should be used as the kernel when booting an AMI-style image.',
                'is_base': False,
                'pattern': '^([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}$',
                'type': ['null', 'string']
            },
            'locations': {
                'description': 'A set of URLs to access the image file kept in external store',
                'items': {
                    'properties': {
                        'metadata': {
                            'type': 'object'
                        },
                        'url': {
                            'maxLength': 255,
                            'type': 'string'
                        }
                    },
                    'required': ['url', 'metadata'],
                    'type': 'object'
                },
                'type': 'array'
            },
            'min_disk': {
                'description': 'Amount of disk space (in GB) required to boot image.',
                'type': 'integer'
            },
            'min_ram': {
                'description': 'Amount of ram (in MB) required to boot image.',
                'type': 'integer'
            },
            'name': {
                'description': 'Descriptive name for the image',
                'maxLength': 255,
                'type': ['null', 'string']
            },
            'os_distro': {
                'description': 'Common name of operating system distribution as specified in http://docs.openstack.org/trunk/openstack-compute/admin/content/adding-images.html',
                'is_base': False,
                'type': 'string'
            },
            'os_version': {
                'description': 'Operating system version as specified by the distributor',
                'is_base': False,
                'type': 'string'
            },
            'owner': {
                'description': 'Owner of the image',
                'maxLength': 255,
                'type': ['null', 'string']
            },
            'protected': {
                'description': 'If true, image will not be deletable.',
                'type': 'boolean'
            },
            'ramdisk_id': {
                'description': 'ID of image stored in Glance that should be used as the ramdisk when booting an AMI-style image.',
                'is_base': False,
                'pattern': '^([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}$',
                'type': ['null', 'string']
            },
            'schema': {
                'description': 'An image schema url',
                'readOnly': True,
                'type': 'string'
            },
            'self': {
                'description': 'An image self url',
                'readOnly': True,
                'type': 'string'
            },
            'size': {
                'description': 'Size of image file in bytes',
                'readOnly': True,
                'type': ['null', 'integer']
            },
            'status': {
                'description': 'Status of the image',
                'enum': ['queued', 'saving', 'active', 'killed', 'deleted', 'pending_delete', 'deactivated'],
                'readOnly': True,
                'type': 'string'
            },
            'tags': {
                'description': 'List of strings related to the image',
                'items': {
                    'maxLength': 255,
                    'type': 'string'
                },
                'type': 'array'
            },
            'updated_at': {
                'description': 'Date and time of the last image modification',
                'readOnly': True,
                'type': 'string'
            },
            'virtual_size': {
                'description': 'Virtual size of image in bytes',
                'readOnly': True,
                'type': ['null', 'integer']
            },
            'visibility': {
                'description': 'Scope of image accessibility',
                'enum': ['public', 'private'],
                'type': 'string'
            }
        }
    }
}
