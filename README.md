<p align="center">
  <img width="254" height="254" alt="logoByN" src="https://github.com/user-attachments/assets/3b21f2cc-b4f7-4ef9-9387-b5f03b1d7a27" />
</p>

<h1 align="center">🌋 CanaryRoutes</h1>

<p align="center">
  <b>Plataforma turística para descubrir las Islas Canarias</b><br/>
  Mapas interactivos · Puntos de interés ·  Contenido SEO en 3 idiomas
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Pages" />
  <img src="https://img.shields.io/badge/Built_with-Claude_AI-8A63D2?style=for-the-badge&logo=anthropic&logoColor=white" alt="Built with Claude" />
</p>

<p align="center">
  <a href="https://canary-routes.com"><img src="https://img.shields.io/badge/🔗_DEMO_EN_VIVO-canary--routes.com-1a73e8?style=for-the-badge" alt="Demo en vivo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🇪🇸_ES-turquoise?style=flat-square" />
  <img src="https://img.shields.io/badge/🇬🇧_EN-turquoise?style=flat-square" />
  <img src="https://img.shields.io/badge/🇩🇪_DE-turquoise?style=flat-square" />
  <img src="https://img.shields.io/badge/POIs-190%2B-2ea86e?style=flat-square" />
  <img src="https://img.shields.io/badge/Islas-Tenerife_%7C_Gran_Canaria-2090c0?style=flat-square" />
</p>

---

## <img width="2016" height="1778" alt="image" src="https://github.com/user-attachments/assets/e9fd1057-e600-44e7-8880-bda501023e1d" />

---

## 🗺️ Índice

- [¿Qué es CanaryRoutes?](#-qué-es-canaryroutes)
- [Vibe coding con criterio de producto](#-cómo-se-ha-construido-vibe-coding-con-criterio-de-producto)
- [¿Qué demuestra este proyecto?](#-qué-demuestra-este-proyecto)
- [Stack tecnológico](#-stack-tecnológico)
- [Funcionalidades](#-funcionalidades-implementadas)
- [Retos técnicos resueltos](#-retos-técnicos-resueltos)
- [Arquitectura](#-arquitectura-del-proyecto)
- [Cómo ejecutar en local](#-cómo-ejecutar-en-local)
- [Contacto](#-contacto)

---

## 🏝️ ¿Qué es CanaryRoutes?

CanaryRoutes **no es un blog de viajes más**: es un producto pensado como alternativa enfocada 100% a Canarias frente a plataformas como Google Travel, GetYourGuide o Roadtrippers. La experiencia gira en torno a tres pilares:

| 🗺️ Mapa interactivo | 📍 Puntos de interés | 💰 Afiliación editorial |
|:---:|:---:|:---:|
| Eje central de navegación, no un listado de artículos | +190 POIs con datos ricos, dificultad, audioguías | GetYourGuide y DiscoverCars integrados sin ser intrusivos |

---

## 🤖 Cómo se ha construido: vibe coding con criterio de producto

Este proyecto es un ejercicio deliberado de **desarrollo asistido por IA con rol de product owner**, no de *"copiar y pegar código generado"*.

```
🧠 Yo decido  →  producto, UX, monetización, prioridades, reglas del sistema
🤖 Claude ejecuta →  implementación técnica, contenido, iteración rápida
🔍 Yo reviso   →  cada cambio se valida antes de aceptarse
```

- 📄 **Especificación viva del producto**: un `CLAUDE.md` en la raíz del repo actúa como brief permanente — filosofía de producto, prioridades (*SEO > UX > estética* cuando hay conflicto), paleta de marca y **reglas estrictas de integridad de datos** que la IA debe cumplir siempre (nunca inventar POIs, nunca generar enlaces internos rotos, mapeo canónico de categorías).
- 🎯 **Las decisiones de producto son mías**: qué monetizar y cómo, qué estructura evita canibalización SEO entre idiomas, qué UX prioriza conversión sin parecer publicidad agresiva.
- ✅ **La IA ejecuta, yo valido**: cada guía editorial, cada componente y cada cambio de arquitectura se revisa comprobando consistencia de datos, tipado estricto y que nada existente se rompe.
- 🌍 **Contenido SEO a escala controlada**: guías editoriales (*"qué ver en Tenerife"*, *"calendario de romerías en Gran Canaria"*...) generadas con IA en 3 idiomas, con validación automática de que cada enlace interno apunta a un POI real y a su categoría correcta — evitando el típico problema de contenido IA con enlaces rotos o inventados.

---

## 👨‍💻 ¿Qué demuestra este proyecto?

- ✅ Liderazgo de producto de principio a fin (arquitectura, contenido, SEO, monetización, diseño)
- ✅ App Router de Next.js 15 con Server Components por defecto
- ✅ TypeScript estricto con modelado de dominio propio (`POI`, `Route`, `GuideHub`, `Municipio`...)
- ✅ Internacionalización real (no solo strings): slugs localizados, hreflang, canonicals por idioma
- ✅ SEO técnico completo: SSR/SSG, metadata dinámica, JSON-LD, sitemap automática, robots.txt
- ✅ Arquitectura de contenido tipo *headless CMS ligero* sobre JSON versionado en el repo
- ✅ Sistema de validación de contenido pre-build (integridad de datos, categorías, enlaces)
- ✅ Componente de mapa interactivo propio (~1.900 líneas) con clustering y filtros
- ✅ Diseño responsive mobile-first con Tailwind CSS y Framer Motion
- ✅ Gestión de consentimiento de cookies y páginas legales (RGPD-friendly)
- ✅ Uso maduro y crítico de IA generativa como herramienta de desarrollo y contenido

---

## 🛠 Stack Tecnológico

| Tecnología | Uso |
|---|---|
| ⚫ **Next.js 15** | Framework fullstack — App Router, Server Components, SSR/SSG |
| ⚛️ **React 19** | UI declarativa y componentes reutilizables |
| 🔷 **TypeScript** | Tipado estático estricto en todo el dominio |
| 🎨 **Tailwind CSS** | Diseño responsive mobile-first |
| 🎬 **Framer Motion** | Animaciones e interacciones fluidas |
| 🛡️ **Zod** | Validación de esquemas de datos |
| ☁️ **Cloudflare Pages** | Hosting y despliegue continuo |
| 🧩 **JSON tipado** | Capa de contenido versionada (sin CMS externo) |
| 🤖 **Claude (Anthropic)** | Copiloto de desarrollo, contenido SEO y arquitectura bajo dirección de producto |

---

## ✨ Funcionalidades implementadas

### 🗺️ Exploración de las islas
- Mapa interactivo con **clustering** y navegación por categorías (playas, senderos, cultura, naturaleza, actividades, transporte)
- Fichas de POI con imágenes, dificultad, duración, coordenadas y créditos de licencia

### 📝 Contenido y SEO
- Guías editoriales (*qué ver*, *mejores playas*, *calendarios de fiestas*) en **ES / EN / DE**
- Slugs localizados por idioma y por isla (`/es/rutas/`, `/en/routes/`, `/de/routen/`)
- `hreflang`, canonicals, JSON-LD (`Article`, `FAQPage`, `Breadcrumb`), sitemap automática


### ⚖️ Cumplimiento y calidad
- Aviso legal, política de cookies, privacidad y condiciones con gestión de consentimiento
- Scripts de **validación de contenido** (`validate-content.ts`) ejecutados antes de cada build

---

## 📚 Retos técnicos resueltos

### 🧩 Contenido sin CMS con integridad garantizada
El contenido vive como JSON tipado en el propio repo. Para evitar el problema típico de contenido generado por IA (POIs inventados, enlaces internos rotos o categorías incorrectas), se diseñó un sistema de reglas + validación automática que verifica, antes de cada build, que cada referencia interna apunta a un recurso real y a su categoría canónica.

### 🌍 SEO multiidioma sin canibalización
Cada guía editorial existe en ES/EN/DE con **slugs localizados** propios y comparte una categoría editorial común para poder generar el `hreflang` correcto entre versiones, evitando contenido duplicado o mal enlazado entre idiomas.

### 🗺️ Mapa interactivo a medida
Componente propio de ~1.900 líneas que gestiona clustering de marcadores, filtros por categoría y estados de interacción, priorizando rendimiento en móvil sobre librerías de mapas genéricas más pesadas.

### 🤖 Un contrato de reglas para la IA, no solo un prompt
`CLAUDE.md` funciona como un contrato técnico-editorial: define qué puede y qué no puede hacer la IA (no inventar datos, no romper contenido existente, respetar mapeos canónicos de categorías), permitiendo escalar la generación de contenido sin perder control de calidad.

---

## 📂 Arquitectura del proyecto

```
canaryroutes/
├── CLAUDE.md                    # Especificación de producto y reglas para el desarrollo asistido por IA
├── docs/                        # Documentación interna (licencias de imagen, etc.)
└── web/
    ├── app/[locale]/[island]/   # Rutas dinámicas por idioma e isla (Next.js App Router)
    ├── components/              # Mapa, carrito, carruseles, widgets de afiliación, fichas de POI...
    ├── content/{es,en,de}/{isla}/  # POIs, rutas y guías editoriales por idioma e isla
    ├── lib/                     # Tipos, i18n, categorías, carga de contenido
    └── scripts/                 # Validación de contenido y utilidades de build
```
