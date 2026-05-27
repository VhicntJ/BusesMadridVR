# 📦 Configurar Vercel Blob Storage

Esta guía explica cómo configurar Vercel Blob para almacenar los CVs de postulaciones.

---

## 🎯 ¿Qué es Vercel Blob?

Vercel Blob es un servicio de almacenamiento de archivos optimizado para aplicaciones serverless:

- ✅ **Gratis hasta 5 GB** de almacenamiento
- ✅ **100 GB de transferencia** mensual gratis
- ✅ **CDN global incluido** (entrega rápida en todo el mundo)
- ✅ **Integración nativa** con Next.js

---

## 📋 Plan Gratuito (Hobby)

```
Almacenamiento: 5 GB
Transferencia: 100 GB/mes
Costo adicional:
  - $0.15 por GB adicional de almacenamiento/mes
  - $0.40 por GB adicional de transferencia
```

**Estimación para postulaciones:**
- **CV promedio:** 500 KB (0.5 MB)
- **5 GB =** ~10,000 CVs
- **100 GB transferencia =** ~200,000 descargas/mes

👉 **Más que suficiente para Buses Madrid**

---

## 🚀 Configuración Paso a Paso

### **1. Desplegar proyecto en Vercel**

Si aún no lo has hecho:

```bash
# Push tu código a GitHub
git push origin main

# Ve a vercel.com
# Import project desde GitHub
```

### **2. Conectar Vercel Blob Storage**

1. Ve a tu proyecto en **Vercel Dashboard**
2. Click en la pestaña **"Storage"**
3. Click en **"Connect Store"**
4. Selecciona **"Blob"**
5. Click en **"Create New"** → **"Blob Store"**

**Nombre sugerido:** `buses-madrid-cvs`

6. Click **"Create & Connect"**

### **3. Verificar variable de entorno**

Vercel inyecta automáticamente la variable:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```

**NO necesitas agregarla manualmente**, Vercel lo hace por ti.

Para verificar:
1. Ve a **Settings** → **Environment Variables**
2. Deberías ver `BLOB_READ_WRITE_TOKEN` (valor oculto)

### **4. Redeploy**

Después de conectar el Blob Storage:

1. Ve a **Deployments**
2. Click en el deployment más reciente
3. Click en **"Redeploy"**

O simplemente haz un nuevo commit y push:

```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

## ✅ Verificar que funciona

### **1. Probar subida de CV**

1. Ve a tu sitio: `https://tudominio.com/trabaja-con-nosotros`
2. Llena el formulario y sube un CV
3. Envía la postulación

### **2. Verificar en Vercel Dashboard**

1. Ve a **Storage** → **Blob** en Vercel Dashboard
2. Deberías ver el archivo subido en la carpeta `cv/`

### **3. Verificar en base de datos**

El archivo se guarda en `bm_postulaciones_archivos`:

```sql
SELECT * FROM bm_postulaciones_archivos ORDER BY subido_en DESC LIMIT 5;
```

La columna `ruta` debería contener una URL como:

```
https://xxxxx.public.blob.vercel-storage.com/cv/12345678-9_1234567890.pdf
```

### **4. Probar descarga desde admin**

1. Login en `/admin/login`
2. Ve a postulaciones
3. Click en "Descargar CV"

---

## 🔒 Seguridad: Public vs Private

### **Configuración actual: `access: "public"`**

```typescript
const blob = await put(filename, file, {
  access: "public", // ← Archivos accesibles por URL directa
});
```

**Ventajas:**
- ✅ URLs directas para descargar
- ✅ Más rápido
- ✅ Menos complejidad

**Desventajas:**
- ⚠️ Cualquiera con la URL puede descargar el CV

### **Opción alternativa: `access: "private"`**

Si prefieres que solo admins vean los CVs:

```typescript
const blob = await put(filename, file, {
  access: "private", // ← Requiere autenticación
});
```

Luego necesitas generar **signed URLs** (URLs temporales):

```typescript
import { getDownloadUrl } from "@vercel/blob";

const url = await getDownloadUrl(blobUrl, {
  expiresIn: 3600, // URL válida por 1 hora
});
```

**Recomendación:** Usa `public` por simplicidad. Los CVs tienen nombres aleatorios y no son indexables por Google.

---

## 📊 Monitorear uso

### **Ver estadísticas en Vercel:**

1. Ve a **Storage** → **Blob**
2. Verás:
   - Almacenamiento usado
   - Transferencia del mes
   - Número de archivos

### **Alertas de límite:**

Vercel te enviará un correo cuando estés cerca del límite gratuito.

---

## 🧹 Limpiar archivos antiguos (opcional)

Si necesitas liberar espacio, puedes crear un cron job para eliminar CVs viejos:

```typescript
// src/app/api/cron/cleanup-old-cvs/route.ts
import { list, del } from "@vercel/blob";

export async function GET() {
  const { blobs } = await list({ prefix: "cv/" });

  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;

  for (const blob of blobs) {
    if (new Date(blob.uploadedAt).getTime() < sixMonthsAgo) {
      await del(blob.url);
    }
  }

  return Response.json({ cleaned: blobs.length });
}
```

Luego configura un **Vercel Cron Job**:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup-old-cvs",
    "schedule": "0 0 1 * *" // 1er día de cada mes a medianoche
  }]
}
```

---

## 🆘 Solución de Problemas

### **Error: "Missing Blob Storage token"**

**Causa:** No conectaste Vercel Blob Storage.

**Solución:**
1. Ve a Storage → Connect Store → Blob
2. Crea un nuevo Blob Store
3. Redeploy

### **Error: "Failed to upload file"**

**Causa:** Token inválido o permisos incorrectos.

**Solución:**
1. Ve a Settings → Environment Variables
2. Verifica que `BLOB_READ_WRITE_TOKEN` existe
3. Si no existe, reconecta el Blob Storage
4. Redeploy

### **Los archivos no aparecen en Storage**

**Causa:** El archivo se subió pero no se ve en dashboard.

**Solución:**
- Los archivos pueden tardar unos segundos en aparecer
- Refresca la página del dashboard
- Verifica en la base de datos si la URL se guardó correctamente

### **"Cannot read properties of undefined (reading 'put')"**

**Causa:** Falta instalar `@vercel/blob`.

**Solución:**
```bash
npm install @vercel/blob
git add package.json package-lock.json
git commit -m "Add Vercel Blob dependency"
git push
```

---

## 💰 Costos estimados

### **Escenario conservador (20 postulaciones/mes):**
```
20 CVs/mes × 0.5 MB = 10 MB/mes
10 MB almacenamiento = GRATIS (dentro de 5 GB)
Descargas: 20 × 3 vistas = 60 descargas × 0.5 MB = 30 MB
30 MB transferencia = GRATIS (dentro de 100 GB)

Costo total: $0/mes
```

### **Escenario alto (200 postulaciones/mes):**
```
200 CVs/mes × 0.5 MB = 100 MB/mes
100 MB almacenamiento = GRATIS
Descargas: 200 × 5 vistas = 1,000 descargas × 0.5 MB = 500 MB
500 MB transferencia = GRATIS

Costo total: $0/mes
```

### **Escenario extremo (1,000 postulaciones/mes):**
```
1,000 CVs/mes × 0.5 MB = 500 MB/mes
500 MB almacenamiento = GRATIS
Descargas: 1,000 × 10 vistas = 10,000 descargas × 0.5 MB = 5 GB
5 GB transferencia = GRATIS

Costo total: $0/mes
```

👉 **Conclusión: Muy probablemente siempre será gratis para Buses Madrid.**

---

## 📞 Recursos

- **Documentación oficial:** https://vercel.com/docs/storage/vercel-blob
- **Pricing:** https://vercel.com/docs/storage/vercel-blob/usage-and-pricing
- **SDK Reference:** https://vercel.com/docs/storage/vercel-blob/using-blob-sdk

---

**¡Listo! Tu sistema de CVs está configurado con Vercel Blob.**
