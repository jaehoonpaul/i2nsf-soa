CREATE TABLE tb_domains (
    DOMAIN_KEY           INT(11) NOT NULL AUTO_INCREMENT COMMENT '도메인키',
    DOMAIN_NAME          VARCHAR(100) DEFAULT NULL COMMENT '도메인명',
    AUTH_URL             VARCHAR(500) DEFAULT NULL COMMENT '인증URL',
    DB_IP                VARCHAR(16) DEFAULT NULL COMMENT 'DB IP',
    DB_USER              VARCHAR(20) DEFAULT NULL COMMENT 'DB USER',
    DB_PASSWORD          VARCHAR(100) DEFAULT NULL COMMENT 'DB PASSWORD',
    DB_PORT              INT(11) DEFAULT NULL COMMENT 'DB PORT',
    ORDER_NUM            INT(11) DEFAULT NULL COMMENT '순번',
    DESCRIPTION          VARCHAR(500) DEFAULT NULL COMMENT '설명',
    INSDATE              DATETIME NOT NULL COMMENT '생성일시',
    INSUSER              VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE              DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER              VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (DOMAIN_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='도메인';

CREATE TABLE tb_security_resource_group (
    SECURITY_ID          VARCHAR(100) NOT NULL COMMENT '보안장비ID',
    DOMAIN_KEY           INT(11) NOT NULL COMMENT '도메인키',
    SECURITY_NAME        VARCHAR(100) DEFAULT NULL COMMENT '보안장비명',
    SECURITY_ICON        VARCHAR(300) DEFAULT NULL COMMENT '보안장비아이콘',
    MANUFACTURER_NAME    VARCHAR(100) DEFAULT NULL COMMENT '제조사',
    MANUFACTURER_ICON    VARCHAR(300) DEFAULT NULL COMMENT '제조사아이콘',
    SOFTWARE_VERSION     VARCHAR(100) DEFAULT NULL COMMENT '소프트웨어버전',
    IMAGE_NAME           VARCHAR(100) DEFAULT NULL COMMENT '이미지명',
    TOPOLOGY_JSON        MEDIUMTEXT DEFAULT NULL COMMENT '토폴로지데이터',
    LINK_JSON            MEDIUMTEXT DEFAULT NULL COMMENT '자원연결데이터',
    SECURITY_JSON        VARCHAR(500) DEFAULT NULL COMMENT '보안자원데이터',
    DESCRIPTION          VARCHAR(500) DEFAULT NULL COMMENT '설명',
    INSDATE              DATETIME NOT NULL COMMENT '생성일시',
    INSUSER              VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE              DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER              VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (SECURITY_ID,DOMAIN_KEY),
    CONSTRAINT FK_SECURITY_RESOURCE_GROUP_01 FOREIGN KEY (DOMAIN_KEY) REFERENCES tb_domains (DOMAIN_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='보안장비';

CREATE TABLE tb_nsf (
    NSF_KEY     INT(11) NOT NULL AUTO_INCREMENT COMMENT 'NSF키',
    NAME        VARCHAR(255) DEFAULT NULL COMMENT 'NSF명',
    PROCESSING  VARCHAR(30) DEFAULT NULL COMMENT '프로세싱',
    INBOUND     VARCHAR(30) DEFAULT NULL COMMENT '인바운드',
    OUTBOUND    VARCHAR(30) DEFAULT NULL COMMENT '아웃바운드',
    INITIATED   VARCHAR(5) DEFAULT NULL COMMENT '활성화여부',
    INSDATE     DATETIME NOT NULL COMMENT '생성일시',
    INSUSER     VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE     DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER     VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (NSF_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='NSF';

CREATE TABLE tb_capability (
    CAPABILITY_KEY  INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Capability키',
    NSF_KEY         INT(11) NOT NULL COMMENT 'NSF키',
    NAME            VARCHAR(255) DEFAULT NULL COMMENT 'Capability 명',
    INSDATE         DATETIME NOT NULL COMMENT '생성일시',
    INSUSER         VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE         DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER         VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (CAPABILITY_KEY, NSF_KEY),
    CONSTRAINT FK_CAPABILITY_01 FOREIGN KEY (NSF_KEY) REFERENCES tb_nsf (NSF_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Capability';

CREATE TABLE tb_field (
    FIELD_KEY       INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Field키',
    CAPABILITY_KEY  INT(11) NOT NULL COMMENT 'Capability키',
    NSF_KEY         INT(11) NOT NULL COMMENT 'NSF키',
    NAME            VARCHAR(255) DEFAULT NULL COMMENT '필드명',
    INSDATE         DATETIME NOT NULL COMMENT '생성일시',
    INSUSER         VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE         DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER         VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (FIELD_KEY,CAPABILITY_KEY,NSF_KEY),
    CONSTRAINT FK_FIELD_01 FOREIGN KEY (CAPABILITY_KEY, NSF_KEY) REFERENCES tb_capability (CAPABILITY_KEY, NSF_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='정책 데이터 필드';

CREATE TABLE tb_rel_security_nsf
(
    DOMAIN_KEY           INT(11) NOT NULL COMMENT '도메인키',
    SECURITY_ID          VARCHAR(100) NOT NULL COMMENT '보안장비ID',
    NSF_KEY              INT(11) NOT NULL COMMENT 'NSF키',
    PRIMARY KEY (SECURITY_ID,DOMAIN_KEY),
    CONSTRAINT FK_REL_SECURITY_NSF_01 FOREIGN KEY (SECURITY_ID, DOMAIN_KEY) REFERENCES tb_security_resource_group (SECURITY_ID, DOMAIN_KEY),
    CONSTRAINT FK_REL_SECURITY_NSF_02 FOREIGN KEY (NSF_KEY) REFERENCES tb_nsf (NSF_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='보안장비-NSF 관계 테이블';

CREATE TABLE tb_service_template (
    SERVICE_TEMPLATE_KEY INT(11) NOT NULL COMMENT '서비스템플릿키',
    NAME                 VARCHAR(100) DEFAULT NULL COMMENT '서비스템플릿명',
    TOPOLOGY_JSON         MEDIUMTEXT DEFAULT NULL COMMENT '토폴로지데이터',
    LINK_JSON            MEDIUMTEXT DEFAULT NULL COMMENT '자원연결데이터',
    DESCRIPTION          VARCHAR(500) DEFAULT NULL COMMENT '설명',
    INSDATE              DATETIME NOT NULL COMMENT '생성일시',
    INSUSER              VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE              DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER              VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (SERVICE_TEMPLATE_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='서비스템플릿';

CREATE TABLE tb_rel_template_security
(
    SERVICE_TEMPLATE_KEY INT(11) NOT NULL COMMENT '템플릿키',
    DOMAIN_KEY           INT(11) NOT NULL COMMENT '도메인키',
    SECURITY_ID          VARCHAR(100) NOT NULL COMMENT '보안장비ID',
    PRIMARY KEY (SERVICE_TEMPLATE_KEY,DOMAIN_KEY,SECURITY_ID),
    CONSTRAINT FK_REL_TEMPLATE_SECURITY_01 FOREIGN KEY (SERVICE_TEMPLATE_KEY) REFERENCES tb_service_template (SERVICE_TEMPLATE_KEY),
    CONSTRAINT FK_REL_TEMPLATE_SECURITY_02 FOREIGN KEY (SECURITY_ID, DOMAIN_KEY) REFERENCES tb_security_resource_group (SECURITY_ID, DOMAIN_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='서비스템플릿-보안장비 관계테이블';

CREATE TABLE tb_endpoint (
    ENDPOINT_KEY         INT(11) NOT NULL AUTO_INCREMENT COMMENT 'endpoint키',
    DOMAIN_KEY           INT(11) NOT NULL COMMENT '도메인키',
    NAME                 VARCHAR(255) DEFAULT NULL COMMENT 'endpoint명',
    METADATA             VARCHAR(255) DEFAULT NULL COMMENT 'metadata',
    ENDPOINT_TYPE        VARCHAR(18) DEFAULT NULL COMMENT 'endpoint타입',
    INSDATE              DATETIME NOT NULL COMMENT '생성일시',
    INSUSER              VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE              DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER              VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (ENDPOINT_KEY,DOMAIN_KEY),
    CONSTRAINT FK_FW_RULE_02 FOREIGN KEY (DOMAIN_KEY) REFERENCES tb_domains (DOMAIN_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='endpoint';

CREATE TABLE tb_fw_rule (
    RULE_KEY             INT(11) NOT NULL AUTO_INCREMENT COMMENT '규칙키',
    DOMAIN_KEY           INT(11) NOT NULL COMMENT '도메인키',
    POLICY_NAME          VARCHAR(100) DEFAULT NULL COMMENT '정책명',
    SOURCE_TARGET        INT(11) NOT NULL COMMENT '출발지',
    DESTINATION_TARGET   INT(11) NOT NULL COMMENT '목적지',
    START_TIME           VARCHAR(18) DEFAULT NULL COMMENT '시작시간',
    END_TIME             VARCHAR(18) DEFAULT NULL COMMENT '종료시간',
    ACTION_DATA          VARCHAR(18) DEFAULT NULL COMMENT '액션',
    DESCRIPTION          VARCHAR(500) DEFAULT NULL COMMENT '설명',
    INSDATE              DATETIME NOT NULL COMMENT '생성일시',
    INSUSER              VARCHAR(18) DEFAULT 'system' COMMENT '생성자',
    UPDDATE              DATETIME NOT NULL COMMENT '수정일시',
    UPDUSER              VARCHAR(18) DEFAULT 'system' COMMENT '수정자',
    PRIMARY KEY (RULE_KEY, DOMAIN_KEY),
    CONSTRAINT FK_FW_RULE_01 FOREIGN KEY (DOMAIN_KEY) REFERENCES tb_domains (DOMAIN_KEY)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='방화벽 규칙';

INSERT INTO `tb_domains` VALUES (
    1,'soac-m3','http://10.10.100.15:35357/v3','10.10.100.15','root','etri!@#',3306,2,'개발용 Mitaka PoD',now(),'system',now(),'system'
),(
    2,'soac-m4','http://10.10.100.19:35357/v3','10.10.100.19','root','etri!@#',3306,3,'서비스 검증용 Mitaka PoD',now(),'system',now(),'system'
),(
    3,'soac-m6','http://10.10.200.15:35357/v3','localhost','root','etri!@#',3306,4,'서비스 검증용 Mitaka PoD (2)',now(),'system',now(),'system'
),(
    4,'soac-m2','http://10.10.100.11:35357/v3','10.10.100.11','root','etri!@#',3306,1,'SOA 시범서비스 PoD',now(),'system',now(),'system'
);

INSERT INTO `tb_security_resource_group` VALUES (
    '10c5df1b-ef42-c652-953b-d1eacf2e285d',
    1,
    'DLP_test',
    NULL,
    'chiron',
    NULL,
    'v1.1',
    'cirros-0.3.4',
    '[{\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"DLP_net\", \"resource_type\": \"network\"}, {\"data\": {\"booting_source_type\": \"image\", \"name\": \"\", \"key_name\": \"\", \"image\": \"cirros-0.3.4\", \"custom_script\": \"\", \"tenant_net_list\": [{\"public_ip\": false, \"tenant_net\": \"DLP_net\", \"ip_address\": \"\", \"name\": \"\", \"mac_address\": \"\"}], \"security_group\": \"\", \"flavor\": \"m1.tiny\", \"availability\": \"nova\", \"resource_type\": \"virtual_machine\"}, \"name\": \"DLP_vm\", \"resource_type\": \"virtual_machine\"}, {\"data\": {\"image_type\": \"image\", \"vm_template\": \"DLP_vm\", \"type\": \"None\", \"name\": \"\", \"resource_type\": \"volume\"}, \"name\": \"DLP_vol\", \"resource_type\": \"volume\"}]',
    '[{\"source\": {\"name\": \"DLP_net\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"DLP_vm\", \"resource_type\": \"virtual_machine\"}}, {\"source\": {\"name\": \"DLP_vm\", \"resource_type\": \"virtual_machine\"}, \"target\": {\"name\": \"DLP_vol\", \"resource_type\": \"volume\"}}]',
    '[{\"name\": \"DLP_vol\"}, {\"security_type\": \"dlp\", \"name\": \"DLP_vm\"}, {\"name\": \"DLP_net\"}]',
    'DLP_func',
    '2018-09-07 11:09:00',
    'chiron',
    '2018-09-07 11:09:00',
    'chiron'
), (
    '98b10284-539c-8b4c-7c0b-038e3b28dce7',
    3,
    'IPS-sec',
    NULL,
    'chi',
    NULL,
    'v1.2',
    'cirros-0.3.4',
    '[{\"data\": {\"booting_source_type\": \"image\", \"name\": \"\", \"key_name\": \"\", \"image\": \"cirros-0.3.4\", \"custom_script\": \"\", \"tenant_net_list\": [{\"public_ip\": false, \"tenant_net\": \"testNetwork\", \"name\": \"\"}, {\"public_ip\": false, \"tenant_net\": \"testNetwork1\", \"name\": \"\"}], \"security_group\": \"\", \"flavor\": \"m1.tiny\", \"availability\": \"nova\", \"resource_type\": \"virtual_machine\"}, \"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}, {\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"testNetwork\", \"resource_type\": \"network\"}, {\"data\": {\"image_type\": \"image\", \"vm_template\": \"testIPS\", \"type\": \"None\", \"name\": \"\", \"resource_type\": \"volume\"}, \"name\": \"testVolume\", \"resource_type\": \"volume\"}, {\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"testNetwork1\", \"resource_type\": \"network\"}]',
    '[{\"security_type\": \"ips\", \"name\": \"testIPS\"}, {\"name\": \"testNetwork1\"}, {\"name\": \"testNetwork\"}, {\"name\": \"testVolume\"}]',
    '[{\"source\": {\"name\": \"testNetwork\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}}, {\"source\": {\"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}, \"target\": {\"name\": \"testVolume\", \"resource_type\": \"volume\"}}, {\"source\": {\"name\": \"testNetwork1\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}}]',
    'description11',
    '2018-11-28 19:16:21',
    'admin',
    '2018-11-28 19:16:21',
    'admin'
), (
    'eb5d7701-c327-8766-8b55-0e4ef6e4aa35',
    3,
    'DLP_sec',
    NULL,
    'chi',
    NULL,
    'v1.3',
    'cirros-0.3.4',
    '[{\"data\": {\"booting_source_type\": \"image\", \"name\": \"\", \"key_name\": \"\", \"image\": \"cirros-0.3.4\", \"custom_script\": \"\", \"tenant_net_list\": [{\"public_ip\": false, \"tenant_net\": \"test_dlp_net\", \"name\": \"\"}], \"security_group\": \"\", \"flavor\": \"m1.tiny\", \"availability\": \"nova\", \"resource_type\": \"virtual_machine\"}, \"name\": \"test_DLP\", \"resource_type\": \"virtual_machine\"}, {\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"test_dlp_net\", \"resource_type\": \"network\"}]',
    '[{\"security_type\": \"dlp\", \"name\": \"test_DLP\"}, {\"name\": \"test_dlp_net\"}]',
    '[{\"source\": {\"name\": \"test_dlp_net\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"test_DLP\", \"resource_type\": \"virtual_machine\"}}]',
    'testDescription',
    '2018-11-28 19:28:19',
    'admin',
    '2018-11-28 19:28:19',
    'admin'
);

DELIMITER ;;
/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_domains_DateTime_DEFAULT
BEFORE INSERT
    ON tb_domains FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;

/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_security_resource_group_DateTime_DEFAULT
BEFORE INSERT
    ON tb_security_resource_group FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;

/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_nsf_DateTime_DEFAULT
BEFORE INSERT
    ON tb_nsf FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;


/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_capability_DateTime_DEFAULT
BEFORE INSERT
    ON tb_capability FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;

/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_field_DateTime_DEFAULT
BEFORE INSERT
    ON tb_field FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;

/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_service_template_DateTime_DEFAULT
BEFORE INSERT
    ON tb_service_template FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;

/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_endpoint_DateTime_DEFAULT
BEFORE INSERT
    ON tb_endpoint FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;


/*! CREATE*/ /*! DEFINER=`root`@`localhost`*/ /*! TRIGGER tb_fw_rule_DateTime_DEFAULT
BEFORE INSERT
    ON tb_fw_rule FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END */;;

DELIMITER ;
