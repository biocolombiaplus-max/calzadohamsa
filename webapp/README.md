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
   `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL` y, si vas a usar
   pago en línea, `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` + `WOMPI_INTEGRITY_SECRET`).
4. Click **Deploy**. En unos minutos tendrás tu tienda en una URL
   `tu-proyecto.vercel.app` — puedes conectar tu dominio propio desde
   **Project Settings → Domains**.

Cada vez que hagas `git push` a la rama conectada, Vercel vuelve a desplegar
automáticamente.

## Favicon y vista previa al compartir el link

Al entrar al sitio, el ícono de la pestaña del navegador y la imagen que
aparece al compartir `calzadohamsa.com` (WhatsApp, Facebook, iMessage,
etc.) se generan automáticamente a partir de tu logo y el nombre de la
tienda — no necesitas subir nada aparte. Si ya tienes un logo en
`/admin/configuracion`, se usa ese mismo logo (recortado/centrado
automáticamente); si no, se genera un ícono de respaldo con la inicial del
nombre de tu tienda sobre tu color primario, así que nunca se ve el ícono
genérico de Next.js.

Esto vive en `src/app/icon.tsx` (ícono del navegador), `src/app/apple-icon.tsx`
(ícono al agregar a inicio en iPhone) y `src/app/opengraph-image.tsx` (la
tarjeta que se ve al compartir el link). Si cambias el logo o el color
primario en el admin, estas imágenes se actualizan solas (se regeneran
cada hora como máximo). Recuerda configurar `NEXT_PUBLIC_SITE_URL` en
Vercel con tu dominio real para que las vistas previas usen la URL
correcta.

## Cómo funciona el checkout (sin pasarela de pago)

El modelo de negocio actual es **pago contra entrega** + WhatsApp, igual que
en la tienda de Shopify. El checkout guarda el pedido en Firestore
(colección `orders`) y en la página de confirmación aparece un botón que
abre WhatsApp con todo el resumen del pedido ya escrito, para que la clienta
lo confirme y ustedes lo alisten de inmediato. Todos los pedidos también
quedan visibles y gestionables desde `/admin/pedidos`.

## 2×1 automático en el carrito normal

No hace falta pasar por `/oferta-2x1` para obtener el 2×1: si el carrito
(`/carrito`, el panel lateral, o "Comprar ya" con cantidad 2) llega a 2
unidades — de cualquier modelo, talla o color combinados — el sistema
empareja automáticamente las 2 unidades más caras al precio del combo
(`settings.bundle2x1.price`) y activa el envío gratis. Con 4 unidades arma
2 combos, con una cantidad impar la unidad sobrante se cobra a precio
normal. La lógica vive en `src/lib/bundle.ts` (`computeBundlePricing`) y la
usan el carrito, el checkout y el modal de compra rápida.

## Encabezado: logo y menú de colecciones

El logo queda siempre perfectamente centrado y el carrito pegado a la
esquina (en cualquier tamaño de pantalla), gracias a un layout de 3
columnas donde las columnas laterales tienen el mismo ancho. En móvil hay
un botón de menú (☰) con los mismos enlaces que en desktop.

- **Tamaño del logo**: ajustable en `/admin/configuracion` → "General" →
  "Tamaño del logo en el encabezado".
- **Menú de colecciones**: en `/admin/configuracion` → "Menú de
  colecciones" agregas pares de "Nombre en el menú" + "Valor de colección"
  (debe coincidir exactamente con el campo "Colección" de cada producto).
  Aparecen como un submenú "Colecciones" en el header (desktop y móvil) que
  enlaza a `/catalogo?collection=<valor>`. Si no agregas ninguna, el menú
  no se muestra.

## Envíos por departamento y municipio

Las compras de **un solo par** cobran envío según la ciudad de la clienta;
el combo 2×1 siempre incluye envío gratis. El checkout (`/checkout`) y el
modal de compra rápida piden **departamento y municipio** con selects
dependientes (usa la lista completa y oficial de Colombia — 33
departamentos y ~1.100 municipios, vía el paquete `colombia-territorial`),
calculan el costo en vivo y lo suman al total.

Tú controlas las tarifas desde **`/admin/configuracion` → "Envíos y oferta
2×1"**:

- **Costo de envío por defecto**: se usa para cualquier departamento sin
  tarifa propia.
- **Tarifas por departamento**: agrega una fila por cada departamento con
  un costo distinto (ej. Bogotá $10.000, zonas apartadas $25.000).
- **Excepciones por municipio**: para un municipio puntual que necesite un
  precio distinto al de su departamento (ej. envío gratis en tu propia
  ciudad).

Si no configuras nada, todo el país usa el costo por defecto (15.000 COP
de fábrica).

## Oferta 2x1 (`/oferta-2x1`)

Página dedicada donde la clienta elige 2 pares (modelo, talla y color de
cada uno). El precio del combo es un valor fijo — **$159.900 por defecto**,
editable en **`/admin/configuracion` → "Envíos y oferta 2×1" → "Precio del
combo 2×1"** — con envío siempre gratis y temporizador de urgencia. Se usa
"2×1" como gancho de marketing, pero el precio real es ese valor fijo (no
un descuento literal de "paga uno, lleva dos"); si el valor de las dos
tallas/colores elegidos ya es menor al precio del combo, la clienta nunca
paga de más (se cobra el menor de los dos). Al completar la selección
aparecen dos botones:

- **⚡ Pagar ahora y ahorra 5% más** → pasarela **Wompi** (tarjeta, PSE,
  Nequi), con 5% de descuento adicional sobre el precio del combo.
- **💵 Pago contra entrega** → abre el formulario rápido de siempre y al
  confirmar redirige a la página de confirmación (con botón a WhatsApp).

Los botones "2x1" del resto del sitio (menú, badge flotante, hero) ya
apuntan a esta página.

### Activar el pago en línea con Wompi

Sin `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` y `WOMPI_INTEGRITY_SECRET` configuradas,
el botón "Pagar ahora" simplemente cae de vuelta al flujo de pago contra
entrega (no se rompe nada). Para activarlo:

1. En tu [panel de Wompi](https://comercios.wompi.co) ve a
   **Desarrolladores > Llaves de la API**.
2. Copia la **llave pública** (`pub_prod_...` o `pub_test_...` en modo
   pruebas) en `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`.
3. Copia la **llave secreta de integridad** (`prod_integrity_...` /
   `test_integrity_...`) en `WOMPI_INTEGRITY_SECRET`. Esta nunca debe
   llevar el prefijo `NEXT_PUBLIC_` porque solo se usa en el servidor
   (`/api/wompi-signature`) para firmar el pago sin exponerla al navegador.
4. Agrega ambas variables en **Vercel > Project Settings > Environment
   Variables** y vuelve a desplegar.

**Importante — confirmación de pagos:** el pedido se crea en Firestore con
estado `pendiente` antes de enviar a la clienta a Wompi. Wompi confirma el
pago en su propio checkout y redirige de vuelta a la página de
confirmación, pero por ahora la actualización del estado del pedido a
"pagado/confirmado" es **manual**: revisa el pago en tu
[panel de Wompi](https://comercios.wompi.co) (o el correo de notificación
que te llega por cada transacción) y marca el pedido como confirmado desde
`/admin/pedidos`, igual que ya haces con la transportadora y el número de
guía. Automatizar esa confirmación requeriría un webhook con credenciales
de servidor adicionales (Firebase Admin SDK) — si más adelante quieres ese
nivel de automatización, es un paso aparte que podemos construir.

Si más adelante quieres aceptar pagos con tarjeta en línea, se puede integrar
una pasarela como **Wompi** o **PayU** (ambas soportan Colombia) sin cambiar
la arquitectura — es un paso independiente que se puede agregar cuando lo
necesites.

## Fotos de producto: encuadre automático a cuadrado

Al subir fotos en `/admin/productos` no hace falta recortarlas ni ajustar
nada manualmente: se suben tal cual (cualquier tamaño o proporción), y
Cloudinary las encuadra a cuadrado automáticamente usando su función de
"gravedad automática" (`g_auto`), que detecta con IA en qué parte de la
foto está el producto y recorta ahí — sin dejar franjas de fondo ni
cortar el producto, sin importar si quedó centrado o no en la foto
original. Esto pasa en la propia URL de Cloudinary (parámetro
`AUTO_OPTIMIZE` en `src/lib/storage.ts`), no en el navegador, así que
funciona igual de bien para cualquier foto que subas.

Las fotos que ya estaban subidas antes de este cambio y que se ven con
franjas de fondo a los lados hay que volver a subirlas (editar el
producto → reemplazar la foto) para que tomen el nuevo encuadre — esas
fotos anteriores ya se guardaron recortadas a cuadrado con la franja
"quemada" en los píxeles, así que no hay forma de arreglarlas sin volver
a procesar la imagen original.

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
