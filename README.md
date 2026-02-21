# Recipe Functional Cooking (Frontend-only)

This project is now a frontend-only single-page app that stores recipes in `localStorage`.

Preview

- Open `index.html` in your browser (double-click or use a static server).

Optional: run a quick static server (recommended for routing support):

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000/
```

Features added in the upgrade

- UI polish and accessibility improvements
- Image upload support (stored as data URLs)
- Import/export JSON (backup and restore)
- Hash-based routing for deep links (e.g. `#/recipes`, `#/favorites`)

Notes

- Recipes are stored under the `localStorage` key `recipes_v1`.
- Export downloads a `recipes-export.json` file. Import replaces stored recipes with the uploaded JSON.
- Some empty backend folders may remain (`config/`, `models/`, `routes/`, `seed/`) — safe to delete if not needed.
