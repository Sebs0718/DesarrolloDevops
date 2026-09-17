# 🚀 Proyecto de Desarrollo Web con GitHub Actions

[![Deploy a GitHub Pages](https://github.com/Sebs0718/DesarrolloDevops/actions/workflows/deploy.yml/badge.svg)](https://github.com/Sebs0718/DesarrolloDevops/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Proyecto sencillo para aprender a desplegar aplicaciones web automáticamente en **GitHub Pages** usando **GitHub Actions**.

🌐 **Enlace de la Web en Producción:**  
👉 [https://sebs0718.github.io/DesarrolloDevops/](https://sebs0718.github.io/DesarrolloDevops/)

---

## 📁 Estructura del Proyecto

```
DesarrolloDevops/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow automatizado de GitHub Actions
├── src/                        # Código de tu aplicación web
│   ├── index.html              # Página principal
│   ├── css/
│   │   └── styles.css          # Estilos visuales
│   └── js/
│       └── app.js              # Lógica JavaScript
└── package.json                # Configuración del proyecto
```

---

## 🔄 ¿Cómo funciona el Despliegue Automatizado?

Cada vez que haces `git push` a la rama `main` o `develop`:

1. **GitHub Actions** enciende un servidor en la nube (`ubuntu-latest`).
2. **Descarga tu código** con `actions/checkout@v4`.
3. **Publica la carpeta `src/` en GitHub Pages** con `peaceiris/actions-gh-pages@v4`.

---

## ⚙️ Configuración Única en GitHub (Para que funcione el deploy)

Para permitir que GitHub Actions pueda publicar en tu repositorio:

1. Ve a tu repositorio en GitHub: `https://github.com/Sebs0718/DesarrolloDevops`
2. Haz clic en **Settings** (Configuración) ➔ pestaña lateral **Actions** ➔ **General**.
3. Baja hasta la sección **Workflow permissions** y selecciona:  
   🔘 **Read and write permissions**
4. Haz clic en **Save**.

5. Luego ve a **Settings** ➔ pestaña lateral **Pages**:
   - En **Build and deployment** ➔ **Source**, asegúrate de que la rama seleccionada sea **`gh-pages`** con la carpeta `/ (root)`. *(Esta rama se crea automáticamente en el primer despliegue)*.

---

## 🚀 Cómo subir cambios

```bash
git add .
git commit -m "feat: actualizar diseño y contenido"
git push origin develop
```
