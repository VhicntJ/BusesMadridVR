# Buses Madrid 

Sitio web corporativo de Buses Madrid construido con Next.js 15, React 19 y TypeScript.

## 🚀 Características

- **Frontend moderno**: Next.js 15 con App Router
- **Diseño responsive**: Tailwind CSS 4
- **Animaciones fluidas**: Framer Motion
- **Formularios**: React Hook Form + Zod validation
- **Seguridad**: 
  - reCAPTCHA v3
  - Rate limiting
  - JWT authentication
  - CSRF protection
- **Backend API**: 
  - Envío de correos (SMTP)
  - Sistema de postulaciones laborales
  - Panel de administración
- **Base de datos**: MySQL/MariaDB

## 📋 Requisitos

- Node.js 20+
- MySQL 8.0+ o MariaDB
- Cuenta de correo SMTP (cPanel, Gmail, etc.)
- Cuenta de Google reCAPTCHA v3

## 🛠️ Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/VhicntJ/Buses-Madrid-V2.git
cd Buses-Madrid-V2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus datos reales. **Generar JWT_SECRET seguro:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Importar base de datos

```bash
mysql -u tu_usuario -p busesmad_paginaweb < database/buses_madrid.sql
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Despliegue en Vercel

### Preparación

1. **Sube el código a GitHub** (si no lo has hecho)
2. **Configura MySQL para conexiones remotas** en tu cPanel
3. **Crea las variables de entorno** en Vercel (ver `.env.vercel.example`)

### Deployment

1. Ve a [vercel.com](https://vercel.com)
2. Click en "New Project"
3. Importa este repositorio desde GitHub
4. Configura las variables de entorno
5. Deploy

### Configurar DNS

En tu cPanel → Zone Editor:

```dns
# Sitio web (Vercel)
Tipo: A
Nombre: @
Valor: 76.76.21.21  # IP que te da Vercel

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com  # CNAME que te da Vercel
```

**No toques los registros MX** (correo seguirá funcionando en cPanel).

## 🔐 Seguridad

Este proyecto incluye:

- ✅ Protección CSRF
- ✅ Rate limiting (5 req/15min por IP)
- ✅ Validación de input (Zod schemas)
- ✅ Sanitización de HTML
- ✅ Headers de seguridad
- ✅ reCAPTCHA v3
- ✅ Autenticación JWT
- ✅ Passwords hasheados con bcrypt

### Usuario administrador por defecto

**Email:** `admin@busesmadrid.cl`  
**Password:** Ver en base de datos

**⚠️ CAMBIA EL PASSWORD INMEDIATAMENTE DESPUÉS DEL PRIMER LOGIN**

## 📁 Estructura del proyecto

```
buses-madrid/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── api/               # API Routes
│   │   ├── admin/             # Panel de administración
│   │   ├── trabaja-con-nosotros/  # Página de postulaciones
│   │   └── page.tsx           # Home
│   ├── components/            # Componentes React
│   │   ├── sections/         # Secciones de la página
│   │   └── ui/               # Componentes UI reutilizables
│   ├── lib/                  # Utilidades y servicios
│   │   ├── db.ts             # Conexión MySQL
│   │   ├── auth.ts           # JWT authentication
│   │   ├── email-service.ts  # Envío de correos
│   │   ├── recaptcha-service.ts  # Validación reCAPTCHA
│   │   └── validation-schemas.ts  # Esquemas Zod
│   └── middleware.ts         # Middleware de autenticación
├── public/                   # Assets estáticos
├── database/                 # Scripts SQL
└── server.js                 # Servidor Node.js
```

## 📞 Contacto

- **Email**: busesmadrid@gmail.com
- **Teléfono**: +56 9 7486850
- **Dirección**: Jotabeche 811, Estación Central, Santiago, Chile

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es propiedad de Buses Madrid.

---

**Desarrollado para Buses Madrid Por V&R Alianza Digital Spa**
