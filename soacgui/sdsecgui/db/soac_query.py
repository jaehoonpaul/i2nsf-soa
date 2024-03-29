# _*_ coding:utf-8 _*_
"""
CREATE DATABASE soacgui;

CREATE table tb_security_resource_group (
    SECURITY_ID nvarchar(100) NOT NULL,
    SECURITY_NAME nvarchar(100),
    SECURITY_ICON nvarchar(300),
    DESCRIPTION nvarchar(500),
    MANUFACTURER_NAME nvarchar(100),
    MANUFACTURER_ICON nvarchar(300),
    SOFTWARE_VERSION nvarchar(100),
    IMAGE_NAME nvarchar(100),
    DATA nvarchar(32000),
    INSUSER nvarchar(100),
    INSDATE DATETIME,
    UPDUSER nvarchar(100),
    UPDDATE DATETIME,
    PRIMARY KEY (`SECURITY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER //
CREATE TRIGGER tb_security_resource_group_DateTime_DEFAULT
BEFORE INSERT
    ON tb_security_resource_group FOR EACH ROW
BEGIN
    SET NEW.INSDATE = NOW();
    SET NEW.UPDDATE = NOW();
END; //
DELIMITER ;
"""

INSERT_SECURITY_RESOURCE_GROUP = """
    INSERT INTO tb_security_resource_group (
        SECURITY_ID,
        DOMAIN_KEY,
        SECURITY_NAME,
        SECURITY_ICON,
        MANUFACTURER_NAME,
        MANUFACTURER_ICON,
        SOFTWARE_VERSION,
        IMAGE_NAME,
        TOPOLOGY_JSON,
        LINK_JSON,
        SECURITY_JSON,
        DESCRIPTION,
        INSDATE,
        INSUSER,
        UPDDATE,
        UPDUSER
    ) VALUES (
        %s,
        (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s),
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
        NOW(),
        %s,
        NOW(),
        %s
    )
"""
SELECT_SECURITY_RESOURCE_GROUP = """
    SELECT SECURITY_ID,
           SECURITY_NAME,
           SECURITY_ICON,
           MANUFACTURER_NAME,
           MANUFACTURER_ICON,
           SOFTWARE_VERSION,
           IMAGE_NAME,
           TOPOLOGY_JSON,
           LINK_JSON,
           SECURITY_JSON,
           DESCRIPTION,
           INSUSER,
           INSDATE,
           UPDUSER,
           UPDDATE
     FROM tb_security_resource_group SRG
    WHERE SECURITY_ID = %s
"""

UPDATE_SECURITY_RESOURCE_GROUP = """
    UPDATE tb_security_resource_group SET
        SECURITY_NAME     = %s,
        SECURITY_ICON     = %s,
        DESCRIPTION       = %s,
        MANUFACTURER_NAME = %s,
        MANUFACTURER_ICON = %s,
        SOFTWARE_VERSION  = %s,
        IMAGE_NAME        = %s,
        TOPOLOGY_JSON     = %s,
        LINK_JSON         = %s,
        SECURITY_JSON     = %s,
        UPDUSER           = %s,
        UPDDATE           = NOW()
    WHERE SECURITY_ID     = %s
"""
DELETE_SECURITY_RESOURCE_GROUP = """
    DELETE
     FROM tb_security_resource_group 
    WHERE SECURITY_ID = %s
"""
SELECT_SECURITY_RESOURCE_GROUP_LIST = """
    SELECT SRG.SECURITY_ID,
           SRG.DOMAIN_KEY,
           SRG.SECURITY_NAME,
           SRG.SECURITY_ICON,
           SRG.DESCRIPTION,
           SRG.MANUFACTURER_NAME,
           SRG.MANUFACTURER_ICON,
           SRG.SOFTWARE_VERSION,
           SRG.IMAGE_NAME,
           SRG.TOPOLOGY_JSON,
           SRG.LINK_JSON,
           SRG.SECURITY_JSON,
           NSF.NSF_KEY,
           NSF.NAME AS NSF_NAME,
           NSF.CAPABILITY_XML,
           NSF.PROCESSING,
           NSF.INBOUND,
           NSF.OUTBOUND,
           NSF.INITIATED,
           SRG.INSUSER,
           SRG.INSDATE,
           SRG.UPDUSER,
           SRG.UPDDATE
     FROM tb_security_resource_group SRG
     LEFT OUTER JOIN tb_rel_security_nsf AS RSN
       ON SRG.SECURITY_ID = RSN.SECURITY_ID
      AND SRG.DOMAIN_KEY = RSN.DOMAIN_KEY
     LEFT OUTER JOIN tb_nsf AS NSF
       ON RSN.NSF_KEY = NSF.NSF_KEY
"""

# ================== SECURITY CONTROLLER 연동관련 ==================
# ================== NSF 관련 ==================
INSERT_NSF = """
    INSERT INTO tb_nsf (
        NAME,
        PROCESSING,
        INBOUND,
        OUTBOUND,
        INITIATED,
        INSDATE,
        INSUSER,
        UPDDATE,
        UPDUSER
    ) VALUES (
        %s,
        %s,
        %s,
        %s,
        %s,
        NOW(),
        %s,
        NOW(),
        %s
    )
"""

SELECT_SECURITY_ID_BY_NSF_NAME = """
    SELECT RSN.DOMAIN_KEY,
           RSN.SECURITY_ID
      FROM tb_rel_security_nsf RSN, tb_nsf NSF
     WHERE RSN.NSF_KEY = NSF.NSF_KEY
       AND NSF.NAME = %s
"""

INSERT_NSF_XML = """
    INSERT INTO tb_nsf (
        NAME,
        CAPABILITY_XML,
        INSDATE,
        INSUSER,
        UPDDATE,
        UPDUSER
    ) VALUES (
        %s,
        %s,
        NOW(),
        %s,
        NOW(),
        %s
    )
"""

UPDATE_NSF = """
    UPDATE tb_nsf SET
        NAME = %s,
        PROCESSING = %s,
        INBOUND = %s,
        OUTBOUND = %s,
        INITIATED = %s,
        UPDDATE = NOW(),
        UPDUSER = %s
    WHERE NSF_KEY = %s
"""

DELETE_NSF = """
    DELETE
     FROM tb_nsf
    WHERE NSF_KEY = %s
"""

INSERT_REL_SECURITY_NSF = """
    INSERT INTO tb_rel_security_nsf (
        DOMAIN_KEY,
        SECURITY_ID,
        NSF_KEY
    ) VALUES (
        (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s),
        %s,
        %s
    )
"""

SELECT_REL_SECURITY_NSF_BY_SECURITY_ID = """
    SELECT DOMAIN_KEY,
           SECURITY_ID,
           NSF_KEY
      FROM tb_rel_security_nsf
     WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
       AND SECURITY_ID = %s
"""

DELETE_REL_SECURITY_NSF = """
    DELETE
      FROM tb_rel_security_nsf
     WHERE DOMAIN_KEY = %s
       AND SECURITY_ID = %s
       AND NSF_KEY = %s
"""

INSERT_CAPABILITY = """
    INSERT INTO tb_capability (
        NSF_KEY,
        NAME,
        INSDATE,
        INSUSER,
        UPDDATE,
        UPDUSER
    ) VALUES (
        %s,
        %s,
        NOW(),
        %s,
        NOW(),
        %s
    )
"""

UPDATE_CAPABILITY = """
    UPDATE tb_capability SET
        NAME = %s,
        UPDDATE = NOW(),
        UPDUSER = %s
    WHERE CAPABILITY_KEY = %s
      AND NSF_KEY = (SELECT NSF_KEY FROM tb_nsf WHERE NAME = %s)
"""

DELETE_CAPABILITY = """
    DELETE
     FROM tb_capability
    WHERE CAPABILITY_KEY = %s
      AND NSF_KEY = (SELECT NSF_KEY FROM tb_nsf WHERE NAME = %s)
"""

INSERT_FIELD = """
    INSERT INTO tb_field (
        NSF_KEY,
        CAPABILITY_KEY,
        NAME,
        INSDATE,
        INSUSER,
        UPDDATE,
        UPDUSER
    ) VALUES (
        %s,
        %s,
        %s,
        NOW(),
        %s,
        NOW(),
        %s
    )
"""

UPDATE_FIELD = """
    UPDATE tb_field SET
        NAME = %s,
        UPDDATE = NOW(),
        UPDUSER = %s
    WHERE FIELD_KEY = %s
      AND CAPABILITY_KEY = (SELECT CAPABILITY_KEY FROM tb_capability WHERE NAME = %s)
      AND NSF_KEY = (SELECT NSF_KEY FROM tb_nsf WHERE NAME = %s)
"""

DELETE_FIELD = """
    DELETE
     FROM tb_field
    WHERE FIELD_KEY = %s
      AND CAPABILITY_KEY = (SELECT CAPABILITY_KEY FROM tb_capability WHERE NAME = %s)
      AND NSF_KEY = (SELECT NSF_KEY FROM tb_nsf WHERE NAME = %s)    
"""

# ================== RULE 관련 ==================
SELECT_FW_RULE_LIST = """
     SELECT RULE_KEY,
            POLICY_NAME,
            SOURCE_TARGET,
            DESTINATION_TARGET,
            START_TIME,
            END_TIME,
            ACTION_DATA,
            DESCRIPTION
       FROM tb_fw_rule
      WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
"""

SELECT_FW_RULE = """
     SELECT RULE_KEY,
            POLICY_NAME,
            SOURCE_TARGET,
            DESTINATION_TARGET,
            START_TIME,
            END_TIME,
            ACTION_DATA,
            DESCRIPTION
       FROM tb_fw_rule
      WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
        AND RULE_KEY = %s
"""

INSERT_FW_RULE = """
    INSERT INTO tb_fw_rule (
        DOMAIN_KEY,
        POLICY_NAME,
        SOURCE_TARGET,
        DESTINATION_TARGET,
        START_TIME,
        END_TIME,
        ACTION_DATA,
        DESCRIPTION,
        INSDATE,
        INSUSER,
        UPDDATE,
        UPDUSER
    ) VALUES (
        (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s),
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        NOW(),
        %s,
        NOW(),
        %s
    )
"""

UPDATE_FW_RULE = """
    UPDATE tb_fw_rule SET
        POLICY_NAME = %s,
        SOURCE_TARGET = %s,
        DESTINATION_TARGET = %s,
        START_TIME = %s,
        END_TIME = %s,
        ACTION_DATA = %s,
        DESCRIPTION = %s,
        UPDDATE = NOW(),
        UPDUSER = %s
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
      AND RULE_KEY = %s
"""

DELETE_FW_RULE = """
    DELETE
     FROM tb_fw_rule
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
      AND RULE_KEY = %s
"""

SELECT_ENDPOINT_LIST = """
     SELECT ENDPOINT_KEY,
            NAME,
            METADATA,
            ENDPOINT_TYPE,
            INSUSER,
            UPDUSER
       FROM tb_endpoint
      WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
"""
SELECT_ENDPOINT = """
     SELECT ENDPOINT_KEY,
            NAME,
            METADATA,
            ENDPOINT_TYPE,
            INSUSER,
            UPDUSER
       FROM tb_endpoint
      WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
        AND ENDPOINT_KEY = %s
"""

INSERT_ENDPOINT = """
    INSERT INTO tb_endpoint (
        DOMAIN_KEY,
        NAME,
        METADATA,
        ENDPOINT_TYPE,
        INSDATE,
        INSUSER,
        UPDDATE,
        UPDUSER
    ) VALUES (
        (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s),
        %s,
        %s,
        %s,
        NOW(),
        %s,
        NOW(),
        %s
    )
"""

UPDATE_ENDPOINT = """
    UPDATE tb_endpoint SET
        NAME = %s,
        METADATA = %s,
        ENDPOINT_TYPE = %s,
        UPDDATE = NOW(),
        UPDUSER = %s
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
      AND ENDPOINT_KEY = %s
"""

DELETE_ENDPOINT = """
    DELETE
     FROM tb_endpoint
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
      AND ENDPOINT_KEY = %s
"""

# ================== SERVICE TEMPLATE 관련 ==================
SELECT_SERVICE_TEMPLATE = """
    SELECT SERVICE_TEMPLATE_KEY
         , NAME
         , TOPOLOGY_JSON
         , LINK_JSON
         , DESCRIPTION
      FROM tb_service_template
     WHERE SERVICE_TEMPLATE_KEY = %s
"""

SEARCH_SERVICE_TEMPLATE_KEY = """
    SELECT RTS.SERVICE_TEMPLATE_KEY
         , RTS.SECURITY_ID
         , RTS.DOMAIN_KEY
      FROM tb_rel_template_security RTS, (
                                            SELECT SERVICE_TEMPLATE_KEY
                                                 , COUNT(SECURITY_ID) AS CNT
                                              FROM tb_rel_template_security
                                             GROUP BY SERVICE_TEMPLATE_KEY
                                         ) TMP
     WHERE RTS.SERVICE_TEMPLATE_KEY = TMP.SERVICE_TEMPLATE_KEY
       AND TMP.CNT = %s
"""

SELECT_SECURITY_RESOURCE_GROUP_BY_TEMPLATE_KEY = """
    SELECT SRG.SECURITY_ID
         , SRG.DOMAIN_KEY
         , SRG.SECURITY_NAME
         , SRG.SECURITY_ICON
         , SRG.MANUFACTURER_NAME
         , SRG.MANUFACTURER_ICON
         , SRG.SOFTWARE_VERSION
         , SRG.IMAGE_NAME
         , SRG.TOPOLOGY_JSON
         , SRG.LINK_JSON
         , SRG.SECURITY_JSON
         , SRG.DESCRIPTION
      FROM tb_security_resource_group SRG, tb_rel_template_security RTS
     WHERE SRG.SECURITY_ID = RTS.SECURITY_ID
       AND SRG.DOMAIN_KEY = RTS.DOMAIN_KEY
       AND RTS.SERVICE_TEMPLATE_KEY = %s
       AND RTS.DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
"""

DELETE_REL_TEMPLATE_SECURITY = """
    DELETE
      FROM tb_rel_template_security
     WHERE DOMAIN_KEY = %s
       AND SECURITY_ID = %s
"""