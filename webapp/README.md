# Hamsa Shoes — Tienda Online (Next.js + Firebase + Vercel)

Tienda de ecommerce completa, sin Shopify: Next.js 14 + Tailwind para el front,
Firebase (Firestore + Auth) como backend, Cloudinary para las fotos de
producto, lista para desplegar en Vercel desde este mismo repositorio de
GitHub. Ningún servicio usado aquí requiere tarjeta de crédito.

Incluye:
- Página de inicio, catálogo, ficha de producto (con timer de urgencia, prueba
  social en vivo, guía de tallas, productos relacionados), carrito, checkout
  rápido (pago contra entrega / transferencia) y confirmación de pedido con
  botón directo a WhatsApp.
- Ruleta de descuento (exit intent), botón flotante de WhatsApp, badge de oferta.
- **Panel administrativo** en `/admin` para agregar/editar/eliminar productos
  (con subida de fotos) y gestionar pedidos, sin tocar código.
- **Configuración del sitio** en `/admin/configuracion`: edita en vivo el
  nombre de la tienda, logo, número de WhatsApp, colores de marca, textos e
  imágenes del inicio, barra de confianza, beneficios, testimonios, CTA final
  y footer — sin necesidad de tocar código ni volver a desplegar.
- Paleta cálida terracota/camel/beige (editable desde el panel), diseño
  responsive y optimizado con `next/image`.
- Enlace discreto "Iniciar sesión" al final del footer público, para entrar
  al panel administrativo sin recordar la URL.

## 1. Crear el proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/) → **Crear proyecto**.
2. Dentro del proyecto, activa:
   - **Firestore Database** (modo producción, elige una región cercana, ej. `southamerica-east1`).
   - **Authentication** → método **Correo/Contraseña**.

   (Firebase **Storage** no se usa — ahora exige el plan de pago Blaze incluso
   para uso gratuito, así que las fotos de producto se hospedan en Cloudinary,
   ver paso 1.b.)
3. Ve a **Configuración del proyecto → Tus apps → Agregar app Web (`</>`)**.
   Copia los valores del objeto `firebaseConfig`.

## 1.b. Crear cuenta en Cloudinary (fotos de producto, gratis, sin tarjeta)

1. Ve a [cloudinary.com](https://cloudinary.com) → **Sign up free** (con correo o Google, no pide tarjeta).
2. En el dashboard, copia tu **Cloud name** (aparece arriba, ej. `dxxxx1234`).
3. Ve a **Settings (⚙️) → Upload → Upload presets → Add upload preset**.
   - **Signing Mode**: cámbialo a **Unsigned**.
   - Dale un nombre corto (ej. `hamsa_productos`) y **Save**.
4. Guarda esos dos valores (Cloud name y el nombre del preset) para el siguiente paso.

## 2. Configurar variables de entorno

Dentro de `webapp/`:

```bash
cp .env.local.example .env.local
```

Completa `.env.local` con los valores de Firebase y Cloudinary de los pasos
anteriores, y los datos de tu WhatsApp (`NEXT_PUBLIC_WHATSAPP_NUMBER`, sin el
0 inicial ni el código de país).

## 3. Instalar dependencias y correr localmente

```bash
cd webapp
npm install
npm run dev
```

Abre http://localhost:3000

## 4. Publicar las reglas de seguridad

Instala el CLI de Firebase (una sola vez) y publica `firestore.rules`:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # selecciona tu proyecto, usa el archivo ya existente
firebase deploy --only firestore:rules
```

Si prefieres no usar el CLI, puedes pegar el contenido de `firestore.rules`
directamente en la consola de Firebase (Firestore Database → Reglas) y
publicar desde ahí.

## 5. Crear tu primer usuario administrador

1. En Firebase Console → **Authentication → Users → Add user**, crea tu
   usuario (correo + contraseña) con el que vas a entrar al panel `/admin`.
2. Copia el **UID** de ese usuario (aparece en la lista de usuarios).
3. En **Firestore Database**, crea manualmente la colección `admins` con un
   documento cuyo **ID sea ese UID** (el contenido puede quedar vacío, `{}`).
4. Listo: ahora ese correo puede entrar a `/admin/login`.

> Cualquier usuario que quieras que administre la tienda necesita: (a) existir
> en Authentication y (b) tener un documento en `admins/{su-uid}`.

## 6. (Opcional) Cargar productos de ejemplo

```bash
echo "SEED_ADMIN_EMAIL=tu-correo@ejemplo.com" >> .env.local
echo "SEED_ADMIN_PASSWORD=tu-contraseña" >> .env.local
npm run seed
```

Esto crea 3 sandalias de ejemplo sin fotos — entra a `/admin/productos` para
subirles imágenes reales o edítalas con tus propios productos.

## 7. Subir el proyecto a GitHub

Este código ya vive dentro del repositorio `calzadohamsa`, en la carpeta
`webapp/`. Si quieres un repositorio propio solo para la tienda, puedes
copiar la carpeta `webapp/` a un repo nuevo, o desplegar directamente desde
aquí apuntando Vercel a esta subcarpeta (paso siguiente).

## 8. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New → Project** → importa
   este repositorio de GitHub.
2. En **Root Directory**, selecciona `webapp` (muy importante, porque el
   proyecto Next.js vive en esa subcarpeta y no en la raíz del repo).
3. En **Environment Variables**, agrega las mismas variables de tu
   `.env.local` (las `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_CLOUDINARY_*`,
   `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_WHATSAPP_COUNTRY_CODE`,
   `NEXT_PUBLIC_WHATSAPP_NUMBER`).
4. Click **Deploy**. En unos minutos tendrás tu tienda en una URL
   `tu-proyecto.vercel.app` — puedes conectar tu dominio propio desde
   **Project Settings → Domains**.

Cada vez que hagas `git push` a la rama conectada, Vercel vuelve a desplegar
automáticamente.

## Cómo funciona el checkout (sin pasarela de pago)

El modelo de negocio actual es **pago contra entrega** + WhatsApp, igual que
en la tienda de Shopify. El checkout guarda el pedido en Firestore
(colección `orders`) y en la página de confirmación aparece un botón que
abre WhatsApp con todo el resumen del pedido ya escrito, para que la clienta
lo confirme y ustedes lo alisten de inmediato. Todos los pedidos también
quedan visibles y gestionables desde `/admin/pedidos`.

Si más adelante quieres aceptar pagos con tarjeta en línea, se puede integrar
una pasarela como **Wompi** o **PayU** (ambas soportan Colombia) sin cambiar
la arquitectura — es un paso independiente que se puede agregar cuando lo
necesites.

## Estructura del proyecto

```
webapp/
  src/
    app/
      (shop)/          → páginas públicas (inicio, catálogo, producto, carrito, checkout)
      admin/            → panel administrativo (protegido)
    components/         → componentes de la tienda (Hero, ProductCard, CartDrawer, etc.)
    components/admin/   → formulario de productos, sidebar, guard de autenticación
    components/product/ → galería, timer, guía de tallas, etc. de la ficha de producto
    lib/                → Firebase, Cloudinary, tipos, carrito (zustand), productos, pedidos, utilidades
  firestore.rules
  scripts/seed.ts
```
