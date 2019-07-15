-- MySQL dump 10.13  Distrib 5.5.62, for debian-linux-gnu (i686)
--
-- Host: localhost    Database: soacgui
-- ------------------------------------------------------
-- Server version	5.5.62-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `soacgui`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `soacgui` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `soacgui`;

--
-- Table structure for table `tb_domains`
--

DROP TABLE IF EXISTS `tb_domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_domains` (
  `DOMAIN_KEY` mediumint(9) NOT NULL AUTO_INCREMENT,
  `DOMAIN_NAME` varchar(100) DEFAULT NULL,
  `AUTH_URL` varchar(500) DEFAULT NULL,
  `DESCRIPTION` varchar(5000) DEFAULT NULL,
  `ORDER_NUM` int(11) DEFAULT NULL,
  `DB_IP` varchar(16) DEFAULT NULL,
  `DB_USER` varchar(20) DEFAULT NULL,
  `DB_PASSWORD` varchar(100) DEFAULT NULL,
  `DB_PORT` int(11) DEFAULT NULL,
  PRIMARY KEY (`DOMAIN_KEY`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_domains`
--

LOCK TABLES `tb_domains` WRITE;
/*!40000 ALTER TABLE `tb_domains` DISABLE KEYS */;
INSERT INTO `tb_domains` VALUES (1,'soac-m3','http://10.10.100.15:35357/v3','개발용 Mitaka PoD',2,'10.10.100.15','root','etri!@#',3306),(2,'soac-m4','http://10.10.100.19:35357/v3','서비스 검증용 Mitaka PoD',3,'10.10.100.19','root','etri!@#',3306),(3,'soac-m6','http://10.10.200.15:35357/v3','서비스 검증용 Mitaka PoD (2)',4,'localhost','root','etri!@#',3306),(4,'soac-m2','http://10.10.100.11:35357/v3','SOA 시범서비스 PoD',1,'10.10.100.11','root','etri!@#',3306);
/*!40000 ALTER TABLE `tb_domains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_security_resource_group`
--

DROP TABLE IF EXISTS `tb_security_resource_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_security_resource_group` (
  `SECURITY_ID` varchar(100) NOT NULL,
  `DOMAIN_KEY` mediumint(9) NOT NULL,
  `SECURITY_NAME` varchar(100) DEFAULT NULL,
  `SECURITY_ICON` varchar(300) DEFAULT NULL,
  `DESCRIPTION` varchar(500) DEFAULT NULL,
  `MANUFACTURER_NAME` varchar(100) DEFAULT NULL,
  `MANUFACTURER_ICON` varchar(300) DEFAULT NULL,
  `SOFTWARE_VERSION` varchar(100) DEFAULT NULL,
  `IMAGE_NAME` varchar(100) DEFAULT NULL,
  `DATA` mediumtext,
  `INS_USER` varchar(100) DEFAULT NULL,
  `INS_DATE` datetime DEFAULT NULL,
  `UPD_USER` varchar(100) DEFAULT NULL,
  `UPD_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`SECURITY_ID`,`DOMAIN_KEY`),
  KEY `DOMAIN_KEY` (`DOMAIN_KEY`),
  CONSTRAINT `tb_security_resource_group_ibfk_1` FOREIGN KEY (`DOMAIN_KEY`) REFERENCES `tb_domains` (`DOMAIN_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_security_resource_group`
--

LOCK TABLES `tb_security_resource_group` WRITE;
/*!40000 ALTER TABLE `tb_security_resource_group` DISABLE KEYS */;
INSERT INTO `tb_security_resource_group` VALUES ('10c5df1b-ef42-c652-953b-d1eacf2e285d',1,'DLP_test',NULL,'DLP_func','chiron',NULL,'v1.1','cirros-0.3.4','{\"nodes\": [{\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"DLP_net\", \"resource_type\": \"network\"}, {\"data\": {\"booting_source_type\": \"image\", \"name\": \"\", \"key_name\": \"\", \"image\": \"cirros-0.3.4\", \"custom_script\": \"\", \"tenant_net_list\": [{\"public_ip\": false, \"tenant_net\": \"DLP_net\", \"ip_address\": \"\", \"name\": \"\", \"mac_address\": \"\"}], \"security_group\": \"\", \"flavor\": \"m1.tiny\", \"availability\": \"nova\", \"resource_type\": \"virtual_machine\"}, \"name\": \"DLP_vm\", \"resource_type\": \"virtual_machine\"}, {\"data\": {\"image_type\": \"image\", \"vm_template\": \"DLP_vm\", \"type\": \"None\", \"name\": \"\", \"resource_type\": \"volume\"}, \"name\": \"DLP_vol\", \"resource_type\": \"volume\"}], \"security_types\": [{\"name\": \"DLP_vol\"}, {\"security_type\": \"dlp\", \"name\": \"DLP_vm\"}, {\"name\": \"DLP_net\"}], \"links\": [{\"source\": {\"name\": \"DLP_net\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"DLP_vm\", \"resource_type\": \"virtual_machine\"}}, {\"source\": {\"name\": \"DLP_vm\", \"resource_type\": \"virtual_machine\"}, \"target\": {\"name\": \"DLP_vol\", \"resource_type\": \"volume\"}}]}','chiron','2018-09-07 11:09:00','chiron','2018-09-07 11:09:00'),('98b10284-539c-8b4c-7c0b-038e3b28dce7',3,'IPS-sec',NULL,'description11','chi',NULL,'v1.2','cirros-0.3.4','{\"nodes\": [{\"data\": {\"booting_source_type\": \"image\", \"name\": \"\", \"key_name\": \"\", \"image\": \"cirros-0.3.4\", \"custom_script\": \"\", \"tenant_net_list\": [{\"public_ip\": false, \"tenant_net\": \"testNetwork\", \"name\": \"\"}, {\"public_ip\": false, \"tenant_net\": \"testNetwork1\", \"name\": \"\"}], \"security_group\": \"\", \"flavor\": \"m1.tiny\", \"availability\": \"nova\", \"resource_type\": \"virtual_machine\"}, \"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}, {\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"testNetwork\", \"resource_type\": \"network\"}, {\"data\": {\"image_type\": \"image\", \"vm_template\": \"testIPS\", \"type\": \"None\", \"name\": \"\", \"resource_type\": \"volume\"}, \"name\": \"testVolume\", \"resource_type\": \"volume\"}, {\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"testNetwork1\", \"resource_type\": \"network\"}], \"security_types\": [{\"security_type\": \"ips\", \"name\": \"testIPS\"}, {\"name\": \"testNetwork1\"}, {\"name\": \"testNetwork\"}, {\"name\": \"testVolume\"}], \"links\": [{\"source\": {\"name\": \"testNetwork\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}}, {\"source\": {\"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}, \"target\": {\"name\": \"testVolume\", \"resource_type\": \"volume\"}}, {\"source\": {\"name\": \"testNetwork1\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"testIPS\", \"resource_type\": \"virtual_machine\"}}]}','admin','2018-11-28 19:16:21','admin','2018-11-28 19:16:21'),('eb5d7701-c327-8766-8b55-0e4ef6e4aa35',3,'DLP_sec',NULL,'testDescription','chi',NULL,'v1.3','cirros-0.3.4','{\"nodes\": [{\"data\": {\"booting_source_type\": \"image\", \"name\": \"\", \"key_name\": \"\", \"image\": \"cirros-0.3.4\", \"custom_script\": \"\", \"tenant_net_list\": [{\"public_ip\": false, \"tenant_net\": \"test_dlp_net\", \"name\": \"\"}], \"security_group\": \"\", \"flavor\": \"m1.tiny\", \"availability\": \"nova\", \"resource_type\": \"virtual_machine\"}, \"name\": \"test_DLP\", \"resource_type\": \"virtual_machine\"}, {\"data\": {\"name\": \"\", \"enable_dhcp\": true, \"host_route\": [], \"admin_state\": \"UP\", \"ip_version\": \"4\", \"alloc_pools\": [], \"resource_type\": \"network\"}, \"name\": \"test_dlp_net\", \"resource_type\": \"network\"}], \"security_types\": [{\"security_type\": \"dlp\", \"name\": \"test_DLP\"}, {\"name\": \"test_dlp_net\"}], \"links\": [{\"source\": {\"name\": \"test_dlp_net\", \"resource_type\": \"network\"}, \"target\": {\"name\": \"test_DLP\", \"resource_type\": \"virtual_machine\"}}]}','admin','2018-11-28 19:28:19','admin','2018-11-28 19:28:19');
/*!40000 ALTER TABLE `tb_security_resource_group` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER tb_security_resource_group_DateTime_DEFAULT
BEFORE INSERT
    ON tb_security_resource_group FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
    SET NEW.UPD_DATE = NOW();
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tb_soa_project`
--

DROP TABLE IF EXISTS `tb_soa_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_soa_project` (
  `DOMAIN_KEY` mediumint(9) NOT NULL,
  `PROJECT_ID` varchar(100) NOT NULL DEFAULT '',
  `PROJECT_NAME` varchar(100) DEFAULT NULL,
  `INS_USER` varchar(100) DEFAULT NULL,
  `INS_DATE` datetime DEFAULT NULL,
  `UPD_USER` varchar(100) DEFAULT NULL,
  `UPD_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`DOMAIN_KEY`,`PROJECT_ID`),
  CONSTRAINT `tb_soa_project_ibfk_1` FOREIGN KEY (`DOMAIN_KEY`) REFERENCES `tb_domains` (`DOMAIN_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_soa_project`
--

LOCK TABLES `tb_soa_project` WRITE;
/*!40000 ALTER TABLE `tb_soa_project` DISABLE KEYS */;
INSERT INTO `tb_soa_project` VALUES (1,'dab887a751c142ce98b272ec2db27c21','test-soam','SOA_manager','2018-11-07 14:57:55','SOA_manager','2018-11-07 14:57:55');
/*!40000 ALTER TABLE `tb_soa_project` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER tb_soa_project_DateTime_DEFAULT
BEFORE INSERT
    ON tb_soa_project FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
    SET NEW.UPD_DATE = NOW();
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tb_soa_service`
--

DROP TABLE IF EXISTS `tb_soa_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_soa_service` (
  `DOMAIN_KEY` mediumint(9) NOT NULL,
  `PROJECT_ID` varchar(100) NOT NULL,
  `SERVICE_ID` varchar(100) NOT NULL,
  `SERVICE_NAME` varchar(100) DEFAULT NULL,
  `SERVICE_STATUS` varchar(50) DEFAULT NULL,
  `SYNC_STATUS` varchar(1) DEFAULT NULL,
  `SYNC_DATE` varchar(1) DEFAULT NULL,
  `INS_USER` varchar(100) DEFAULT NULL,
  `INS_DATE` datetime DEFAULT NULL,
  `UPD_USER` varchar(100) DEFAULT NULL,
  `UPD_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`DOMAIN_KEY`,`PROJECT_ID`,`SERVICE_ID`),
  CONSTRAINT `tb_soa_service_ibfk_1` FOREIGN KEY (`DOMAIN_KEY`, `PROJECT_ID`) REFERENCES `tb_soa_project` (`DOMAIN_KEY`, `PROJECT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_soa_service`
--

LOCK TABLES `tb_soa_service` WRITE;
/*!40000 ALTER TABLE `tb_soa_service` DISABLE KEYS */;
INSERT INTO `tb_soa_service` VALUES (1,'dab887a751c142ce98b272ec2db27c21','2c057f78-e282-11e8-8b79-288023a6d735','searge4','CREATE_COMPLETE','C',NULL,'admin','2018-11-07 20:42:16','admin','2018-11-07 20:42:51'),(1,'dab887a751c142ce98b272ec2db27c21','af1e983a-e283-11e8-8e23-288023a6d735','se4g','CREATE_COMPLETE','C',NULL,'admin','2018-11-07 20:53:06','admin','2018-11-07 20:53:42'),(1,'dab887a751c142ce98b272ec2db27c21','d3d00412-e282-11e8-8b79-288023a6d735','aerg','CREATE_COMPLETE','C',NULL,'admin','2018-11-07 20:46:57','admin','2018-11-07 20:47:32');
/*!40000 ALTER TABLE `tb_soa_service` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER tb_soa_service_DateTime_DEFAULT
BEFORE INSERT
    ON tb_soa_service FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
    SET NEW.UPD_DATE = NOW();
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tb_soa_user`
--

DROP TABLE IF EXISTS `tb_soa_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_soa_user` (
  `DOMAIN_KEY` mediumint(9) NOT NULL,
  `PROJECT_ID` varchar(100) NOT NULL,
  `USER_ID` varchar(100) NOT NULL,
  `USER_NAME` varchar(100) DEFAULT NULL,
  `INS_USER` varchar(100) DEFAULT NULL,
  `INS_DATE` datetime DEFAULT NULL,
  `UPD_USER` varchar(100) DEFAULT NULL,
  `UPD_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`DOMAIN_KEY`,`PROJECT_ID`,`USER_ID`),
  CONSTRAINT `tb_soa_user_ibfk_1` FOREIGN KEY (`DOMAIN_KEY`, `PROJECT_ID`) REFERENCES `tb_soa_project` (`DOMAIN_KEY`, `PROJECT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_soa_user`
--

LOCK TABLES `tb_soa_user` WRITE;
/*!40000 ALTER TABLE `tb_soa_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `tb_soa_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER tb_soa_user_DateTime_DEFAULT
BEFORE INSERT
    ON tb_soa_user FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
    SET NEW.UPD_DATE = NOW();
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tb_user`
--

DROP TABLE IF EXISTS `tb_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user` (
  `USER_KEY` mediumint(9) NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(30) DEFAULT NULL,
  `USER_PASS` varchar(500) DEFAULT NULL,
  `USER_NAME` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`USER_KEY`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user`
--

LOCK TABLES `tb_user` WRITE;
/*!40000 ALTER TABLE `tb_user` DISABLE KEYS */;
INSERT INTO `tb_user` VALUES (1,'admin','etri!@#','etri');
/*!40000 ALTER TABLE `tb_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_zabbix_alarms`
--

DROP TABLE IF EXISTS `tb_zabbix_alarms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_zabbix_alarms` (
  `ALARM_KEY` mediumint(9) NOT NULL AUTO_INCREMENT,
  `TRIGGER_NAME` varchar(200) DEFAULT NULL,
  `TRIGGER_MESSAGE` varchar(1000) DEFAULT NULL,
  `TRIGGER_URL` varchar(300) DEFAULT NULL,
  `INS_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ALARM_KEY`)
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_zabbix_alarms`
--

LOCK TABLES `tb_zabbix_alarms` WRITE;
/*!40000 ALTER TABLE `tb_zabbix_alarms` DISABLE KEYS */;
INSERT INTO `tb_zabbix_alarms` VALUES (100,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"3283fdbe-e57f-42d0-9ea7-3f1235b2ad9a\", \"vm_name\": \"testvm_recovery_recovery\", \"vm_id\": \"5d589326-8c34-4301-ae51-5a1f936cb987\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"5c4fa490-feb8-11e8-a1fa-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"aa9a626d-8032-44f1-8c9f-0e8baddd2d36\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 10:15:56'),(101,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"eeabf816-1f9b-4690-9c63-581920d09d38\", \"vm_name\": \"testvm_recovery_recovery_recovery\", \"vm_id\": \"d2047c7e-4665-494f-ab5a-7b5bb4ab5517\", \"floating_ip_address\": \"10.10.200.47\", \"service_id\": \"5c4fa490-feb8-11e8-a1fa-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"aa9a626d-8032-44f1-8c9f-0e8baddd2d36\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 10:33:56'),(102,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"d302f34f-6de7-418d-84e0-70ba2f92add2\", \"vm_name\": \"testvm_recovery_recovery_recovery_recovery\", \"vm_id\": \"a6774ee3-aec3-40e2-836b-368b62621fac\", \"floating_ip_address\": \"10.10.200.48\", \"service_id\": \"5c4fa490-feb8-11e8-a1fa-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"aa9a626d-8032-44f1-8c9f-0e8baddd2d36\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 10:47:29'),(103,'Unavailable by ICMP ping: PROBLEM','[{\"code\": 200, \"ports\": []}]','http://127.0.0.1:8787','2018-12-14 10:47:56'),(104,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"d302f34f-6de7-418d-84e0-70ba2f92add2\", \"vm_name\": \"testvm_recovery_recovery_recovery_recovery\", \"vm_id\": \"a6774ee3-aec3-40e2-836b-368b62621fac\", \"floating_ip_address\": \"10.10.200.48\", \"service_id\": \"5c4fa490-feb8-11e8-a1fa-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"aa9a626d-8032-44f1-8c9f-0e8baddd2d36\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 10:47:56'),(105,'Unavailable by ICMP ping: PROBLEM','[{\"NeutronError\": {\"message\": \"Floating IP d302f34f-6de7-418d-84e0-70ba2f92add2 could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance a6774ee3-aec3-40e2-836b-368b62621fac could not be found.\", \"code\": 404}}]','http://127.0.0.1:8787','2018-12-14 10:47:57'),(106,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"91b7fe75-fd43-4d7b-9afa-ab8d1c2e2af9\", \"vm_name\": \"testvm_recovery_recovery_recovery_recovery_recovery\", \"vm_id\": \"752bab74-0a85-409d-a544-faddf9845107\", \"floating_ip_address\": \"10.10.200.51\", \"service_id\": \"5c4fa490-feb8-11e8-a1fa-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"aa9a626d-8032-44f1-8c9f-0e8baddd2d36\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 11:42:57'),(107,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"f141b541-3e2b-4206-a9c8-37ca13aab169\", \"vm_name\": \"alarm_test_vm_recovery\", \"vm_id\": \"30cddace-03da-4ca0-82f1-b915d01c9e83\", \"floating_ip_address\": \"10.10.200.50\", \"service_id\": \"5077dd62-ed5c-11e8-bc3f-288023a6d735\", \"port_id\": \"1b45c0ae-d23a-471f-9a66-a9b73a3138e1\", \"fixed_ips\": [{\"subnet_id\": \"6b290b82-b536-488d-9c5a-459bd839084c\", \"ip_address\": \"192.168.132.9\"}]}}','http://127.0.0.1:8787','2018-12-14 14:27:37'),(108,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"b086a4ed-1ba5-4ef3-8383-2cd70c066fce\", \"vm_name\": \"testvm\", \"vm_id\": \"9bf45b35-1ed9-4ce3-a3ca-a791c9808d1e\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"c42d4650-ff60-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"de85c8c8-fb94-4eaa-b95c-df969d76d772\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 15:19:06'),(109,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"354f5f8d-401c-4d55-8e69-71c8f16260f3\", \"vm_name\": \"testvm_recovery\", \"vm_id\": \"6104fe72-e58c-4ed3-b26f-cc02f4b361e7\", \"floating_ip_address\": \"10.10.200.47\", \"service_id\": \"c42d4650-ff60-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"de85c8c8-fb94-4eaa-b95c-df969d76d772\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 15:24:35'),(110,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"75746ee4-2b35-4efd-9c81-bf73556d9a88\", \"vm_name\": \"testvm_recovery_recovery\", \"vm_id\": \"57ddb6a5-dec9-4e28-8bca-39f735d35104\", \"floating_ip_address\": \"10.10.200.48\", \"service_id\": \"c42d4650-ff60-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"de85c8c8-fb94-4eaa-b95c-df969d76d772\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 15:35:15'),(111,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"1aef994f-f9a2-41f6-b90e-313aaf2aba1d\", \"vm_name\": \"testvm_recovery_recovery_recovery\", \"vm_id\": \"f15f0ae4-7781-4cfd-95f5-7fc08ededba4\", \"floating_ip_address\": \"10.10.200.50\", \"service_id\": \"c42d4650-ff60-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"de85c8c8-fb94-4eaa-b95c-df969d76d772\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 15:41:00'),(112,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"4d82b0fd-97c0-428b-b3ce-404562683b31\", \"vm_name\": \"testvm_recovery_recovery_recovery_recovery\", \"vm_id\": \"cbbcc5e7-c47b-47a2-89a6-252fd7121ba0\", \"floating_ip_address\": \"10.10.200.51\", \"service_id\": \"c42d4650-ff60-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"de85c8c8-fb94-4eaa-b95c-df969d76d772\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 15:54:57'),(113,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"b08bfcb3-7cea-45d5-bf21-fd5a704559a8\", \"vm_name\": \"testvm\", \"vm_id\": \"b72f12da-e794-4462-a379-754adf5aea29\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"a5476e42-ff6e-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"9fb89374-47cf-49f2-9e26-62bd98dfca28\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 16:07:12'),(114,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"74af3e5d-e470-474a-b63a-9c23560c6eca\", \"vm_name\": \"testvm_recovery\", \"vm_id\": \"8dde4170-2777-407b-8f1f-f1c31b40d058\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"a5476e42-ff6e-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"9fb89374-47cf-49f2-9e26-62bd98dfca28\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 16:51:34'),(116,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"eee09d29-6811-4875-b7ac-51e9fb0d4d49\", \"vm_name\": \"testvm_recovery_recovery\", \"vm_id\": \"898c1e74-d6f6-4cf4-8019-16649e1f0507\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"a5476e42-ff6e-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"9fb89374-47cf-49f2-9e26-62bd98dfca28\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 17:02:00'),(117,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"eee09d29-6811-4875-b7ac-51e9fb0d4d49\", \"vm_name\": \"testvm_recovery_recovery\", \"vm_id\": \"898c1e74-d6f6-4cf4-8019-16649e1f0507\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"a5476e42-ff6e-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"9fb89374-47cf-49f2-9e26-62bd98dfca28\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-14 17:02:27'),(118,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"8160bfaf-77fc-4ccc-a9f8-5dc1ea2c27c7\", \"vm_name\": \"testvm_recovery_recovery_recovery\", \"vm_id\": \"0f8daf6b-d68a-4fae-a587-ea55208da38c\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"a5476e42-ff6e-11e8-997b-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"9fb89374-47cf-49f2-9e26-62bd98dfca28\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2018-12-21 13:49:48'),(119,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 8160bfaf-77fc-4ccc-a9f8-5dc1ea2c27c7 could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}]}','http://127.0.0.1:8787','2018-12-21 13:49:51'),(120,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"1bcb8eb0-1b62-469d-b8a5-62879c49788f\", \"vm_name\": \"test_server1\", \"vm_id\": \"a3ebc644-eff6-40df-9298-ac01e57c63e2\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"0414bf86-073c-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"f2b5b9ae-1eb2-4d52-be20-eb0f4a1b0c19\", \"ip_address\": \"192.168.49.4\"}]}}','http://127.0.0.1:8787','2018-12-24 18:24:11'),(121,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 1bcb8eb0-1b62-469d-b8a5-62879c49788f could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance a3ebc644-eff6-40df-9298-ac01e57c63e2 could not be found.\", \"code\": 404}}]}','http://127.0.0.1:8787','2018-12-24 18:24:12'),(122,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"21b984b4-0296-4c03-a4a7-4a834778492f\", \"vm_name\": \"testvm1\", \"vm_id\": \"6b0f35bc-5eb6-4c63-bdd4-99b5e3b8ab50\", \"floating_ip_address\": \"10.10.200.54\", \"service_id\": \"9c5d4e40-08ca-11e9-bdd6-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"8d05cffa-bb83-4265-8dbf-573f6de5fa03\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 15:23:17'),(123,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"fe970c86-8fb4-4a67-b86b-29483990e047\", \"vm_name\": \"testvm1_recovery\", \"vm_id\": \"5904728e-68a2-4e3a-bc71-23a1370d3dd1\", \"floating_ip_address\": \"10.10.200.55\", \"service_id\": \"9c5d4e40-08ca-11e9-bdd6-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"8d05cffa-bb83-4265-8dbf-573f6de5fa03\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 15:33:14'),(124,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"24ba3e81-afae-43f3-bba7-48dc43ee4083\", \"vm_name\": \"testvm1\", \"vm_id\": \"b19cd78d-c5fe-45f1-be53-ffa45e99b2c5\", \"floating_ip_address\": \"10.10.200.59\", \"service_id\": \"e4156a06-08d9-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"7ef459a4-20dc-4cd7-8099-0ca3456c795f\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 15:48:13'),(125,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"24ba3e81-afae-43f3-bba7-48dc43ee4083\", \"vm_name\": \"testvm1\", \"vm_id\": \"b19cd78d-c5fe-45f1-be53-ffa45e99b2c5\", \"floating_ip_address\": \"10.10.200.59\", \"service_id\": \"e4156a06-08d9-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"7ef459a4-20dc-4cd7-8099-0ca3456c795f\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 15:48:41'),(126,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"1a6625fb-a849-4d7c-9c14-d7d48b77664a\", \"vm_name\": \"testvm1_recovery[1]\", \"vm_id\": \"78100088-e034-4632-b03f-d72f50ecf9f3\", \"floating_ip_address\": \"10.10.200.59\", \"service_id\": \"e4156a06-08d9-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"7ef459a4-20dc-4cd7-8099-0ca3456c795f\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 15:50:44'),(127,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"message\": \"service update fail\", \"code\": 500, \"title\": \"update fail\"}]}','http://127.0.0.1:8787','2018-12-26 15:51:00'),(128,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"9ba5f6eb-a273-4fac-86af-ca9870b560ba\", \"vm_name\": \"testvm1\", \"vm_id\": \"0c9061ea-f96a-4f67-9460-eda945cc3006\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"e4156a06-08d9-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"7ef459a4-20dc-4cd7-8099-0ca3456c795f\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 15:58:01'),(129,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"9ba5f6eb-a273-4fac-86af-ca9870b560ba\", \"vm_name\": \"testvm1\", \"vm_id\": \"0c9061ea-f96a-4f67-9460-eda945cc3006\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"e4156a06-08d9-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"7ef459a4-20dc-4cd7-8099-0ca3456c795f\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 15:58:29'),(130,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"0231ea0f-9d4d-4c82-a52e-d5fee11bf37a\", \"vm_name\": \"testvm1_recovery[1]\", \"vm_id\": \"f0cdd987-f2a1-4282-8875-0eeaac7ebfe8\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"e4156a06-08d9-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"7ef459a4-20dc-4cd7-8099-0ca3456c795f\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 16:00:52'),(131,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"message\": \"service update fail\", \"code\": 500, \"title\": \"update fail\"}]}','http://127.0.0.1:8787','2018-12-26 16:01:09'),(132,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"d6a04af8-eefd-4a8e-b622-0fffd886d7e1\", \"vm_name\": \"testvm1\", \"vm_id\": \"422db7b9-e7e3-46f6-80c3-f64263fbd301\", \"floating_ip_address\": \"10.10.200.49\", \"service_id\": \"e6359952-08dc-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"1e8275cc-2053-43f3-be19-974fbfb8a429\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 16:09:20'),(133,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"d6a04af8-eefd-4a8e-b622-0fffd886d7e1\", \"vm_name\": \"testvm1\", \"vm_id\": \"422db7b9-e7e3-46f6-80c3-f64263fbd301\", \"floating_ip_address\": \"10.10.200.49\", \"service_id\": \"e6359952-08dc-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"1e8275cc-2053-43f3-be19-974fbfb8a429\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 16:09:48'),(134,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"cb4aa634-7bdd-491c-95e1-d96fb52e7ae2\", \"vm_name\": \"testvm1_recovery[1]\", \"vm_id\": \"2d2d8497-107b-4275-9e14-2d3e64622c95\", \"floating_ip_address\": \"10.10.200.54\", \"service_id\": \"fcc49f72-08de-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a8a360c8-9c4d-4bf1-8977-da5bdf7782d2\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 16:25:08'),(135,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"message\": \"service update fail\", \"code\": 500, \"title\": \"update fail\"}]}','http://127.0.0.1:8787','2018-12-26 16:25:25'),(136,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"49ab4333-077c-4acb-8df6-30bbe7fd65c5\", \"vm_name\": \"testvm_recovery[1]\", \"vm_id\": \"f96bbcdb-5ac6-4713-a8c7-9349503e35e9\", \"floating_ip_address\": \"10.10.200.59\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 17:12:34'),(137,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"message\": \"service update fail\", \"code\": 500, \"title\": \"update fail\"}]}','http://127.0.0.1:8787','2018-12-26 17:12:52'),(138,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"bfb7f547-d4cc-46d1-843c-4bcfca838e7a\", \"vm_name\": \"testvm1_recovery[2]\", \"vm_id\": \"a0a62061-bd28-4f68-87c2-9c88b0376294\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 17:22:10'),(139,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"bfb7f547-d4cc-46d1-843c-4bcfca838e7a\", \"vm_name\": \"testvm1_recovery[2]\", \"vm_id\": \"a0a62061-bd28-4f68-87c2-9c88b0376294\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 17:22:38'),(140,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"c18214ba-c56e-436b-aa03-49204224e6cf\", \"vm_name\": \"testvm1_recovery[3]\", \"vm_id\": \"d03347bf-ad80-425d-8a14-f0ddf14152c8\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 17:24:07'),(141,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"c18214ba-c56e-436b-aa03-49204224e6cf\", \"vm_name\": \"testvm1_recovery[3]\", \"vm_id\": \"d03347bf-ad80-425d-8a14-f0ddf14152c8\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2018-12-26 17:24:35'),(142,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"2d991983-8a23-46f6-ac71-5fb602caaebe\", \"vm_name\": \"testvm1_recovery[4]\", \"vm_id\": \"3462de02-0952-417e-9a6c-7cedd3d6a0d7\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-01-04 13:46:10'),(143,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"2d991983-8a23-46f6-ac71-5fb602caaebe\", \"vm_name\": \"testvm1_recovery[4]\", \"vm_id\": \"3462de02-0952-417e-9a6c-7cedd3d6a0d7\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-01-04 13:46:38'),(144,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"7f72cb16-755a-4f0b-b932-54dc6099937b\", \"vm_name\": \"testvm\", \"vm_id\": \"5b02fc63-6c93-4b24-a776-54ba022a2192\", \"floating_ip_address\": \"10.10.200.46\", \"service_id\": \"10d3b4a4-04dd-11e9-bdd6-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"e525ef4c-cb01-43fb-9716-453d93b89954\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2019-03-04 15:30:55'),(145,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"7f72cb16-755a-4f0b-b932-54dc6099937b\", \"vm_name\": \"testvm\", \"vm_id\": \"5b02fc63-6c93-4b24-a776-54ba022a2192\", \"floating_ip_address\": \"10.10.200.46\", \"service_id\": \"10d3b4a4-04dd-11e9-bdd6-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"e525ef4c-cb01-43fb-9716-453d93b89954\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2019-03-04 15:32:28'),(146,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"7f72cb16-755a-4f0b-b932-54dc6099937b\", \"vm_name\": \"testvm\", \"vm_id\": \"5b02fc63-6c93-4b24-a776-54ba022a2192\", \"floating_ip_address\": \"10.10.200.46\", \"service_id\": \"10d3b4a4-04dd-11e9-bdd6-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"e525ef4c-cb01-43fb-9716-453d93b89954\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2019-03-04 15:32:28'),(147,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 7f72cb16-755a-4f0b-b932-54dc6099937b could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance 5b02fc63-6c93-4b24-a776-54ba022a2192 could not be found.\", \"code\": 404}}]}','http://127.0.0.1:8787','2019-03-04 15:32:29'),(148,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"7f72cb16-755a-4f0b-b932-54dc6099937b\", \"vm_name\": \"testvm\", \"vm_id\": \"5b02fc63-6c93-4b24-a776-54ba022a2192\", \"floating_ip_address\": \"10.10.200.46\", \"service_id\": \"10d3b4a4-04dd-11e9-bdd6-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"e525ef4c-cb01-43fb-9716-453d93b89954\", \"ip_address\": \"192.168.48.3\"}]}}','http://127.0.0.1:8787','2019-03-04 15:32:35'),(149,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 7f72cb16-755a-4f0b-b932-54dc6099937b could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance 5b02fc63-6c93-4b24-a776-54ba022a2192 could not be found.\", \"code\": 404}}]}','http://127.0.0.1:8787','2019-03-04 15:32:37'),(150,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"2d991983-8a23-46f6-ac71-5fb602caaebe\", \"vm_name\": \"testvm1_recovery[4]\", \"vm_id\": \"3462de02-0952-417e-9a6c-7cedd3d6a0d7\", \"floating_ip_address\": \"10.10.200.60\", \"service_id\": \"7d55b896-08e5-11e9-a812-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"a326246c-5b15-421f-b7b8-dd1dd4fbe0ab\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-04-24 09:12:14'),(151,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 2d991983-8a23-46f6-ac71-5fb602caaebe could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance 3462de02-0952-417e-9a6c-7cedd3d6a0d7 could not be found.\", \"code\": 404}}]}','http://127.0.0.1:8787','2019-04-24 09:12:16'),(152,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"df4fb9ec-f8f8-4a05-afef-31feadae6778\", \"vm_name\": \"testvm\", \"vm_id\": \"3b0eb978-2ace-4e31-aed1-bbb8eb5d1aae\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-04-24 09:16:14'),(153,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"df4fb9ec-f8f8-4a05-afef-31feadae6778\", \"vm_name\": \"testvm\", \"vm_id\": \"3b0eb978-2ace-4e31-aed1-bbb8eb5d1aae\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-04-24 09:16:51'),(154,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"44954aea-23c7-4dec-9113-470f01f43175\", \"vm_name\": \"testvm_recovery[1]\", \"vm_id\": \"554d1b7a-e544-4c42-8147-686f0282a736\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-04-29 17:39:35'),(155,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"44954aea-23c7-4dec-9113-470f01f43175\", \"vm_name\": \"testvm_recovery[1]\", \"vm_id\": \"554d1b7a-e544-4c42-8147-686f0282a736\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-04-29 17:40:11'),(156,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"6b55ae38-66fc-4619-b943-6763a223670e\", \"vm_name\": \"testvm_recovery[2]\", \"vm_id\": \"2cddd104-8d42-444a-b974-6a0120b5e18c\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-05-23 10:39:20'),(157,'Unavailable by ICMP ping: PROBLEM','[{\"message\": \"HTTPConnectionPool(host=\'10.10.200.15\', port=35357): Max retries exceeded with url: /v3/auth/tokens (Caused by NewConnectionError(\'<urllib3.connection.HTTPConnection object at 0xb5e5282c>: Failed to establish a new connection: [Errno 113] No route to host\',))\", \"code\": 401, \"title\": \"Unauthorized\"}]','http://127.0.0.1:8787','2019-05-23 10:39:27'),(158,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"6b55ae38-66fc-4619-b943-6763a223670e\", \"vm_name\": \"testvm_recovery[2]\", \"vm_id\": \"2cddd104-8d42-444a-b974-6a0120b5e18c\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-05-23 12:28:00'),(159,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"recovery\": true, \"server\": {\"floating_ip_id\": \"6b55ae38-66fc-4619-b943-6763a223670e\", \"vm_name\": \"testvm_recovery[2]\", \"vm_id\": \"2cddd104-8d42-444a-b974-6a0120b5e18c\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-05-23 12:29:36'),(160,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"6b55ae38-66fc-4619-b943-6763a223670e\", \"vm_name\": \"testvm_recovery[2]\", \"vm_id\": \"2cddd104-8d42-444a-b974-6a0120b5e18c\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-05-23 12:29:36'),(161,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 6b55ae38-66fc-4619-b943-6763a223670e could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance 2cddd104-8d42-444a-b974-6a0120b5e18c could not be found.\", \"code\": 404}}]}','http://127.0.0.1:8787','2019-05-23 12:29:38'),(162,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"6b55ae38-66fc-4619-b943-6763a223670e\", \"vm_name\": \"testvm_recovery[2]\", \"vm_id\": \"2cddd104-8d42-444a-b974-6a0120b5e18c\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-05-23 12:29:38'),(163,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 6b55ae38-66fc-4619-b943-6763a223670e could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance 2cddd104-8d42-444a-b974-6a0120b5e18c could not be found.\", \"code\": 404}}]}','http://127.0.0.1:8787','2019-05-23 12:29:40'),(164,'Unavailable by ICMP ping: PROBLEM','{\"project_name\": \"SOAC-Dev\", \"auth_url\": \"http://10.10.200.15:35357/v3\", \"server\": {\"floating_ip_id\": \"6b55ae38-66fc-4619-b943-6763a223670e\", \"vm_name\": \"testvm_recovery[2]\", \"vm_id\": \"2cddd104-8d42-444a-b974-6a0120b5e18c\", \"floating_ip_address\": \"10.10.200.44\", \"service_id\": \"45f74f42-2382-11e9-83d5-288023a6d735\", \"fixed_ips\": [{\"subnet_id\": \"6e07f4d0-392a-41d5-9cd3-0aa40e5bf437\", \"ip_address\": \"192.168.50.3\"}]}}','http://127.0.0.1:8787','2019-05-23 12:29:40'),(165,'Unavailable by ICMP ping: PROBLEM','{\"err_msg_list\": [{\"NeutronError\": {\"message\": \"Floating IP 6b55ae38-66fc-4619-b943-6763a223670e could not be found\", \"type\": \"FloatingIPNotFound\", \"detail\": \"\"}}, {\"itemNotFound\": {\"message\": \"Instance 2cddd104-8d42-444a-b974-6a0120b5e18c could not be found.\", \"code\": 404}}]}','http://127.0.0.1:8787','2019-05-23 12:29:42');
/*!40000 ALTER TABLE `tb_zabbix_alarms` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`soacgui`@`localhost`*/ /*!50003 TRIGGER tb_zabbix_alarms_DateTime_DEFAULT
BEFORE INSERT
    ON tb_zabbix_alarms FOR EACH ROW
BEGIN
    SET NEW.INS_DATE = NOW();
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-06-19 11:17:07