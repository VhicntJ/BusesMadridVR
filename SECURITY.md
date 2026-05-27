# 🔒 Política de Seguridad

## Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en este proyecto, por favor **NO** abras un issue público.

En su lugar:
1. Envía un correo a: **busesmadrid@gmail.com**
2. Incluye una descripción detallada de la vulnerabilidad
3. Pasos para reproducirla
4. Impacto potencial

Responderemos en 48 horas.

---

## ✅ Prácticas de Seguridad Implementadas

### 1. Autenticación y Autorización
- ✅ Passwords hasheados con **bcrypt** (cost 12)
- ✅ Autenticación basada en **JWT** (HS256)
- ✅ Cookies HttpOnly, Secure, SameSite
- ✅ Sesiones con expiración (8 horas)
- ✅ Middleware de protección de rutas

### 2. Validación de Input
- ✅ Validación con **Zod schemas**
- ✅ Sanitización de HTML (escapeHtml)
- ✅ Validación de tipos TypeScript
- ✅ Rate limiting (5 req/15min por IP)

### 3. Protección contra Ataques
- ✅ **CSRF protection** (origin validation)
- ✅ **XSS protection** (sanitización de input/output)
- ✅ **SQL Injection** (prepared statements con mysql2)
- ✅ **NoSQL Injection** (N/A - no usamos NoSQL)
- ✅ **Rate Limiting** (rate-limiter-flexible)
- ✅ **reCAPTCHA v3** (protección contra bots)

### 4. Comunicaciones Seguras
- ✅ HTTPS enforced en producción
- ✅ SMTP con TLS/SSL
- ✅ Headers de seguridad configurados
- ✅ CORS configurado correctamente

### 5. Secrets Management
- ✅ Variables de entorno para secrets
- ✅ `.env` en `.gitignore`
- ✅ Ejemplo sin valores reales (`.env.example`)
- ✅ No hay secrets hardcoded en código

### 6. Base de Datos
- ✅ Conexión por pooling (mysql2/promise)
- ✅ Prepared statements (previene SQL injection)
- ✅ Acceso remoto limitado por IP
- ✅ Usuario de BD con permisos mínimos necesarios

---

## ⚠️ Configuración de Seguridad Requerida

### Antes de desplegar en producción:

#### 1. Cambiar JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Actualiza `.env` y Vercel con el nuevo secret.

#### 2. Configurar reCAPTCHA v3
1. Ve a: https://www.google.com/recaptcha/admin
2. Crea un sitio con reCAPTCHA v3
3. Agrega las claves a `.env`:
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
   RECAPTCHA_SECRET_KEY=tu_secret_key
   ```

#### 3. Configurar ALLOWED_ORIGINS
Actualiza en `.env`:
```env
ALLOWED_ORIGINS=https://busesmadrid.cl,https://www.busesmadrid.cl
```

**No dejes `http://localhost` en producción.**

#### 4. Cambiar password del admin
Después del primer login, cambia el password por defecto.

#### 5. Configurar MySQL remoto
En cPanel → Remote MySQL, permite **solo** las IPs de Vercel.

**No uses `%` (todas las IPs) en producción.**

#### 6. Configurar headers de seguridad
En `next.config.ts` (ya configurado):
```javascript
headers: [
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
]
```

---

## 🚨 NO hacer en producción

- ❌ No subir `.env` al repositorio
- ❌ No usar passwords débiles
- ❌ No deshabilitar HTTPS
- ❌ No exponer stack traces al usuario
- ❌ No permitir todas las IPs en MySQL (`%`)
- ❌ No usar `SMTP_ALLOW_INVALID_CERTS=true`
- ❌ No commitear datos sensibles
- ❌ No usar secrets de desarrollo en producción

---

## 🔍 Auditoría de Seguridad

### Verificar dependencias vulnerables
```bash
npm audit
npm audit fix
```

### Verificar secrets en código
```bash
# Verificar que no haya secrets hardcoded
grep -r "password" src/ --include="*.ts" | grep -v "process.env"
```

### Verificar .env no esté en git
```bash
git log --all --full-history --pretty=format:"%H" -- .env
```

Si devuelve algo, `.env` estuvo en el historial. **Rotación de secrets requerida.**

---

## 📋 Checklist de Seguridad Pre-Deploy

Antes de cada deploy a producción:

- [ ] JWT_SECRET es único y largo (32+ bytes)
- [ ] Passwords cambiados desde valores por defecto
- [ ] reCAPTCHA configurado y funcionando
- [ ] ALLOWED_ORIGINS solo contiene dominios de producción
- [ ] HTTPS enabled (Vercel lo hace automático)
- [ ] MySQL permite solo IPs de Vercel
- [ ] Rate limiting configurado (5 req/15min)
- [ ] `.env` NO está en el repositorio
- [ ] `npm audit` sin vulnerabilidades high/critical
- [ ] Headers de seguridad configurados
- [ ] SMTP_ALLOW_INVALID_CERTS=false

---

## 🔄 Rotación de Secrets

Si sospechas que un secret fue comprometido:

### JWT_SECRET
1. Generar nuevo secret
2. Actualizar en Vercel env vars
3. Redeploy
4. Todas las sesiones se invalidarán

### Database Password
1. Cambiar en cPanel → MySQL Databases
2. Actualizar en Vercel env vars
3. Redeploy

### SMTP Password
1. Cambiar en cPanel → Email Accounts
2. Actualizar en Vercel env vars
3. Redeploy

---

## 📞 Contacto de Seguridad

**Email:** busesmadrid@gmail.com  
**Tiempo de respuesta:** 48 horas

---

## 📄 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Última actualización:** Mayo 2026
