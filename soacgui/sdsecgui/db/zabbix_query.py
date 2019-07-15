# _*_ coding:utf-8 _*_
"""
CREATE table tb_zabbix_alarms (
    ALARM_KEY MEDIUMINT NOT NULL AUTO_INCREMENT,
    EVENT_ID nvarchar(200),
    HOST_NAME nvarchar(200),
    TRIGGER_NAME nvarchar(200),
    SEVERITY nvarchar(30),
    STATUS nvarchar(30),
    EVENT_TIME DATETIME,
    RECOVERY_TIME DATETIME,
    TRIGGER_URL nvarchar(300),
    PRIMARY KEY (`ALARM_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE table tb_zabbix_alarms (
    ALARM_KEY MEDIUMINT NOT NULL AUTO_INCREMENT,
    TRIGGER_NAME nvarchar(200),
    TRIGGER_MESSAGE nvarchar(1000),
    TRIGGER_URL nvarchar(300),
    INS_DATE DATETIME,
    PRIMARY KEY (`ALARM_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DELIMITER //
CREATE TRIGGER tb_zabbix_alarms_DateTime_DEFAULT
BEFORE INSERT
    ON tb_zabbix_alarms FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
END; //
DELIMITER ;
"""

# INSERT_ALARM = """
#     INSERT INTO tb_zabbix_alarms (
#         TRIGGER_NAME,
#         TRIGGER_URL,
#         HOST_NAME,
#         SEVERITY,
#         STATUS,
#         EVENT_ID,
#         EVENT_TIME
#     ) VALUES (
#         %s,
#         %s,
#         %s,
#         %s,
#         %s,
#         %s,
#         %s
#     )
# """
INSERT_ALARM = """
    INSERT INTO tb_zabbix_alarms (
        TRIGGER_NAME,
        TRIGGER_MESSAGE,
        TRIGGER_URL
    ) VALUES (
        %s,
        %s,
        %s
    )
"""

UPDATE_ALARM = """
    UPDATE tb_zabbix_alarms SET
        STATUS = %s,
        RECOVERY_TIME = %s
    WHERE EVENT_ID = %s
"""

SELECT_ALARM = """
    SELECT ALARM_KEY,
           TRIGGER_NAME,
           TRIGGER_MESSAGE,
           TRIGGER_URL,
           INS_DATE
    FROM tb_zabbix_alarms
  ORDER BY INS_DATE DESC 
"""
# SELECT_ALARM = """
#     SELECT ALARM_KEY,
#            TRIGGER_NAME,
#            TRIGGER_URL,
#            HOST_NAME,
#            SEVERITY,
#            STATUS,
#            EVENT_ID,
#            EVENT_TIME,
#            RECOVERY_TIME
#     FROM tb_zabbix_alarms
# ORDER BY EVENT_TIME DESC
# """