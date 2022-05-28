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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET @userId1 = uuid();
SET @userId2 = uuid();

INSERT INTO users (user_id, tenant_id, name, email, password) VALUES (@userId1, @tenantId1, 'Leandro', 'leandro@email.com', '123456');
INSERT INTO users (user_id, tenant_id, name, email, password) VALUES (@userId2, @tenantId1, 'Renan', 'renan@email.com', '123456');



SET foreign_key_checks = 1;


SELECT
    u.user_id AS userId,
    u.name,
    u.email,
    u.cpf,
    u.active,
    u.created_at,
    u.altered_at
FROM tenants t
INNER JOIN users u ON (t.tenant_id = u.tenant_id AND u.deleted_at IS NULL)
WHERE t.deleted_at IS NULL;


SELECT
    p.person_id AS 'person.id',
    p.name AS 'person.name',
    p.birth_date AS 'person.birthDate',
    p.cpf_cnpj AS 'person.cpfCnpj',
    p.rg_ie AS 'person.rgIe',
    p.active AS 'person.active',
    p.created_at AS 'person.createdAt',
    p.altered_at AS 'person.alteredAt'
FROM tenants t
INNER JOIN people p ON (t.tenant_id = p.tenant_id AND p.deleted_at IS NULL)
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