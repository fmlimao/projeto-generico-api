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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET @tenantId1 = uuid();
SET @tenantId2 = uuid();
SET @tenantId3 = uuid();
SET @tenantId4 = uuid();

INSERT INTO tenants (tenant_id, name) VALUES (@tenantId1, 'Renan & Leandro Monitoramento');
INSERT INTO tenants (tenant_id, name) VALUES (@tenantId2, 'GPS Monitoramento');
INSERT INTO tenants (tenant_id, name) VALUES (@tenantId3, 'Osasco Monitoramento');
INSERT INTO tenants (tenant_id, name) VALUES (@tenantId4, 'Guarulhos Monitoramento');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 1');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 2');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 3');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 4');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 5');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 6');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 7');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 8');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 9');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 10');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 11');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 12');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 13');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 14');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 15');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 16');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 17');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 18');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 19');
INSERT INTO tenants (tenant_id, name) VALUES (uuid(), 'Loja 20');



DROP TABLE IF EXISTS people;
CREATE TABLE `people` (
  `person_id` varchar(36) NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `birth_date` date NULL,
  `cpf_cnpj` varchar(45) NULL,
  `rg_ie` varchar(45) NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `people_person_id_uindex` (`person_id`),
  KEY `people_tenants_tenant_id_fk` (`tenant_id`),
  CONSTRAINT `people_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET @personId1 = uuid();
SET @personId2 = uuid();

INSERT INTO people (person_id, tenant_id, name, birth_date) VALUES (@personId1, @tenantId1, 'Leandro Macedo', '1989-03-02');
INSERT INTO people (person_id, tenant_id, name, birth_date) VALUES (@personId2, @tenantId2, 'Renan Silva', '1989-03-02');



DROP TABLE IF EXISTS person_emails;
CREATE TABLE `person_emails` (
  `person_email_id` varchar(36) NOT NULL,
  `person_id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `person_emails_email_id_uindex` (`person_email_id`),
  KEY `person_emails_people_person_id_fk` (`person_id`),
  CONSTRAINT `person_emails_people_person_id_fk` FOREIGN KEY (`person_id`) REFERENCES `people` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET @emailId1 = uuid();
SET @emailId2 = uuid();

INSERT INTO person_emails (person_email_id, person_id, email) VALUES (@emailId1, @personId1, 'leandro@email.com');
INSERT INTO person_emails (person_email_id, person_id, email) VALUES (@emailId2, @personId2, 'renan@email.com');



DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL,
  `person_id` varchar(36) NOT NULL,
  `person_email_id` varchar(36) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  UNIQUE KEY `users_user_id_uindex` (`user_id`),
  KEY `users_people_person_id_fk` (`person_id`),
  KEY `users_person_emails_person_email_id_fk` (`person_email_id`),
  CONSTRAINT `users_people_person_id_fk` FOREIGN KEY (`person_id`) REFERENCES `people` (`person_id`),
  CONSTRAINT `users_person_emails_person_email_id_fk` FOREIGN KEY (`person_email_id`) REFERENCES `person_emails` (`person_email_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET @userId1 = uuid();
SET @userId2 = uuid();

INSERT INTO users (user_id, person_id, person_email_id, password) VALUES (@userId1, @personId1, @emailId1, '123456');
INSERT INTO users (user_id, person_id, person_email_id, password) VALUES (@userId2, @personId2, @emailId2, '123456');



DROP TABLE IF EXISTS tenants_users;
CREATE TABLE `tenants_users` (
  `tenant_user_id` varchar(36) NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`tenant_user_id`),
  KEY `tenants_users_tenants_tenant_id_fk` (`tenant_id`),
  KEY `tenants_users_users_user_id_fk` (`user_id`),
  CONSTRAINT `tenants_users_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`),
  CONSTRAINT `tenants_users_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO tenants_users (tenant_user_id, tenant_id, user_id) VALUES (uuid(), @tenantId1, @userId1);
INSERT INTO tenants_users (tenant_user_id, tenant_id, user_id) VALUES (uuid(), @tenantId1, @userId2);



SET foreign_key_checks = 1;


SELECT
    u.user_id AS userId,
    p.person_id AS personId,
    p.name,
    pe.email,
    u.active,
    u.created_at,
    u.altered_at
FROM tenants t
INNER JOIN tenants_users tu ON (t.tenant_id = tu.tenant_id AND tu.deleted_at IS NULL)
INNER JOIN users u ON (tu.user_id = u.user_id AND u.deleted_at IS NULL)
INNER JOIN people p ON (u.person_id = p.person_id AND p.deleted_at IS NULL)
INNER JOIN person_emails pe ON (p.person_id = pe.person_id AND u.person_email_id = pe.person_email_id AND pe.deleted_at IS NULL)
WHERE t.deleted_at IS NULL;


# SELECT
# u.user_id AS userId,
# p.person_id AS personId,
# p.name AS personName,
# u.email AS userEmail,
# u.active AS userActive,
# u.created_at AS userCreatedAt,
# u.altered_at AS userAlteredAt
# FROM tenants t
# INNER JOIN tenants_users tu ON (t.tenant_id = tu.tenant_id AND tu.deleted_at IS NULL)
# INNER JOIN users u ON (tu.user_id = u.user_id AND u.deleted_at IS NULL)
# INNER JOIN people p ON (u.person_id = p.person_id AND p.deleted_at IS NULL)
# WHERE t.deleted_at IS NULL
# AND t.tenant_id = 'a59d250f-b827-11ec-b8e7-0242acf00102'
#
# ORDER BY p.name ASC
#
#
# SELECT uuid()