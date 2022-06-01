# CREATE DATABASE IF NOT EXISTS generico;


USE generico;



SET foreign_key_checks = 0;



DROP TABLE IF EXISTS tenants;
CREATE TABLE `tenants` (
  `tenant_id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `tenants_tenant_id_uindex` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

SET @tenantId1 = uuid();
SET @tenantId2 = uuid();
SET @tenantId3 = uuid();
SET @tenantId4 = uuid();

INSERT INTO tenants (tenant_id, name) VALUES (@tenantId1, 'Renan & Leandro Monitoramento');
INSERT INTO tenants (tenant_id, name) VALUES (@tenantId2, 'GPS Monitoramento');
INSERT INTO tenants (tenant_id, name) VALUES (@tenantId3, 'Osasco Monitoramento');
INSERT INTO tenants (tenant_id, name) VALUES (@tenantId4, 'Guarulhos Monitoramento');



DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `cpf` varchar(45) NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `users_user_id_uindex` (`user_id`),
  KEY `users_tenants_tenant_id_fk` (`tenant_id`),
  CONSTRAINT `users_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

SET @userId1 = uuid();
SET @userId2 = uuid();

INSERT INTO users (user_id, tenant_id, name, cpf, email, password) VALUES (@userId1, @tenantId1, 'Leandro', '11111111111', 'leandro@email.com', '$2b$10$cbz7wEm6WWARQBk4jiN.ZejBlrOH9F3dDWfLChSBBR4kta8Kh9B6u');
INSERT INTO users (user_id, tenant_id, name, cpf, email, password) VALUES (@userId2, @tenantId1, 'Renan', '22222222222', 'renan@email.com', '$2b$10$cbz7wEm6WWARQBk4jiN.ZejBlrOH9F3dDWfLChSBBR4kta8Kh9B6u');



DROP TABLE IF EXISTS clients;
CREATE TABLE `clients` (
  `client_id` varchar(36) NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `cpf_cnpj` varchar(45) NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `clients_client_id_uindex` (`client_id`),
  KEY `clients_tenants_tenant_id_fk` (`tenant_id`),
  CONSTRAINT `clients_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

SET @clientId1 = uuid();
SET @clientId2 = uuid();

INSERT INTO clients (client_id, tenant_id, name) VALUES (@clientId1, @tenantId1, 'Cliente 1');
INSERT INTO clients (client_id, tenant_id, name) VALUES (@clientId2, @tenantId1, 'Cliente 2');



DROP TABLE IF EXISTS areas;
CREATE TABLE `areas` (
  `area_id` varchar(36) NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `areas_area_id_uindex` (`area_id`),
  KEY `areas_tenants_tenant_id_fk` (`tenant_id`),
  CONSTRAINT `areas_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

SET @areaId1 = uuid();

INSERT INTO areas (area_id, tenant_id, name) VALUES (@areaId1, @tenantId1, 'Área 1');



DROP TABLE IF EXISTS subareas;
CREATE TABLE `subareas` (
  `subarea_id` varchar(36) NOT NULL,
  `area_id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `subareas_subarea_id_uindex` (`subarea_id`),
  KEY `subareas_areas_area_id_fk` (`area_id`),
  CONSTRAINT `subareas_areas_area_id_fk` FOREIGN KEY (`area_id`) REFERENCES `areas` (`area_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

SET @subareaId1 = uuid();

INSERT INTO subareas (subarea_id, area_id, name) VALUES (@subareaId1, @areaId1, 'Subárea 1.1');



DROP TABLE IF EXISTS reasons;
CREATE TABLE `reasons` (
  `reason_id` varchar(36) NOT NULL,
  `subarea_id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `reasons_reason_id_uindex` (`reason_id`),
  KEY `reasons_subareas_subarea_id_fk` (`subarea_id`),
  CONSTRAINT `reasons_subareas_subarea_id_fk` FOREIGN KEY (`subarea_id`) REFERENCES `subareas` (`subarea_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

SET @reasonId1 = uuid();

INSERT INTO reasons (reason_id, subarea_id, name) VALUES (@reasonId1, @areaId1, 'Motivo 1.1.1');



DROP TABLE IF EXISTS user_allocations;
CREATE TABLE `user_allocations` (
  `user_allocation_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `area_id` varchar(36) NOT NULL,
  `subarea_id` varchar(36) NOT NULL,
  `reason_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `user_allocations_user_allocation_id_uindex` (`user_allocation_id`),
  KEY `user_allocations_users_user_id_fk` (`user_id`),
  KEY `user_allocations_areas_area_id_fk` (`area_id`),
  KEY `user_allocations_subareas_subarea_id_fk` (`subarea_id`),
  KEY `user_allocations_reasons_reason_id_fk` (`reason_id`),
  CONSTRAINT `user_allocations_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_allocations_areas_area_id_fk` FOREIGN KEY (`area_id`) REFERENCES `areas` (`area_id`),
  CONSTRAINT `user_allocations_subareas_subarea_id_fk` FOREIGN KEY (`subarea_id`) REFERENCES `subareas` (`subarea_id`),
  CONSTRAINT `user_allocations_reasons_reason_id_fk` FOREIGN KEY (`reason_id`) REFERENCES `reasons` (`reason_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;



DROP TABLE IF EXISTS tickets;
CREATE TABLE `tickets` (
  `ticket_id` varchar(36) NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `area_id` varchar(36) NOT NULL,
  `subarea_id` varchar(36) NOT NULL,
  `reason_id` varchar(36) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `status` enum('open','in-progress','waiting','closed') DEFAULT 'open',
  `opened_by_user_id` varchar(255) DEFAULT NULL,
  `opened_by_client_id` varchar(255) DEFAULT NULL,
  `responsible_user_id` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `tickets_ticket_id_uindex` (`ticket_id`),
  KEY `tickets_tenants_tenant_id_fk` (`tenant_id`),
  KEY `tickets_areas_area_id_fk` (`area_id`),
  KEY `tickets_subareas_subarea_id_fk` (`subarea_id`),
  KEY `tickets_reasons_reason_id_fk` (`reason_id`),
  KEY `tickets_users_opened_by_user_id_fk` (`opened_by_user_id`),
  KEY `tickets_clients_opened_by_client_id_fk` (`opened_by_client_id`),
  KEY `tickets_users_responsible_user_id_fk` (`responsible_user_id`),
  KEY `tickets_status_index` (`status`),
  CONSTRAINT `tickets_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`),
  CONSTRAINT `tickets_areas_area_id_fk` FOREIGN KEY (`area_id`) REFERENCES `areas` (`area_id`),
  CONSTRAINT `tickets_subareas_subarea_id_fk` FOREIGN KEY (`subarea_id`) REFERENCES `subareas` (`subarea_id`),
  CONSTRAINT `tickets_reasons_reason_id_fk` FOREIGN KEY (`reason_id`) REFERENCES `reasons` (`reason_id`),
  CONSTRAINT `tickets_users_opened_by_user_id_fk` FOREIGN KEY (`opened_by_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `tickets_clients_opened_by_client_id_fk` FOREIGN KEY (`opened_by_client_id`) REFERENCES `clients` (`client_id`),
  CONSTRAINT `tickets_users_responsible_user_id_fk` FOREIGN KEY (`responsible_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;



SET foreign_key_checks = 1;


