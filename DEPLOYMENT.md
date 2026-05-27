# 🚀 Guía de Despliegue en Vercel

Esta guía detalla paso a paso cómo desplegar Buses Madrid en Vercel con el dominio apuntando desde cPanel.

## 📋 Pre-requisitos

- [ ] Código subido a GitHub
- [ ] Cuenta en Vercel (gratis)
- [ ] Acceso al cPanel del dominio
- [ ] Base de datos MySQL accesible remotamente
- [ ] Cuenta SMTP configurada en cPanel

---

## Parte 1: Preparar Base de Datos para Acceso Remoto

### En cPanel → "Remote MySQL"

1. Agregar IPs de Vercel (o usar wildcard temporal):
   ```
   %.vercel-ip.app
   ```

2. O mejor: Obtener las IPs específicas de Vercel después del primer deploy y agregarlas.

### Verificar credenciales MySQL

Anota estos datos (los necesitarás en Vercel):
```
DB_HOST=tu_servidor.mysql.com
DB_PORT=3306
DB_NAME=busesmad_paginaweb
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

---

## Parte 2: Desplegar en Vercel

### 1. Crear cuenta en Vercel

Ve a [vercel.com](https://vercel.com) y crea una cuenta (usa GitHub para login).

### 2. Importar proyecto

1. Click en **"Add New Project"**
2. Conecta con GitHub
3. Selecciona el repositorio: `VhicntJ/Buses-Madrid-V2`
4. Click en **"Import"**

### 3. Configurar proyecto

**Framework Preset:** Next.js (detectado automáticamente)
**Root Directory:** `./` (dejar por defecto)
**Build Command:** `npm run build` (dejar por defecto)

### 4. Agregar Variables de Entorno

En la sección **"Environment Variables"**, agrega todas estas (una por una):

#### Base de Datos
```env
DB_HOST=tu_servidor.mysql.com
DB_PORT=3306
DB_NAME=busesmad_paginaweb
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
```

#### Correo SMTP (cPanel)
```env
SMTP_HOST=mail.busesmadrid.cl
SMTP_PORT=465
SMTP_SECURE=true
SMTP_REQUIRE_TLS=false
SMTP_USER=noreply@busesmadrid.cl
SMTP_PASSWORD=password_de_correo_cpanel
EMAIL_FROM=noreply@busesmadrid.cl
EMAIL_CONTACT_TO=info@busesmadrid.cl
EMAIL_JOBS_TO=rrhh@busesmadrid.cl
```

#### reCAPTCHA
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key_de_google
RECAPTCHA_SECRET_KEY=tu_secret_key_de_google
RECAPTCHA_MIN_SCORE=0.5
```

#### Seguridad
```env
JWT_SECRET=genera_uno_nuevo_con_el_comando_de_abajo
ALLOWED_ORIGINS=https://busesmadrid.cl,https://www.busesmadrid.cl
RATE_LIMIT_REQUESTS=5
RATE_LIMIT_WINDOW=900
```

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Entorno
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://busesmadrid.cl
NEXT_PUBLIC_APP_URL=https://busesmadrid.cl
```

### 5. Deploy

Click en **"Deploy"** y espera (2-5 minutos).

Vercel te dará una URL temporal: `buses-madrid-v2.vercel.app`

---

## Parte 3: Configurar Dominio Personalizado

### 1. En Vercel Dashboard

1. Ve a tu proyecto desplegado
2. Click en **"Settings"** → **"Domains"**
3. Agregar dominio: `busesmadrid.cl`
4. Agregar también: `www.busesmadrid.cl`

Vercel te mostrará los valores DNS que debes configurar:

```
Type: A
Name: @
Value: 76.76.21.21  (ejemplo, usa el que te de Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2. En cPanel → Zone Editor

**IMPORTANTE: Antes de modificar DNS, toma un screenshot o copia todos los registros actuales.**

#### Modificar/Agregar estos registros:

**Para el dominio raíz (busesmadrid.cl):**
```
Tipo: A
Nombre: @
Dirección: 76.76.21.21  (usa la IP que Vercel te dio)
TTL: 3600
```

**Para www:**
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com  (usa el valor que Vercel te dio)
TTL: 3600
```

#### ⚠️ NO MODIFICAR ESTOS REGISTROS (correo):

```
Tipo: MX
Nombre: @
Valor: mail.busesmadrid.cl
Prioridad: 0

Tipo: TXT (SPF)
Nombre: @
Valor: v=spf1 a mx ip4:XX.XX.XX.XX ~all

Tipo: TXT (DKIM)
Nombre: default._domainkey
Valor: [el que ya tengas]

Tipo: CNAME
Nombre: webmail
Valor: busesmadrid.cl  (o el que tengas)
```

### 3. Esperar propagación DNS

- **Mínimo:** 5-10 minutos
- **Máximo:** 48 horas
- **Típico:** 1-2 horas

Puedes verificar en: https://dnschecker.org/

---

## Parte 4: Verificación Post-Deploy

### 1. Verificar que el sitio carga

```
https://busesmadrid.cl
https://www.busesmadrid.cl
```

### 2. Probar formulario de contacto

Ve a la sección de contacto y envía un mensaje de prueba.

### 3. Verificar que el correo funciona

- Deberías recibir el correo en `EMAIL_CONTACT_TO`
- Verifica los logs en Vercel → tu_proyecto → "Logs"

### 4. Probar panel de administración

```
https://busesmadrid.cl/admin/login
```

Login con las credenciales de la base de datos.

### 5. Verificar que Webmail sigue funcionando

```
https://webmail.busesmadrid.cl
```

Debe seguir funcionando normalmente (Roundcube).

---

## 🔧 Solución de Problemas Comunes

### Error: "Database connection failed"

**Problema:** Vercel no puede conectar con MySQL.

**Solución:**
1. Verifica que las IPs de Vercel estén permitidas en cPanel → "Remote MySQL"
2. Verifica las credenciales en Vercel → Settings → Environment Variables
3. Intenta permitir todas las IPs temporalmente: `%`

### Error: "SMTP authentication failed"

**Problema:** No puede enviar correos.

**Solución:**
1. Verifica SMTP_USER y SMTP_PASSWORD en Vercel
2. Intenta con `SMTP_ALLOW_INVALID_CERTS=true` (temporal)
3. Verifica que el correo esté activo en cPanel → "Email Accounts"

### El dominio no resuelve

**Problema:** DNS no propaga.

**Solución:**
1. Espera más tiempo (hasta 48h)
2. Verifica en https://dnschecker.org/
3. Limpia caché DNS local: `ipconfig /flushdns` (Windows) o `sudo dscacheutil -flushcache` (Mac)

### El correo dejó de funcionar

**Problema:** Modificaste los registros MX.

**Solución:**
1. Ve a cPanel → Zone Editor
2. Restaura los registros MX originales
3. Contacta soporte de tu hosting si es necesario

### Error 500 en production

**Problema:** Error en el servidor.

**Solución:**
1. Ve a Vercel → tu_proyecto → "Logs"
2. Busca el error específico
3. Verifica las variables de entorno

---

## 📊 Checklist Final

Antes de considerar el deploy completo, verifica:

- [ ] Sitio carga en `https://busesmadrid.cl`
- [ ] Sitio carga en `https://www.busesmadrid.cl`
- [ ] SSL/HTTPS funciona (candado verde)
- [ ] Formulario de contacto envía correos
- [ ] Formulario de postulación funciona
- [ ] Panel de admin es accesible
- [ ] Login en admin funciona
- [ ] Webmail sigue funcionando (`https://webmail.busesmadrid.cl`)
- [ ] Envío/recepción de correos funciona normalmente
- [ ] No hay errores en Vercel logs

---

## 🎉 Deploy Exitoso

Si todo lo anterior funciona, ¡felicidades! Tu sitio está desplegado correctamente en Vercel.

### Próximos pasos opcionales:

1. **Configurar Analytics** (Vercel Analytics es gratis)
2. **Configurar Speed Insights** (Vercel Speed Insights)
3. **Configurar monitoring** (uptime, errores)
4. **Backup automático de BD** (cPanel tiene cron jobs)

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs de Vercel
2. Verifica las variables de entorno
3. Contacta soporte de tu hosting (para temas de cPanel/DNS)
4. Contacta soporte de Vercel (chat en dashboard)

---

**Última actualización:** Mayo 2026
