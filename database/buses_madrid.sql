-- ============================================================
--  BUSES MADRID — Base de Datos Portal Ético y Corporativo
--  Motor : MySQL 8.0
--  Hosting: cPanel / phpMyAdmin
--  Charset: utf8mb4 / utf8mb4_unicode_ci
--  Prefijo de tablas: bm_
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ============================================================
-- 1. TABLA: bm_usuarios
--    Usuarios administradores del portal (admin, analista, observador)
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_usuarios` (
  `id`                  INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `nombre`              VARCHAR(100)   NOT NULL,
  `email`               VARCHAR(150)   NOT NULL,
  `password_hash`       VARCHAR(255)   NOT NULL                  COMMENT 'bcrypt hash',
  `rol`                 ENUM('administrador','analista','observador') NOT NULL DEFAULT 'observador',
  `estado`              ENUM('activo','inactivo','suspendido')   NOT NULL DEFAULT 'activo',
  `ultimo_acceso`       DATETIME                                 DEFAULT NULL,
  `token_reset`         VARCHAR(100)                             DEFAULT NULL,
  `token_reset_expira`  DATETIME                                 DEFAULT NULL,
  `creado_en`           TIMESTAMP      NOT NULL                  DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`      TIMESTAMP      NOT NULL                  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. TABLA: bm_denuncias
--    Registro principal del canal de denuncias éticas
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_denuncias` (
  `id`                      INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `codigo`                  VARCHAR(20)    NOT NULL                  COMMENT 'Código público: BM-NNNN',
  `tipo`                    ENUM(
                              'infraccion_ley_20393',
                              'acoso_laboral',
                              'acoso_sexual',
                              'discriminacion',
                              'robo_hurto_fraude',
                              'conflicto_interes',
                              'negligencia',
                              'otro'
                            ) NOT NULL,
  `descripcion`             TEXT           NOT NULL,
  `es_anonima`              TINYINT(1)     NOT NULL DEFAULT 1,
  `denunciante_nombre`      VARCHAR(100)            DEFAULT NULL,
  `denunciante_email`       VARCHAR(150)            DEFAULT NULL,
  `denunciante_telefono`    VARCHAR(30)             DEFAULT NULL,
  `denunciante_relacion`    VARCHAR(100)            DEFAULT NULL     COMMENT 'trabajador, proveedor, cliente, otro',
  `personas_involucradas`   TEXT                    DEFAULT NULL,
  `area_involucrada`        VARCHAR(150)            DEFAULT NULL,
  `evidencia_descripcion`   TEXT                    DEFAULT NULL,
  `estado`                  ENUM('nueva','en_revision','cerrada','archivada') NOT NULL DEFAULT 'nueva',
  `prioridad`               ENUM('alta','media','baja') NOT NULL DEFAULT 'media',
  `analista_id`             INT UNSIGNED            DEFAULT NULL,
  `resolucion`              TEXT                    DEFAULT NULL     COMMENT 'Conclusión o resolución final',
  `fecha_cierre`            DATETIME                DEFAULT NULL,
  `ip_origen`               VARCHAR(45)             DEFAULT NULL,
  `creado_en`               TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo` (`codigo`),
  KEY `idx_estado`    (`estado`),
  KEY `idx_prioridad` (`prioridad`),
  KEY `idx_analista`  (`analista_id`),
  KEY `idx_creado`    (`creado_en`),
  CONSTRAINT `fk_denuncia_analista`
    FOREIGN KEY (`analista_id`) REFERENCES `bm_usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TABLA: bm_denuncias_archivos
--    Archivos adjuntos cargados junto con la denuncia
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_denuncias_archivos` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `denuncia_id`       INT UNSIGNED  NOT NULL,
  `nombre_original`   VARCHAR(255)  NOT NULL,
  `nombre_almacenado` VARCHAR(255)  NOT NULL,
  `ruta`              VARCHAR(500)  NOT NULL,
  `mime_type`         VARCHAR(100)  NOT NULL,
  `tamanio_bytes`     INT UNSIGNED  NOT NULL,
  `creado_en`         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_arch_denuncia` (`denuncia_id`),
  CONSTRAINT `fk_archivo_denuncia`
    FOREIGN KEY (`denuncia_id`) REFERENCES `bm_denuncias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. TABLA: bm_denuncias_seguimiento
--    Historial de cambios de estado y notas internas
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_denuncias_seguimiento` (
  `id`                      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `denuncia_id`             INT UNSIGNED  NOT NULL,
  `usuario_id`              INT UNSIGNED           DEFAULT NULL,
  `estado_anterior`         VARCHAR(50)            DEFAULT NULL,
  `estado_nuevo`            VARCHAR(50)            DEFAULT NULL,
  `nota`                    TEXT                   DEFAULT NULL,
  `es_visible_denunciante`  TINYINT(1)    NOT NULL DEFAULT 0  COMMENT '1 = visible en portal seguimiento',
  `creado_en`               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_seg_denuncia` (`denuncia_id`),
  KEY `idx_seg_usuario`  (`usuario_id`),
  CONSTRAINT `fk_seg_denuncia`
    FOREIGN KEY (`denuncia_id`) REFERENCES `bm_denuncias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seg_usuario`
    FOREIGN KEY (`usuario_id`)  REFERENCES `bm_usuarios`  (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TABLA: bm_denuncias_acceso
--    Credenciales de seguimiento para denunciantes anónimos
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_denuncias_acceso` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `denuncia_id`   INT UNSIGNED  NOT NULL,
  `codigo_acceso` VARCHAR(20)   NOT NULL  COMMENT 'Código BM-NNNN entregado al denunciante',
  `password_hash` VARCHAR(255)  NOT NULL  COMMENT 'Hash de contraseña generada al enviar',
  `ultimo_acceso` DATETIME               DEFAULT NULL,
  `creado_en`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo_acceso` (`codigo_acceso`),
  UNIQUE KEY `uq_acceso_denuncia` (`denuncia_id`),
  CONSTRAINT `fk_acceso_denuncia`
    FOREIGN KEY (`denuncia_id`) REFERENCES `bm_denuncias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. TABLA: bm_postulaciones
--    Formulario de postulación laboral (Trabaja con Nosotros)
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_postulaciones` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `nombres`           VARCHAR(100)  NOT NULL,
  `apellidos`         VARCHAR(100)  NOT NULL,
  `rut`               VARCHAR(12)   NOT NULL,
  `email`             VARCHAR(150)  NOT NULL,
  `telefono`          VARCHAR(20)   NOT NULL,
  `region`            VARCHAR(100)  NOT NULL,
  `comuna`            VARCHAR(100)  NOT NULL,
  `cargo_postulado`   VARCHAR(100)  NOT NULL,
  `nivel_experiencia` VARCHAR(50)   NOT NULL,
  `licencia_conducir` VARCHAR(50)            DEFAULT NULL,
  `disponibilidad`    VARCHAR(50)   NOT NULL,
  `mensaje`           TEXT                   DEFAULT NULL,
  `estado`            ENUM('nueva','en_revision','aceptada','descartada') NOT NULL DEFAULT 'nueva',
  `notas_internas`    TEXT                   DEFAULT NULL,
  `ip_origen`         VARCHAR(45)            DEFAULT NULL,
  `creado_en`         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_estado_post`  (`estado`),
  KEY `idx_cargo`        (`cargo_postulado`),
  KEY `idx_creado_post`  (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TABLA: bm_postulaciones_archivos
--    Documentos adjuntos a postulaciones (CV, licencia, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_postulaciones_archivos` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `postulacion_id`    INT UNSIGNED  NOT NULL,
  `tipo`              ENUM('curriculum','licencia','certificado','otro') NOT NULL DEFAULT 'otro',
  `nombre_original`   VARCHAR(255)  NOT NULL,
  `nombre_almacenado` VARCHAR(255)  NOT NULL,
  `ruta`              VARCHAR(500)  NOT NULL,
  `mime_type`         VARCHAR(100)  NOT NULL,
  `tamanio_bytes`     INT UNSIGNED  NOT NULL,
  `creado_en`         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_arch_postulacion` (`postulacion_id`),
  CONSTRAINT `fk_arch_postulacion`
    FOREIGN KEY (`postulacion_id`) REFERENCES `bm_postulaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. TABLA: bm_contacto_mensajes
--    Formulario de contacto general del sitio web
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_contacto_mensajes` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(100)  NOT NULL,
  `email`       VARCHAR(150)  NOT NULL,
  `telefono`    VARCHAR(30)            DEFAULT NULL,
  `empresa`     VARCHAR(150)           DEFAULT NULL,
  `asunto`      VARCHAR(200)           DEFAULT NULL,
  `mensaje`     TEXT          NOT NULL,
  `leido`       TINYINT(1)    NOT NULL DEFAULT 0,
  `respondido`  TINYINT(1)    NOT NULL DEFAULT 0,
  `ip_origen`   VARCHAR(45)            DEFAULT NULL,
  `creado_en`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leido`          (`leido`),
  KEY `idx_creado_contact` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. TABLA: bm_logs_auditoria
--    Registro de acciones de administradores en el sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_logs_auditoria` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `usuario_id`  INT UNSIGNED           DEFAULT NULL,
  `accion`      VARCHAR(100)  NOT NULL  COMMENT 'LOGIN, CAMBIO_ESTADO, ASIGNAR_ANALISTA, etc.',
  `entidad`     VARCHAR(50)            DEFAULT NULL  COMMENT 'denuncia, usuario, postulacion',
  `entidad_id`  INT UNSIGNED           DEFAULT NULL,
  `detalles`    JSON                   DEFAULT NULL  COMMENT 'Payload adicional de la acción',
  `ip`          VARCHAR(45)            DEFAULT NULL,
  `user_agent`  VARCHAR(500)           DEFAULT NULL,
  `creado_en`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_usuario` (`usuario_id`),
  KEY `idx_log_accion`  (`accion`),
  KEY `idx_log_creado`  (`creado_en`),
  CONSTRAINT `fk_log_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `bm_usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. TABLA: bm_configuracion
--     Parámetros del sistema en clave-valor
-- ============================================================
CREATE TABLE IF NOT EXISTS `bm_configuracion` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `clave`         VARCHAR(100)  NOT NULL,
  `valor`         TEXT          NOT NULL,
  `descripcion`   VARCHAR(255)           DEFAULT NULL,
  `actualizado_en` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Usuario administrador por defecto
-- IMPORTANTE: cambiar la contraseña antes de poner en producción.
-- El campo password_hash se genera con bcrypt (cost 12).
-- Contraseña de ejemplo: Admin123! → reemplazar el hash con el real.
INSERT INTO `bm_usuarios` (`nombre`, `email`, `password_hash`, `rol`, `estado`) VALUES
('Admin Principal', 'admin@busesmadrid.cl', '$2b$12$REEMPLAZAR_CON_HASH_REAL', 'administrador', 'activo');

-- Configuración por defecto del sistema
INSERT INTO `bm_configuracion` (`clave`, `valor`, `descripcion`) VALUES
('email_notificaciones',  'admin@busesmadrid.cl', 'Email principal para alertas del sistema'),
('email_respaldo',        '',                     'Email de copia (CC) para notificaciones'),
('notif_nueva_denuncia',  '1',                    'Notificar por email al ingresar nueva denuncia (0=no, 1=sí)'),
('notif_prioridad_alta',  '1',                    'Notificación inmediata para denuncias de prioridad alta'),
('notif_resumen_diario',  '0',                    'Enviar resumen diario de actividad'),
('prefijo_codigo',        'BM',                   'Prefijo para códigos de denuncia'),
('contador_codigo',       '4912',                 'Contador actual para generación de códigos BM-NNNN'),
('sitio_nombre',          'Buses Madrid — Portal Ético', 'Nombre del sistema'),
('sitio_version',         '2.0.1',               'Versión del portal');

-- ============================================================
-- NOTAS DE IMPLEMENTACIÓN EN CPANEL
-- ============================================================
-- 1. En cPanel → MySQL Databases: crear base de datos y usuario
--    - Base de datos : busesmadrid_etica  (o el nombre asignado)
--    - Usuario       : busesmadrid_admin
--    - Contraseña    : (generar contraseña segura)
--    - Privilegios   : ALL PRIVILEGES sobre la base de datos
--
-- 2. Importar este archivo desde phpMyAdmin → pestaña "Importar".
--
-- 3. Generar el password_hash del admin con bcrypt (cost 12)
--    antes de usar en producción. En Node.js:
--      const bcrypt = require('bcrypt');
--      const hash = await bcrypt.hash('TuContraseñaSegura', 12);
--    Luego actualizar:
--      UPDATE bm_usuarios SET password_hash = '<hash>' WHERE email = 'admin@busesmadrid.cl';
--
-- 4. Configurar las variables de entorno en el backend:
--    DB_HOST=localhost
--    DB_PORT=3306
--    DB_NAME=busesmadrid_etica
--    DB_USER=busesmadrid_admin
--    DB_PASSWORD=<contraseña>
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
