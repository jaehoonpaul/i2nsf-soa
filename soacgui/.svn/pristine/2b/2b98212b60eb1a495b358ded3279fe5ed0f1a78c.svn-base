# _*_ coding:utf-8 _*_
"""
query
create database soacgui;
create user 'soacgui'@'localhost' identified by 'etri1234';
grant all privileges on soacgui.* to soacgui@'%' identified by 'etri1234';
flush privileges;


CREATE table tb_user (
    USER_KEY MEDIUMINT NOT NULL AUTO_INCREMENT,
    USER_ID nvarchar(30),
    USER_PASS nvarchar(500),
    USER_NAME nvarchar(20),
    PRIMARY KEY (`USER_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE tb_domains ADD DB_IP varchar(100);
ALTER TABLE tb_domains ADD DB_PORT int(11);
ALTER TABLE tb_domains ADD DB_USER varchar(20);
ALTER TABLE tb_domains ADD DB_PASSWORD varchar(100);


CREATE table tb_domains (
    DOMAIN_KEY MEDIUMINT NOT NULL AUTO_INCREMENT,
    DOMAIN_NAME nvarchar(100),
    AUTH_URL nvarchar(500),
    DESCRIPTION nvarchar(5000),
    ORDER_NUM int(11),
    DB_IP nvarchar(16),
    DB_PORT int(11),
    DB_USER nvarchar(100),
    DB_NAME nvarchar(100),
    DB_PASSWORD varchar(100),
    PRIMARY KEY (`DOMAIN_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


SOA(관리포탈) 관련 테이블

CREATE table tb_soa_project (
    DOMAIN_KEY MEDIUMINT NOT NULL,
    PROJECT_ID nvarchar(100),
    PROJECT_NAME nvarchar(100),
    INS_USER nvarchar(100),
    INS_DATE DATETIME,
    UPD_USER nvarchar(100),
    UPD_DATE DATETIME,
    PRIMARY KEY (`DOMAIN_KEY`, `PROJECT_ID`),
    FOREIGN KEY (`DOMAIN_KEY`) REFERENCES `tb_domains` (`DOMAIN_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE table tb_soa_user (
    DOMAIN_KEY MEDIUMINT NOT NULL,
    PROJECT_ID nvarchar(100) NOT NULL,
    USER_ID nvarchar(100) NOT NULL,
    USER_NAME nvarchar(100),
    INS_USER nvarchar(100),
    INS_DATE DATETIME,
    UPD_USER nvarchar(100),
    UPD_DATE DATETIME,
    PRIMARY KEY (`DOMAIN_KEY`, `PROJECT_ID`, `USER_ID`),
    FOREIGN KEY (`DOMAIN_KEY`, `PROJECT_ID`) REFERENCES `tb_soa_project` (`DOMAIN_KEY`, `PROJECT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE table tb_soa_service (
    DOMAIN_KEY MEDIUMINT NOT NULL,
    PROJECT_ID nvarchar(100) NOT NULL,
    SERVICE_ID nvarchar(100) NOT NULL,
    SERVICE_NAME nvarchar(100),
    SERVICE_STATUS nvarchar(50),
    SYNC_STATUS nvarchar(1),
    SYNC_DATE nvarchar(1),
    INS_USER nvarchar(100),
    INS_DATE DATETIME,
    UPD_USER nvarchar(100),
    UPD_DATE DATETIME,
    PRIMARY KEY (`DOMAIN_KEY`, `PROJECT_ID`, `SERVICE_ID`),
    FOREIGN KEY (`DOMAIN_KEY`, `PROJECT_ID`) REFERENCES `tb_soa_project` (`DOMAIN_KEY`, `PROJECT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER //
CREATE TRIGGER tb_soa_project_DateTime_DEFAULT
BEFORE INSERT
    ON tb_soa_project FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
    SET NEW.UPD_DATE = NOW();
END; //
CREATE TRIGGER tb_soa_user_DateTime_DEFAULT
BEFORE INSERT
    ON tb_soa_user FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
    SET NEW.UPD_DATE = NOW();
END; //
CREATE TRIGGER tb_soa_service_DateTime_DEFAULT
BEFORE INSERT
    ON tb_soa_service FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
    SET NEW.UPD_DATE = NOW();
END; //
DELIMITER ;
"""
"""
이 테이블은 뭐지...?
CREATE table tb_security_resource (
    NAME nvarchar(50),
    BOOTING_SOURCE_TYPE nvarchar(50),
    IMAGE nvarchar(50),
    FLAVOR nvarchar(50),
    KEY_NAME nvarchar(50),
    SECURITY_GROUP nvarchar(50),
    CUSTOM_SCRIPT nvarchar(16000)
);
"""
# INSERT_SECURITY_RESOURCE = """
#     INSERT INTO security_resource (
#         name, booting_source_type, image, flavor, key_name, security_group, custom_script
#     ) VALUES (
#         %s, %s, %s, %s, %s, %s, %s
#     )
# """
# SELECT_SECURITY_RESOURCE_LIST = """
#     SELECT *
#     FROM security_resource
# """
# DELETE_SECURITY_RESOURCE = """
#     DELETE
#     FROM security_resource
#     WHERE name = %s
# """

INSERT_USER = """
    INSERT INTO tb_user (
        USER_ID,
        USER_PASS,
        USER_NAME
    ) VALUES (
        '%s', '%s', '%s'
    )
"""

SELECT_USER = """
    SELECT USER_KEY,
           USER_ID,
           USER_NAME
      FROM tb_user
     WHERE USER_ID = %s
       AND USER_PASS = %s 
"""

INSERT_DOMAINS = """
    INSERT INTO tb_domains (
        DOMAIN_NAME,
        AUTH_URL,
        DESCRIPTION,
        DB_IP,
        DB_PORT,
        DB_USER,
        DB_PASSWORD
    ) VALUES (
        %s,
        %s,
        %s,
        %s,
        %s,
        %s,
        %s
    )
"""
SELECT_DOMAINS = """
    SELECT DOMAIN_KEY,
           DOMAIN_NAME,
           AUTH_URL,
           DESCRIPTION,
           ORDER_NUM,
           DB_IP,
           DB_PORT,
           DB_USER,
           DB_PASSWORD
     FROM tb_domains
    ORDER BY ORDER_NUM ASC
"""
SELECT_DOMAINS_ONE = """
    SELECT DOMAIN_KEY,
           DOMAIN_NAME,
           AUTH_URL,
           DESCRIPTION,
           ORDER_NUM,
           DB_IP,
           DB_PORT,
           DB_USER,
           DB_PASSWORD
     FROM tb_domains
    WHERE DOMAIN_KEY = %s
"""
SELECT_DOMAINS_ONE_BY_AUTH_URL = """
    SELECT DOMAIN_KEY,
           DOMAIN_NAME,
           AUTH_URL,
           DESCRIPTION,
           ORDER_NUM,
           DB_IP,
           DB_PORT,
           DB_USER,
           DB_PASSWORD
     FROM tb_domains
    WHERE AUTH_URL = %s
"""
UPDATE_SEQ_DOMAIN = """
    UPDATE tb_domains SET
        ORDER_NUM = %s
    WHERE DOMAIN_KEY = %s
"""
SELECT_DOMAINS_COUNT = """
    SELECT COUNT(*) AS CNT
      FROM tb_domains
"""
SELECT_DOMAINS_SEQ = """
    SELECT ORDER_NUM
      FROM tb_domains
     WHERE DOMAIN_KEY = %s
"""
UPDATE_DOMAINS = """
    UPDATE tb_domains SET
           DOMAIN_NAME = %s,
           AUTH_URL    = %s,
           DESCRIPTION = %s,
           DB_IP = %s,
           DB_PORT = %s,
           DB_USER = %s,
           DB_PASSWORD = %s
     WHERE DOMAIN_KEY = %s
"""
SET_SEQ_DOMAINS = """
    UPDATE tb_domains SET
           ORDER_NUM = %s
     WHERE DOMAIN_NAME = %s
"""
DELETE_DOMAINS = """
    DELETE
     FROM tb_domains 
    WHERE DOMAIN_KEY = %s
"""
SELECT_SOAC_DOMAINS = """
    SELECT DOMAIN_KEY,
           DOMAIN_NAME,
           DESCRIPTION
     FROM tb_domains
    WHERE AUTH_URL = %s
"""
INSERT_SOAC_PROJECT = """
    INSERT INTO tb_soa_project (
        DOMAIN_KEY,
        PROJECT_ID,
        PROJECT_NAME,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_KEY FROM tb_domains WHERE AUTH_URL = %s),
        %s,
        %s,
        'SOA_manager',
        'SOA_manager'
    )
"""

SELECT_SOAC_PROJECT_LIST = """
    SELECT (SELECT D.DOMAIN_NAME FROM tb_domains D WHERE D.DOMAIN_KEY = SP.DOMAIN_KEY) AS DOMAIN_NAME,
           PROJECT_ID,
           PROJECT_NAME,
           INS_USER,
           INS_DATE,
           UPD_USER,
           UPD_DATE
     FROM tb_soa_project SP
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
"""

SELECT_SOAC_PROJECT = """
    SELECT (SELECT D.DOMAIN_NAME FROM tb_domains D WHERE D.DOMAIN_KEY = SP.DOMAIN_KEY) AS DOMAIN_NAME,
           PROJECT_ID,
           PROJECT_NAME,
           INS_USER,
           INS_DATE,
           UPD_USER,
           UPD_DATE
     FROM tb_soa_project SP
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
      AND PROJECT_ID = (SELECT PROJECT_ID FROM tb_soa_project WHERE PROJECT_NAME = %s)
"""

DELETE_SOAC_PROJECT = """
    DELETE
     FROM tb_soa_project
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
      AND PROJECT_ID = (SELECT PROJECT_ID FROM tb_soa_project WHERE PROJECT_NAME = %s)
"""

INSERT_SOAC_USER = """
    INSERT INTO tb_soa_user (
        DOMAIN_KEY,
        PROJECT_ID,
        USER_ID,
        USER_NAME,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_KEY FROM tb_domains WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        'SOA_manager',
        'SOA_manager'
    )
"""

SELECT_SOAC_USER_LIST = """
    SELECT (SELECT D.DOMAIN_NAME FROM tb_domains D WHERE D.DOMAIN_KEY = SU.DOMAIN_KEY) AS DOMAIN_NAME,
           USER_ID,
           USER_NAME,
           INS_USER,
           INS_DATE,
           UPD_USER,
           UPD_DATE
     FROM tb_soa_user SU
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE DOMAIN_NAME = %s)
"""

SELECT_SOAC_USER = """
    SELECT (SELECT D.DOMAIN_NAME FROM tb_domains D WHERE D.DOMAIN_KEY = SU.DOMAIN_KEY) AS DOMAIN_NAME,
           USER_ID,
           USER_NAME,
           INS_USER,
           INS_DATE,
           UPD_USER,
           UPD_DATE
     FROM tb_soa_user SU
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE AUTH_URL = %s)
      AND PROJECT_ID = %s
      AND USER_ID    = %s
"""

DELETE_SOAC_USER = """
    DELETE
     FROM tb_soa_user
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE AUTH_URL = %s)
      AND USER_ID    = %s
"""

INSERT_SOAC_SERVICE = """
    INSERT INTO tb_soa_service (
        DOMAIN_KEY,
        PROJECT_ID,
        SERVICE_ID,
        SERVICE_NAME,
        SERVICE_STATUS,
        SYNC_STATUS,
        INS_USER,
        UPD_USER
    ) VALUES (
        (SELECT DOMAIN_KEY FROM tb_domains WHERE AUTH_URL = %s),
        %s,
        %s,
        %s,
        %s,
        "I",
        %s,
        %s
    )
"""

UPDATE_SOAC_SERVICE = """
    UPDATE tb_soa_service SET
        SERVICE_NAME   = %s,
        SERVICE_STATUS = %s,
        SYNC_STATUS    = %s,
        UPD_USER       = %s,
        UPD_DATE       = NOW()
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE AUTH_URL = %s)
      AND PROJECT_ID = (SELECT PROJECT_ID FROM tb_soa_project WHERE PROJECT_NAME = %s)
      AND SERVICE_ID = %s
"""

DELETE_SOAC_SERVICE = """
    DELETE
     FROM tb_soa_service
    WHERE DOMAIN_KEY = (SELECT DOMAIN_KEY FROM tb_domains WHERE AUTH_URL = %s)
      AND PROJECT_ID = (SELECT PROJECT_ID FROM tb_soa_project WHERE PROJECT_NAME = %s)
      AND SERVICE_ID = %s
"""
