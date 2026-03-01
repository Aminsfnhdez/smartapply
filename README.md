# SmartApply

> Adapta tu CV a cada oferta de empleo con inteligencia artificial y supera los filtros ATS.

SmartApply es una aplicación web que analiza tu perfil profesional y la descripción de una vacante, y genera automáticamente un CV optimizado usando la Claude API de Anthropic. El resultado se exporta como un PDF profesional, compatible con los sistemas ATS (Applicant Tracking System) más utilizados.

---

## Índice

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Flujo principal del usuario](#flujo-principal-del-usuario)
- [API Reference](#api-reference)
- [Base de datos](#base-de-datos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
- [Decisiones técnicas](#decisiones-técnicas)

---

## Características

- **Autenticación OAuth** con Google y GitHub via NextAuth.js v5.
- **Perfil profesional multi-paso** con experiencia, educación, habilidades técnicas, habilidades blandas, idiomas y certificaciones.
- **Generación de CV con IA** usando Claude Sonnet 4.6 — adapta y reescribe el CV priorizando la experiencia relevante e integrando las keywords de la vacante de forma natural.
- **Caché inteligente** por SHA-256 del par perfil + vacante para evitar llamadas duplicadas a la API.
- **Score ATS (0–100)** calculado automáticamente con keywords encontradas, keywords faltantes y sugerencias de mejora.
- **3 plantillas de CV**: Classic, Modern y Minimalist — todas ATS-friendly.
- **Exportación en PDF** generada en el servidor con `@react-pdf/renderer` y almacenada en Supabase Storage con acceso privado.
- **Historial de CVs** con visualización, descarga y eliminación.
- **Soporte multiidioma** (Español / Inglés) con `next-intl`.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Estilos | Tailwind CSS 4.2 |
| Autenticación | NextAuth.js v5 (beta) |
| Base de datos | Supabase (PostgreSQL) + RLS |
| ORM | Prisma 6 |
| IA | Claude API – `claude-sonnet-4-6` |
| PDF | `@react-pdf/renderer` (solo servidor) |
| Notificaciones | Sonner |
| Internacionalización | next-intl |
| Validación | Zod |
| Deploy | Vercel |

---

## Arquitectura del proyecto

```
smartapply/
├── app/
│   ├── (auth)/login/              — Página de login OAuth
│   ├── (dashboard)/
│   │   ├── layout.tsx             — Layout con Navbar
│   │   ├── dashboard/             — Métricas y actividad reciente
│   │   ├── profile/               — Formulario multi-paso del perfil
│   │   ├── generate/              — Generación y previsualización de CV
│   │   └── history/               — Historial de CVs generados
│   ├── api/
│   │   ├── auth/[...nextauth]/    — Handler de NextAuth
│   │   ├── profile/               — GET y PUT del perfil de usuario
│   │   ├── cv/generate/           — POST: genera CV con IA
│   │   ├── cv/score/              — POST: calcula score ATS
│   │   ├── cv/export/             — POST: genera PDF y retorna URL firmada
│   │   └── cv/[id]/               — GET y DELETE de un CV específico
│   ├── layout.tsx                 — Root layout con <Toaster />
│   └── page.tsx                   — Landing page pública
├── components/
│   ├── ui/                        — Componentes base reutilizables
│   ├── forms/ProfileForm.tsx      — Formulario de perfil multi-paso
│   ├── cv-templates/
│   │   ├── ClassicTemplate.tsx    — Template clásico (PDF + HTML preview)
│   │   ├── ModernTemplate.tsx     — Template moderno (PDF + HTML preview)
│   │   └── MinimalistTemplate.tsx — Template minimalista (PDF + HTML preview)
│   └── dashboard/
│       ├── Navbar.tsx             — Navegación con selector de idioma
│       ├── DashboardStats.tsx     — Tarjetas de métricas
│       ├── AtsScoreBar.tsx        — Barra visual del score ATS
│       └── CvHistoryCard.tsx      — Tarjeta del historial
├── lib/
│   ├── anthropic.ts               — Cliente Claude, prompts, callClaude(), cleanJson()
│   ├── prisma.ts                  — Cliente Prisma singleton
│   ├── env.ts                     — Validación de variables de entorno con Zod
│   ├── ats-scorer.ts              — Normalización y extracción de keywords
│   └── pdf-generator.ts           — Generación de PDF en servidor
├── types/
│   ├── profile.ts
│   ├── cv.ts
│   └── cv-template.ts
├── messages/
│   ├── es.json                    — Traducciones en español
│   └── en.json                    — Traducciones en inglés
├── i18n/request.ts                — Configuración de next-intl
├── middleware.ts                  — Protección de rutas del dashboard
├── prisma/schema.prisma
└── supabase/
    ├── rls-policies.sql
    └── storage-policies.sql
```

---

## Flujo principal del usuario

```
1. Login con Google o GitHub
        ↓
2. Completar perfil profesional (multi-paso)
   Datos personales → Experiencia → Educación → Habilidades → Idiomas → Certificaciones
        ↓
3. Ir a "Generar CV"
   - Pegar descripción de la vacante
   - Seleccionar plantilla (Classic / Modern / Minimalist)
   - Seleccionar idioma del CV (ES / EN)
        ↓
4. La app calcula SHA-256(profileId + jobDescription)
   ┌── Si existe en caché → retorna CV guardado
   └── Si no existe → llama a Claude API
        ↓
5. Claude API genera el CV adaptado (JSON)
   - Prioriza experiencia relevante
   - Integra keywords de la vacante
   - Respeta datos verídicos del usuario
        ↓
6. Se calcula el score ATS (segunda llamada a Claude)
   - Score 0–100
   - Keywords encontradas y faltantes
   - Sugerencias si score < 80
        ↓
7. CV y score se guardan en la base de datos
        ↓
8. El usuario visualiza el CV (preview HTML) y el score ATS
        ↓
9. Exportar PDF
   - Se genera el PDF en servidor con @react-pdf/renderer
   - Se sube a Supabase Storage (bucket `cvs`, carpeta privada por usuario)
   - Se retorna URL firmada con validez de 1 hora
        ↓
10. El CV queda guardado en el historial del usuario
```

---

## API Reference

### `POST /api/cv/generate`

Genera un CV adaptado a la vacante usando Claude API.

**Body:**
```json
{
  "jobDescription": "string (50–5000 caracteres)",
  "template": "classic | modern | minimalist",
  "language": "es | en"
}
```

**Respuesta exitosa:**
```json
{
  "cv": { ... },
  "cvId": "cuid",
  "fromCache": false
}
```

**Notas:**
- Requiere sesión activa.
- Requiere perfil completo del usuario en la base de datos.
- Aplica caché SHA-256 por par `(profileId, jobDescription)`.
- Calcula y guarda el score ATS automáticamente.

---

### `POST /api/cv/score`

Calcula el score ATS de un CV contra una descripción de vacante.

**Body:**
```json
{
  "cvContent": { ... },
  "jobDescription": "string"
}
```

**Respuesta exitosa:**
```json
{
  "score": 85,
  "foundKeywords": ["react", "typescript", "..."],
  "missingKeywords": ["graphql", "..."],
  "suggestions": ["..."]
}
```

---

### `POST /api/cv/export`

Genera el PDF del CV y retorna una URL firmada para descarga.

**Body:**
```json
{
  "cvId": "cuid",
  "template": "classic | modern | minimalist"
}
```

**Respuesta exitosa:**
```json
{
  "url": "https://supabase-signed-url... (válida 1 hora)"
}
```

---

### `GET /api/profile`

Retorna el perfil del usuario autenticado.

### `PUT /api/profile`

Crea o actualiza el perfil del usuario (upsert). Valida el body con Zod.

### `GET /api/cv/[id]`

Retorna un CV específico del usuario.

### `DELETE /api/cv/[id]`

Elimina un CV específico del usuario.

---

## Base de datos

El esquema Prisma tiene 6 modelos:

- **User** — datos del usuario OAuth (name, email, image).
- **Account** — tokens OAuth de los proveedores (Google, GitHub).
- **Session** — sesiones activas de NextAuth.
- **VerificationToken** — tokens de verificación de email.
- **Profile** — perfil profesional del usuario (experience, education, skills, languages son campos JSON).
- **CV** — CVs generados con su contenido, plantilla, score ATS, caché key y URL del PDF.

RLS (Row Level Security) está habilitado en todas las tablas de Supabase. Las operaciones del servidor usan `service_role` para saltarse el RLS de forma controlada.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Base de datos (Supabase Session Pooler, puerto 5432)
DATABASE_URL=
DIRECT_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# IA
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ Nunca commits el archivo `.env.local`. Está incluido en `.gitignore`.

---

## Instalación y desarrollo local

### Prerrequisitos

- Node.js 20+
- Una instancia de Supabase (con RLS y bucket `cvs` configurados)
- Credenciales OAuth de Google y GitHub
- API Key de Anthropic

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Aminsfnhdez/smartapply.git
cd smartapply

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local .env
# Editar .env.local .env con tus valores

# 4. Sincronizar el schema de Prisma con Supabase
npx prisma db push

# 5. Aplicar políticas RLS en Supabase
# Ejecutar el contenido de supabase/rls-policies.sql en el SQL Editor de Supabase
# Ejecutar el contenido de supabase/storage-policies.sql en el SQL Editor de Supabase

# 6. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Decisiones técnicas

| Decisión | Razón |
|---|---|
| Prisma 6 en lugar de 7 | Prisma 7 rompió en Windows por cambios en la configuración del datasource |
| Session Pooler de Supabase (puerto 5432) | El Transaction Pooler (6543) es incompatible con Prisma migrations |
| `i18n/request.ts` en lugar de `i18n.ts` | Ruta requerida por next-intl para resolver el módulo correctamente en build |
| `PDFViewer` no en el cliente | Causa error `su is not a function` con Turbopack/Next.js 16 — se generan previews HTML en cliente y PDF en servidor |
| System prompts en inglés | Mejor rendimiento de Claude; el idioma del CV se controla por el campo `outputLanguage` en el mensaje del usuario |
| `cleanJson()` centralizado | Claude frecuentemente envuelve las respuestas JSON en bloques markdown — se limpia antes de cada `JSON.parse()` |
| Sonner para notificaciones | Reemplaza todos los `alert()` nativos; configurado globalmente en `app/layout.tsx` |
| RLS + `service_role` en Prisma | Seguridad a nivel de base de datos sin bloquear las operaciones del servidor |
| Caché SHA-256 por par perfil+vacante | Evita llamadas redundantes a la Claude API para combinaciones idénticas |
