# Rifa Pro-Diplomado en Inteligencia Artificial

App para controlar los números de una rifa: compradores, abonos, saldos y sorteo. React + Vite + Tailwind + Supabase, con soporte PWA.

## 1. Crear el proyecto en Supabase (gratis)

1. Entra a https://supabase.com y crea un proyecto nuevo (plan Free).
2. Ve a **SQL Editor** → **New query**, pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
   - Esto crea las tablas `raffle_config`, `raffle_numbers` y `payments`.
   - También inserta automáticamente la configuración de esta rifa (título, premio, valor del número, fecha del sorteo) y genera los 100 números del 00 al 99.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → será `VITE_SUPABASE_URL`
   - `anon public` key → será `VITE_SUPABASE_ANON_KEY`

## 2. Configurar variables de entorno en local

```bash
cp .env.example .env
```

Edita `.env` y pega tu URL y llave anónima de Supabase.

## 3. Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## 4. Desplegar en Vercel (gratis)

1. Sube este repo a GitHub (ya está conectado a `https://github.com/Juanjorodriguez09/Rifas.git`).
2. Entra a https://vercel.com → **Add New Project** → importa el repo `Rifas`.
3. Vercel detecta automáticamente que es un proyecto Vite (build command `npm run build`, output `dist`).
4. En **Environment Variables** agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Cada `git push` a `main` vuelve a desplegar automáticamente.

## 5. Instalar como app en el celular (PWA)

Con el sitio ya desplegado, abre la URL en Chrome/Safari del celular → menú → **"Agregar a pantalla de inicio"**. Queda como app con ícono propio.

## Notas de seguridad

- La app no tiene login: cualquiera con el link puede editar los datos (pensado para uso de un solo administrador que comparte el link solo con quien organiza la rifa). Si más adelante quieres protegerla, se puede agregar un login simple de Supabase Auth.
- La tabla `raffle_config` guarda una sola fila con los datos generales de la rifa; se edita desde el botón "Editar información" dentro de la app.
