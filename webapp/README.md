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

## Favicon, "instalar como app" y vista previa al compartir el link

Al entrar al sitio, el ícono de la pestaña del navegador, los íconos que se
usan al **instalar la tienda como app en el celular**, y la imagen que
aparece al compartir `calzadohamsa.com` (WhatsApp, Facebook, iMessage,
etc.) se generan automáticamente a partir de tu logo y tus colores de marca
— no necesitas subir nada aparte. Si ya tienes un logo en
`/admin/configuracion`, se usa ese mismo logo (recortado/centrado
automáticamente, sobre una tarjeta con degradado de tus colores para que
se vea premium); si no, se genera un ícono de respaldo con la inicial del
nombre de tu tienda, así que nunca se ve el ícono genérico de Next.js.

**Cómo instalar la tienda como app:**
- **Android (Chrome):** entra a calzadohamsa.com → menú (⋮) → "Instalar app"
  o "Agregar a pantalla principal".
- **iPhone (Safari):** entra a calzadohamsa.com → botón de compartir (□↑) →
  "Agregar a pantalla de inicio".

En ambos casos queda un ícono con tu logo en el celular que abre la tienda
a pantalla completa, sin la barra del navegador — como una app nativa.

Esto vive en `src/app/icon.tsx` (favicon del navegador), `src/app/apple-icon.tsx`
+ `src/app/icon-192`, `src/app/icon-512` y `src/app/icon-512-maskable`
(íconos al instalar como app, en varios tamaños para que se vean nítidos en
cualquier teléfono) y `src/app/opengraph-image.tsx` (la tarjeta que se ve al
compartir el link). Si cambias el logo o los colores en el admin, todas
estas imágenes se actualizan solas (se regeneran cada hora como máximo).
Recuerda configurar `NEXT_PUBLIC_SITE_URL` en Vercel con tu dominio real
para que las vistas previas usen la URL correcta.

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
   **Desarrolladores > Llaves de la API**. Ahí verás TRES valores
   distintos — no dos:
2. Copia la **llave pública** (`pub_prod_...` o `pub_test_...` en modo
   pruebas) en `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`.
3. Copia el **secreto de integridad** (una cadena larga, NO empieza con
   `prv_`) en `WOMPI_INTEGRITY_SECRET`. Esta nunca debe llevar el prefijo
   `NEXT_PUBLIC_` porque solo se usa en el servidor (`/api/wompi-signature`)
   para firmar el pago sin exponerla al navegador. **Ojo:** esto NO es lo
   mismo que la llave privada del paso 4 — si usas la llave privada aquí,
   el pago falla con "firma inválida".
4. Copia la **llave privada** (`prv_prod_...` / `prv_test_...`) en
   `WOMPI_PRIVATE_KEY`. Es opcional, pero sin ella no se puede verificar
   automáticamente si un pago quedó aprobado (ver abajo).
5. Agrega las tres variables en **Vercel > Project Settings > Environment
   Variables** y vuelve a desplegar.

**Confirmación de pagos:** el pedido se crea en Firestore con estado
`pendiente` antes de enviar a la clienta a Wompi. Al volver del checkout de
Wompi, la página de confirmación llama a `/api/wompi-verify`, que consulta
la transacción directamente en la API de Wompi (usando `WOMPI_PRIVATE_KEY`)
y le muestra a la clienta si su pago quedó realmente aprobado, pendiente o
rechazado — no se confía solo en que el navegador haya vuelto a la página.
Aun así, el campo `status` del pedido (pendiente → confirmado → enviado →
entregado) lo sigue moviendo la administradora a mano desde
`/admin/pedidos`, igual que con la transportadora y el número de guía —
marcar eso automáticamente en Firestore apenas Wompi aprueba requeriría
credenciales de servidor con permisos de escritura (Firebase Admin SDK),
que este proyecto no tiene configuradas; es un paso aparte que podemos
construir si lo necesitas.

## Notificación por correo de cada pedido nuevo

Igual que la notificación automática de Shopify, puedes recibir un correo
con diseño profesional cada vez que alguien complete un pedido (sin importar
el método de pago). Usa [Resend](https://resend.com) — tiene plan gratis
(3.000 correos/mes) y no requiere tarjeta para empezar.

1. Crea una cuenta gratis en [resend.com](https://resend.com) y genera una
   **API Key** en **API Keys > Create API Key**.
2. Agrega esa llave como `RESEND_API_KEY` en **Vercel > Project Settings >
   Environment Variables** (nunca lleva el prefijo `NEXT_PUBLIC_`, porque el
   correo se envía desde el servidor en `/api/notify-order`, no desde el
   navegador).
3. En `/admin/configuracion`, sección **General**, escribe el correo donde
   quieres recibir los pedidos en **"Correo para recibir notificación de
   cada pedido nuevo"**.
4. (Opcional pero recomendado) Por defecto los correos se envían desde
   `onboarding@resend.dev`, una dirección de pruebas de Resend que solo
   entrega de forma confiable al correo con el que creaste la cuenta. Para
   recibir en cualquier correo (el de tu negocio, tu contador, etc.) sin
   restricciones, verifica tu propio dominio en **Resend > Domains** y
   agrega `RESEND_FROM_EMAIL` con un remitente de ese dominio, por ejemplo:
   `Hamsa Shoes <pedidos@tudominio.com>`.

Si no configuras `RESEND_API_KEY`, el checkout sigue funcionando normal —
simplemente no se envía el correo.

## Notificación push al celular (como la app de Shopify)

Además del correo, la administradora puede recibir un **aviso push en el
celular** cada vez que llega un pedido — con sonido y vibración del
sistema, funcione o no la tienda abierta en ese momento, exactamente como
la app de Shopify. Se activa una sola vez y queda guardado en el
navegador/teléfono para siempre, sin tener que repetirlo cada vez que se
vuelve a entrar.

**Activarlo (una sola vez, gratis, sin servicios externos):**

1. En tu computador, corre este comando dentro de la carpeta `webapp/`
   (no hace falta instalar nada aparte, `npx` lo descarga solo):
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Te va a dar dos líneas, "Public Key" y "Private Key". En **Vercel >
   Project Settings > Environment Variables** agrega:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` → la llave pública
   - `VAPID_PRIVATE_KEY` → la llave privada (nunca lleva `NEXT_PUBLIC_`
     porque solo se usa en el servidor, en `/api/send-push`)
   - `VAPID_SUBJECT` → `mailto:` seguido de un correo tuyo, por ejemplo
     `mailto:contacto@calzadohamsa.com`
3. Vuelve a desplegar el sitio en Vercel para que tome las variables.
4. Desde el celular de la administradora, entra a `/admin` (idealmente ya
   instalada como app, ver más abajo) y toca el botón **"🔔 Activar
   notificaciones de pedidos"**. El teléfono va a pedir permiso de
   notificaciones — hay que aceptar.

Importante: genera esas llaves **una sola vez** y no las cambies después
— si las regeneras, todos los celulares que ya se habían suscrito dejan de
recibir avisos y tendrían que volver a activarlos.

**Compatibilidad:** funciona perfecto en Android (Chrome, directamente).
En iPhone requiere iOS 16.4 o superior y que la tienda esté **agregada a
la pantalla de inicio** como app (ver la sección de abajo) — Safari no
entrega notificaciones push a pestañas normales, solo a la app instalada.

Sin `VAPID_PRIVATE_KEY` configurada, el botón de activar simplemente no
hace nada — el checkout y el resto de la tienda siguen funcionando
normal.

## Pago contra entrega: pedido automático a WhatsApp

Cuando la clienta elige **pago contra entrega** en el checkout, apenas se
confirma el pedido se abre automáticamente una pestaña de WhatsApp hacia el
número configurado en `/admin/configuracion`, con un mensaje profesional ya
redactado (número de pedido, productos, talla/color, subtotal, envío, total
y los datos de entrega) listo para enviar con un toque. Si el navegador
bloquea la pestaña emergente, la página de confirmación del pedido muestra
el mismo mensaje en un botón "Confirmar pedido por WhatsApp" como respaldo.

## Adjuntar la guía de envío al avisar por WhatsApp

En `/admin/pedidos`, junto a la transportadora y el número de guía, hay un
botón **"📎 Subir guía (foto o PDF)"** — sube la foto de la etiqueta o el
PDF de la transportadora en un toque (se ve de inmediato como miniatura o
ícono de documento, con "Ver archivo" y "Quitar").

Al tocar **"💬 Avisar por WhatsApp (Enviado)"**, el link de la guía se
agrega dentro del mensaje ya escrito — la clienta lo toca y ve o descarga
el archivo. WhatsApp normalmente muestra una vista previa de la imagen
directo en el chat si es una foto. (El link de "clic para chatear" de
WhatsApp que usa este botón no permite adjuntar un archivo de verdad como
mensaje separado — solo texto — por eso se manda como link dentro del
mismo mensaje, que es la forma más rápida y confiable de lograrlo sin
depender de la API de Meta.)

## CRM de WhatsApp — bandeja + embudo de ventas (`/admin/crm`)

Un CRM propio, integrado en el panel, para atender a cada clienta por
WhatsApp uno a uno **desde el navegador** (sin usar el celular) y llevar un
embudo de ventas visual — igual que Kommo, pero sin mensualidad ni un
sistema externo más que administrar.

**Incluye:**
- **Bandeja** de conversaciones (como WhatsApp Web): lista de clientas
  ordenada por el mensaje más reciente, con contador de no leídos, e hilo de
  conversación completo por clienta.
- **Ficha de cada clienta**: nombre, etiquetas, notas internas (no se
  envían, solo las ve tu equipo) y fecha de próximo seguimiento.
- **Embudo visual** (`Nuevo → Interesado → Negociando → Cliente → Perdido`)
  con tablero tipo Kanban — mueves a cada clienta de etapa con un toque.
- **Respuestas rápidas**: frases guardadas que aparecen como botones sobre
  el cuadro de texto, para responder preguntas frecuentes sin escribir de
  nuevo cada vez.
- **Plantillas aprobadas por Meta**, para retomar una conversación después
  de que se cierra la ventana de 24 horas sin arriesgar el número (ver
  "Por qué esto no bloquea tu WhatsApp" más abajo).

### Importante: esto usa la API OFICIAL de Meta, no un atajo

Kommo, y cualquier otro CRM serio, conecta WhatsApp usando **WhatsApp
Business Platform (Cloud API)** de Meta — la única forma oficial y segura
de automatizar WhatsApp desde un sistema externo. Este CRM hace exactamente
lo mismo, directo, sin intermediarios de pago:

- **Nunca** usa WhatsApp Web automatizado, librerías no oficiales ni
  "hackea" la app del celular — eso es lo que hace que Meta banee números.
- Respeta la **ventana de 24 horas**: solo puedes escribir libremente
  dentro de las 24 horas siguientes al último mensaje que la clienta te
  envió. Pasado ese tiempo, el CRM bloquea el cuadro de texto normal y te
  pide usar una **plantilla pre-aprobada por Meta** — es la única forma
  permitida de escribir primero o retomar una conversación vieja.
- Manda **un mensaje a la vez**, a una clienta que ya te escribió (o que
  aceptó una plantilla) — nunca mensajes masivos ni listas de difusión, que
  es la causa más común de bloqueo.

Siguiendo estas reglas (que el CRM ya aplica automáticamente) tu número
está tan seguro como el de cualquier negocio grande que usa WhatsApp
Business Platform.

### Cómo conectarlo (una sola vez)

**Meta cobra por conversación después de cierto volumen gratis al mes**
(las primeras conversaciones de servicio al cliente son gratis; revisa los
precios vigentes en [business.whatsapp.com](https://business.whatsapp.com)
antes de activarlo) — no es necesario tarjeta de crédito para empezar a
configurarlo y probarlo con un número de pruebas.

**1. Crea tu app en Meta for Developers**
1. Ve a [developers.facebook.com](https://developers.facebook.com) → **Mis
   apps → Crear app** → tipo **"Empresa"**.
2. Dentro de la app, en el panel izquierdo, agrega el producto
   **WhatsApp**.
3. Meta te da automáticamente un **número de prueba** gratis y un **Access
   Token temporal** (dura 24h, solo para probar) — en
   **WhatsApp → Configuración de la API** verás:
   - **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **Token de acceso temporal** (para probar rápido; el paso 3 explica
     cómo conseguir uno permanente).

**2. Verifica tu negocio y pasa a un número real (cuando quieras recibir
pedidos reales, no solo probar)**
1. En [business.facebook.com](https://business.facebook.com), completa la
   **verificación de tu negocio** (datos legales, puede tardar 1-2 días).
2. En **WhatsApp Manager**, agrega y verifica tu número real de WhatsApp
   Business (recibirás un código por SMS o llamada — este número ya NO
   puede usarse al mismo tiempo en la app normal de WhatsApp Business del
   celular).

**3. Genera un Access Token PERMANENTE** (el temporal expira cada 24h y
dejaría de funcionar el CRM):
1. En [business.facebook.com](https://business.facebook.com) →
   **Configuración del negocio → Usuarios → Usuarios del sistema → Agregar**.
   Créalo con rol **Administrador**.
2. Asígnale tu app de WhatsApp con permiso **Control total**.
3. **Generar nuevo token** → selecciona tu app → marca los permisos
   `whatsapp_business_messaging` y `whatsapp_business_management` → sin
   fecha de expiración. Copia ese token en `WHATSAPP_ACCESS_TOKEN`.

**4. Configura el webhook** (para que los mensajes entrantes lleguen al
CRM):
1. Inventa una palabra para `WHATSAPP_VERIFY_TOKEN` (ej: un password
   largo cualquiera) y agrégala como variable de entorno.
2. En **Configuración básica** de tu app, copia el **App Secret** en
   `WHATSAPP_APP_SECRET`.
3. Agrega TODAS las variables de esta sección en **Vercel > Project
   Settings > Environment Variables** (ver también el paso 5) y despliega.
4. En Meta for Developers → tu app → **WhatsApp → Configuración →
   Webhook → Editar**:
   - **URL de devolución de llamada**: `https://tudominio.com/api/whatsapp/webhook`
   - **Verify token**: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`.
   - Clic en **Verificar y guardar**.
   - En **Campos del webhook**, suscríbete a **`messages`**.

**5. Cuenta de servicio de Firebase** (para que el webhook pueda guardar
los mensajes que van llegando):
1. [Firebase Console](https://console.firebase.google.com) → tu proyecto →
   **⚙️ Configuración del proyecto → Cuentas de servicio → Generar nueva
   clave privada**. Descarga el archivo `.json`.
2. De ese archivo, copia:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (pégalo tal cual, con los
     `\n` incluidos, entre comillas).
3. Agrega las 3 en **Vercel > Project Settings > Environment Variables**
   junto con las de WhatsApp del paso 4, y vuelve a desplegar.

**6. Prueba de punta a punta**
1. Entra a `/admin/crm` → pestaña **⚙️ Configuración** — debe mostrar las 4
   marcas en verde.
2. Desde tu celular (con otro número), escríbele por WhatsApp al número
   configurado. El mensaje debe aparecer en la **Bandeja** en segundos.
3. Respóndele desde el CRM — debe llegarte al celular.

**7. (Opcional) Agrega plantillas para retomar conversaciones viejas**
1. En **WhatsApp Manager → Plantillas de mensajes → Crear plantilla**, crea
   y espera la aprobación de Meta (suele tardar minutos a pocas horas) de
   mensajes como *"Hola {{1}}, ¿sigues interesada en la sandalia que
   preguntaste? Todavía tenemos disponibilidad 😊"*.
2. En `/admin/crm → ⚙️ Configuración → Plantillas aprobadas por Meta`,
   agrégala con el nombre EXACTO que le pusiste en Meta.

Sin estas variables configuradas, `/admin/crm` se ve y funciona la
interfaz (embudo, notas, etiquetas), pero no puede mandar ni recibir
mensajes reales todavía — no rompe nada del resto de la tienda.

## Meta Pixel — medir y optimizar campañas de Meta Ads

El sitio ya tiene todo el código listo para medir quién ve un producto,
agrega al carrito, empieza a pagar y compra de verdad — los 4 eventos que
Meta necesita para que una campaña de Facebook/Instagram Ads aprenda a
encontrar más clientas parecidas a las que sí compran. Solo falta
conectarlo con tu cuenta de Meta (5 minutos):

1. Ve a [Meta Events Manager](https://business.facebook.com/events_manager2)
   → **Conectar orígenes de datos → Web** → crea un pixel nuevo (o usa uno
   que ya tengas) → ponle un nombre como "Hamsa Shoes Web".
2. Copia el **ID del pixel** (son solo números) en
   `NEXT_PUBLIC_META_PIXEL_ID`.
3. **(Recomendado)** En el mismo pixel → **Configuración → API de
   conversiones → Generar token de acceso manualmente** → copia ese token
   en `META_CONVERSIONS_API_TOKEN`. Esto hace que el evento de Compra
   llegue también directo desde el servidor, no solo desde el navegador
   de la clienta — en iPhone/Safari es muy común que bloqueen el pixel de
   JavaScript, así no se pierde ninguna venta en las métricas.
4. Agrega esas variables en **Vercel > Project Settings > Environment
   Variables** y vuelve a desplegar.
5. Para comprobar que quedó funcionando: instala la extensión de Chrome
   **[Meta Pixel Helper](https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)**,
   entra a calzadohamsa.com y deberías ver el ícono ponerse azul con
   "PageView" — o revisa **Events Manager → Probar eventos**, pegando la
   URL de tu sitio (ahí ves los eventos llegar en vivo).

**Eventos que ya están conectados, en todo el sitio:**
- `PageView` — cada página que se abre (incluye la navegación interna sin
  recargar, típica de Next.js).
- `ViewContent` — al abrir la ficha de un producto.
- `AddToCart` — al agregar algo al carrito (desde cualquier botón del
  sitio: ficha de producto, compra rápida, oferta 2×1).
- `InitiateCheckout` — al entrar a pagar.
- `Purchase` — al confirmarse un pedido (con el valor real cobrado), con
  protección para no contarlo dos veces si la clienta recarga la página
  de confirmación. Es el único evento que también se manda desde el
  servidor (API de Conversiones) si configuraste el token del paso 3.

Sin `NEXT_PUBLIC_META_PIXEL_ID` configurada, todo esto simplemente no
hace nada — el sitio sigue funcionando exactamente igual.

## Catálogo de productos para Meta Commerce Manager

Si vienes de Shopify, es muy probable que Meta Commerce Manager tenga
conectado un **catálogo viejo** (con productos de esa tienda anterior) —
por eso al armar un anuncio de "Colección" o activar "Mostrar Productos"
aparecen modelos que ya no existen. Este proyecto expone un **feed en
vivo** en:

```
https://calzadohamsa.com/api/product-feed
```

Es un feed en formato RSS/Google Shopping con los productos REALES y
activos de la tienda — lee Firestore directo en cada visita (con caché de
30 minutos), así que cuando agregas, editas o desactivas un producto en
`/admin/productos`, el feed se actualiza solo, sin tocar nada aquí ni en
Meta.

**Para crear el catálogo correcto en Meta (una sola vez):**
1. Ve a [Meta Commerce Manager](https://business.facebook.com/commerce_manager)
   → **Agregar catálogo** → tipo **E-commerce**.
2. En "¿Cómo quieres agregar los artículos?" elige **Usar un feed de
   datos** (datos programados).
3. Pega la URL de arriba (`https://calzadohamsa.com/api/product-feed`) y
   elige una frecuencia de actualización (diaria es suficiente).
4. Espera a que termine la primera subida (unos minutos) — ahí ya deberías
   ver tus sandalias reales, con su foto, precio y link correctos.
5. Vuelve al anuncio o conjunto de anuncios donde te aparecía el catálogo
   viejo y cambia la selección al catálogo nuevo (y su conjunto de
   productos "Todos los productos" o uno que crees con un filtro).

El catálogo viejo de Shopify lo puedes dejar desactivado en Commerce
Manager (⋯ → Desactivar) para que no vuelva a aparecer como opción.

**Nota:** este feed es a nivel de producto (una foto principal + hasta 10
adicionales por modelo), no por talla/color individual — suficiente para
anuncios de imagen, colección y retargeting básico. Si más adelante
quieres anuncios dinámicos por color/talla exacta, se puede ampliar a un
feed por variante.

## Embudo de ventas en vivo (`/admin`)

El Panel de control muestra un embudo propio, parecido al de Shopify:
cuántas visitas entran a la tienda y en qué paso se quedan — **Visitas →
Vio un producto → Agregó al carrito → Inició el pago → Compró** — con el
porcentaje de caída entre cada paso y de dónde viene el tráfico (campaña
de Meta Ads, orgánico, etc., tomado de los `utm_source`/`utm_campaign` del
link). Tiene selector de período (Hoy / 7 días / 30 días) y se actualiza
solo mientras lo tienes abierto, sin recargar la página.

Funciona de forma independiente del Meta Pixel: cada visitante anónimo
genera un documento de sesión en Firestore (`analyticsSessions`, de
lectura privada — solo la administradora puede verlo) que se va marcando
a medida que avanza, usando los mismos puntos del código donde ya se
dispara el Pixel (ver `src/lib/analytics.ts`). No requiere ninguna
variable de entorno ni cuenta externa — funciona apenas publicas este
cambio.

## Fotos de producto: encuadre a cuadrado, ajustable foto por foto

Al subir fotos en `/admin/productos` no hace falta recortarlas antes: se
suben tal cual (cualquier tamaño o proporción) y se guarda la foto
ORIGINAL completa, sin recortar nada. El encuadre a cuadrado se aplica
solo al MOSTRARLA (usando la "gravedad automática" de Cloudinary, que
detecta con IA en qué parte de la foto está el producto y encuadra ahí),
nunca se pierde información de la foto original.

Si alguna foto queda con un pedazo de la sandalia cortado, en el editor de
ese producto toca **"🔲 Recortada"** debajo de esa foto para cambiarla a
**"🖼️ Completa"** — se muestra entera (con fondo blanco) en vez de
recortada, con botones **"−"/"+"** para ajustar cuánto se encoge, en vivo.
Esto funciona tanto para fotos nuevas como para las que ya estaban subidas
antes — no hace falta volver a subir nada.

## Carga rápida de varios productos a la vez (`/admin/productos/carga-rapida`)

Cuando tienes varios modelos nuevos para publicar de un tirón, en vez de
crear un producto, subir sus fotos, guardar, y repetir uno por uno, este
modo deja subir TODAS las fotos mezcladas primero y organizarlas después:

1. **Sube todas las fotos** (de todos los modelos, sin importar el orden) —
   se suben varias a la vez en paralelo, así cargar 20-30 fotos toma
   segundos en vez de minutos.
2. **Agrúpalas**: toca las fotos de un mismo modelo para seleccionarlas y
   presiona "Agrupar en un producto nuevo" — aparece como una tarjeta de
   producto con esas fotos.
3. **Completa los datos de cada tarjeta**: título (genera la URL sola),
   precio, tallas, colores, colección y stock. El precio/tallas/colores/
   colección del producto anterior se copian automáticamente al siguiente,
   para no volver a escribirlos cuando son modelos parecidos.
4. Cada foto tiene el mismo control de **"🔲 Recortada" / "🖼️ Completa"**
   con los botones **"−"/"+"** de la ficha normal de producto, para
   ajustar las que no se vean bien recortadas — sin salir de la carga
   rápida.
5. **"✓ Crear N productos"** los publica todos de una — si alguno falla
   (ej. una URL repetida), se queda en pantalla con el error debajo para
   corregirlo, mientras los demás sí quedan creados.

## Estructura del proyecto

```
webapp/
  src/
    app/
      (shop)/          → páginas públicas (inicio, catálogo, producto, carrito, checkout)
      admin/            → panel administrativo (protegido), incluye admin/crm
      api/whatsapp/     → webhook + envío de mensajes (API oficial de Meta)
    components/         → componentes de la tienda (Hero, ProductCard, CartDrawer, etc.)
    components/admin/   → formulario de productos, sidebar, guard de autenticación
    components/admin/crm/ → bandeja, hilo de conversación, ficha, embudo Kanban, configuración
    components/product/ → galería, timer, guía de tallas, etc. de la ficha de producto
    lib/                → Firebase (cliente y admin), Cloudinary, WhatsApp, tipos, carrito (zustand), productos, pedidos, CRM, utilidades
  firestore.rules
  scripts/seed.ts
```
