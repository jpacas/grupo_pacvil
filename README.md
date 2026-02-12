# grupo_pacvil

Planeación y MVP inicial del sitio web estático de Grupo Pacvil.

## Documentos
- `PLAN.md` — estrategia general
- `SITEMAP.md` — estructura del sitio
- `LEADS.md` — formulario y calificación de leads
- `ROADMAP.md` — plan 30/60/90 días
- `BRAND.md` — lineamientos de marca/copy

## MVP estático
Carpeta: `site/`

Páginas incluidas:
- `index.html`
- `nosotros.html`
- `inversiones.html`
- `equipo.html`
- `blog.html`
- `propuesta.html`
- `contacto.html`
- `legal.html`

## Ver en local
Desde `grupo_pacvil/`:

```bash
python3 -m http.server 8080
```

Abrir:
`http://localhost:8080/site/`

## Publicar en el blog (guia rapida)
- Duplica `site/blog/posts/template.html`
- Cambia titulo, fecha y contenido
- Agrega el enlace en `site/blog/index.html`

## Actualizar sitemap (script)
Para mantener el sitemap al dia cuando publicas un post:

```bash
scripts/update_sitemap.py --post site/blog/posts/AAAA-MM-DD-mi-post.html
```

Para forzar `lastmod` en todas las URLs:

```bash
scripts/update_sitemap.py --all
```
