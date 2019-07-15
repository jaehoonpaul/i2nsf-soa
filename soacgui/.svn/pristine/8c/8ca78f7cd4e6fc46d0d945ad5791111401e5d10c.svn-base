# _*_ coding:utf-8 _*_

# Insert 도메인
INSERT_SOAM_DOMAIN = """
    INSERT INTO tb_domain (
        DOMAIN_NAME,
        AUTH_URL,
        DESCRIPTION,
        INS_USER,
        UPD_USER
    ) VALUES (
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Update 도메인
UPDATE_SOAM_DOMAIN = """
    UPDATE tb_domain SET
        DOMAIN_NAME = %s,
        DESCRIPTION = %s,
        AUTH_URL = %s
     WHERE DOMAIN_NAME = %s
"""

# Delete 도메인
DELETE_SOAM_DOMAIN = """
    UPDATE tb_domain SET
        USE_YN = 'N'
     WHERE DOMAIN_NAME = %s
"""

# Select 도메인
SELECT_SOAM_DOMAIN = """
    SELECT DOMAIN_ID,
           DOMAIN_NAME,
           DESCRIPTION,
           AUTH_URL
      FROM tb_domain
     WHERE AUTH_URL = %s
"""

# Insert 프로젝트
INSERT_SOAM_PROJECT = """
    INSERT INTO tb_project (
        DOMAIN_ID,
        PROJECT_ID,
        PROJECT_NAME,
        DESCRIPTION,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Delete 프로젝트
DELETE_SOAM_PROJECT = """
    UPDATE tb_project SET
        USE_YN = 'N'
     WHERE DOMAIN_ID = (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s)
       AND PROJECT_ID = %s
"""

# Insert 사용자
INSERT_SOAM_UESR = """
    INSERT INTO tb_user (
        DOMAIN_ID,
        PROJECT_ID,
        USER_ID,
        PASSWORD,
        NAME,
        EMAIL,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 서비스 (1)
INSERT_SOAM_SERVICE = """
    INSERT INTO tb_service (
        DOMAIN_ID,
        PROJECT_ID,
        SERVICE_ID,
        SERVICE_NAME,
        DESCRIPTION,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 보안장비 (2)
INSERT_SOAM_EQUIPMENT = """
    INSERT INTO tb_equipment (
        EQUIPMENT_TYPE,
        EQUIPMENT_NAME,
        EQUIPMENT_ICON,
        COMPANY_NAME,
        COMPANY_ICON,
        VERSION,
        DESCRIPTION,
        INS_USER,
        UPD_USER,
    ) VALUES (
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 라우터 (3)
INSERT_SOAM_ROUTER = """
    INSERT INTO tb_router (
        DOMAIN_ID,
        SERVICE_ID,
        ROUTER_ID,
        ROUTER_NAME,
        ROUTER_STATUS,
        ADMIN_STATUS,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 네트워크 (4)
INSERT_SOAM_NETWORK = """
    INSERT INTO tb_network (
        DOMAIN_ID,
        SERVICE_ID,
        NETWORK_ID,
        NETWORK_NAME,
        NETWORK_STATUS,
        ADMIN_STATUS,
        EXTERNAL_YN,
        SHARE_YN,
        MTU,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 서브넷 (5)
INSERT_SOAM_SUBNET = """
    INSERT INTO tb_subnet (
        DOMAIN_ID,
        NETWORK_ID,
        SUBNET_ID,
        SUBNET_NAME,
        NETWORK_CIDR,
        IP_VERSION,
        GATEWAY_IP,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 포트 (6)
INSERT_SOAM_PORT = """
    INSERT INTO tb_port (
        DOMAIN_ID,
        NETWORK_ID,
        DEVICE_ID,
        PORT_ID,
        PORT_NAME,
        PORT_STATUS,
        ADMIN_STATUS,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 서버 (7)
INSERT_SOAM_SERVER = """
    INSERT INTO tb_server (
        DOMAIN_ID,
        SERVICE_ID,
        EQUIPMENT_KEY,
        SERVER_ID,
        SERVER_NAME,
        FLAVOR_ID,
        FLAVOR_NAME,
        RAM,
        VCPUS,
        DISK,
        IMAGE_ID,
        IMAGE_NAME,
        HOST,
        SERVER_STATUS,
        POWER_STATUS,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 고정IP (8)
INSERT_SOAM_FIXED_IP = """
    INSERT INTO tb_fixed_ip (
        DOMAIN_ID,
        SUBNET_ID,
        PORT_ID,
        IP_ADDRESS,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 볼륨 (9)
INSERT_SOAM_VOLUME = """
    INSERT INTO tb_volume (
        DOMAIN_ID,
        SERVICE_ID,
        SERVER_ID,
        VOLUME_ID,
        VOLUME_NAME,
        HOST,
        DESCRIPTION,
        VOLUME_TYPE,
        AVAILABLE_AREA,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_ID FROM tb_domain WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        'admin',
        'admin'
    )
"""

# Insert 알람이력
INSERT_SOAM_ALARM_HISTORY = """
"""
