# Nuestra Casa

App para llevar entre dos personas la lista de la compra y las cosas
pendientes para la casa. Dos secciones:

- **🛒 Compra**: escribes arriba lo que hace falta y pasa a "A comprar".
  Tocando un item pasa a "Comprado" (y viceversa). Se puede borrar de
  cualquiera de las dos columnas.
- **🏠 Casa**: igual, pero con tres categorías — "Urgente", "Medio plazo" y
  "Largo plazo" — que eliges al añadir el item o cambias después con los
  botones "→" de cada item.

Los dos veis y editáis la misma lista en tiempo casi real (la app
comprueba cambios cada pocos segundos), cada uno desde su móvil.

Este documento asume que **no tienes ninguna cuenta creada todavía**. Sigue
los pasos en orden — en total son unos 20-30 minutos la primera vez (menos
si reaprovechas cuentas que ya tengas de otros proyectos).

---

## 0. Lo que vas a necesitar

- Una cuenta de Google para cada uno de los dos (para entrar en la app) y
  una cuenta de Google para crear el proyecto OAuth (puede ser la misma)
- Una cuenta de GitHub (gratis) — es donde vivirá el código
- Una cuenta de Vercel (gratis) — es donde se aloja la web
- Un proyecto Postgres gratuito en **Neon**

---

## 1. Crear las credenciales de login con Google

1. Ve a [console.cloud.google.com](https://console.cloud.google.com) y crea
   un proyecto nuevo (arriba a la izquierda, "Seleccionar proyecto" →
   "Proyecto nuevo"). Ponle un nombre, por ejemplo "Nuestra Casa".
2. En el menú lateral, ve a **APIs y servicios → Pantalla de consentimiento
   OAuth**.
   - Tipo de usuario: **Externo**.
   - Rellena el nombre de la app, tu email de soporte y el email de
     contacto.
   - En "Usuarios de prueba" añade los emails de Google de los dos (así no
     hace falta publicar la app ni pasar revisión de Google, al ser un
     grupo cerrado de dos personas).
3. Ve a **APIs y servicios → Credenciales → Crear credenciales → ID de
   cliente de OAuth**.
   - Tipo de aplicación: **Aplicación web**.
   - En "Orígenes autorizados de JavaScript" añade:
     `http://localhost:3000`
   - En "URI de redirección autorizados" añade:
     `http://localhost:3000/api/auth/callback/google`
   - Guarda el **Client ID** y el **Client Secret** — los necesitarás en el
     paso 4.
   - Más adelante, cuando tengas la URL real de Vercel, vuelve aquí y añade
     también `https://tu-dominio.vercel.app` y
     `https://tu-dominio.vercel.app/api/auth/callback/google`.

## 2. Subir el código a GitHub

1. Crea una cuenta en [github.com](https://github.com) si no tienes.
2. Crea un repositorio nuevo (botón verde "New"), por ejemplo
   `nuestra-casa`. Puede ser privado.
3. En tu ordenador, dentro de esta carpeta del proyecto, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de Nuestra Casa"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/nuestra-casa.git
   git push -u origin main
   ```

## 3. Crear la base de datos (Neon)

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta gratuita (puedes
   entrar directamente con tu cuenta de Google).
2. Crea un proyecto nuevo (distinto del de cualquier otra app que tengas).
   Cuando termine, verás una pantalla con la "Connection string" — cópiala,
   la necesitarás dos veces (como `DATABASE_URL` y como `DIRECT_URL`).

## 4. Configurar las variables de entorno en local

1. Copia el archivo `.env.example` como `.env`.
2. Rellena:
   - `DATABASE_URL` y `DIRECT_URL`: la connection string de Neon del paso 3.
   - `NEXTAUTH_SECRET`: genera uno ejecutando `openssl rand -base64 32` en
     tu terminal (o cualquier generador de cadenas aleatorias online).
   - `NEXTAUTH_URL`: déjalo como `http://localhost:3000` para pruebas
     locales.
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: los del paso 1.
   - `ALLOWED_EMAILS`: tu email de Google y el de tu pareja, separados por
     coma. Solo esos dos podrán entrar en la app.

## 5. Instalar y probar en local

```bash
npm install
npm run db:push   # crea las tablas en tu base de datos Neon
npm run dev
```

Abre `http://localhost:3000` y entra con Google (con uno de los dos emails
de `ALLOWED_EMAILS`).

## 6. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y entra con tu cuenta de GitHub.
2. "Add New… → Project" y selecciona el repositorio `nuestra-casa`.
3. En "Environment Variables" añade las mismas variables que tienes en tu
   `.env`, pero con `NEXTAUTH_URL` apuntando a la URL que Vercel te va a
   dar (algo como `https://nuestra-casa.vercel.app`) — puedes desplegar una
   vez primero para saber la URL exacta, y luego editarla.
4. Dale a **Deploy**.
5. Cuando termine, vuelve a Google Cloud Console (paso 1) y añade la URL
   real de Vercel a los orígenes y a los URI de redirección autorizados.

¡Listo! Comparte la URL con tu pareja para que entre con su cuenta de
Google.

---

## Notas

- Solo pueden entrar los emails listados en `ALLOWED_EMAILS`; cualquier
  otra cuenta de Google que intente entrar será rechazada.
- No hay roles de admin: los dos veis y podéis editar/borrar cualquier item
  de las dos listas por igual.
- La app comprueba cambios nuevos cada ~4 segundos y también al volver a la
  pestaña/app — no hace falta refrescar a mano para ver lo que añada el
  otro.
