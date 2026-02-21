// Frontend functionality: fetches API, renders UI, handles create/edit/delete, filters, and theme
const api = {
  list: (q = '') => fetch('/api/recipes' + q).then(r => r.json()),
  create: (data) => fetch('/api/recipes', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()),
  update: (id,data) => fetch('/api/recipes/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>r.json()),
  del: (id) => fetch('/api/recipes/'+id,{method:'DELETE'}).then(r=>r.json()),
  toggleFav: (id) => fetch('/api/recipes/'+id+'/favorite',{method:'PUT'}).then(r=>r.json()),
  analytics: () => fetch('/api/analytics').then(r=>r.json())
};

// Simple DOM helpers
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

// Views and UI elements
const views = { dashboard: $('#dashboardView'), recipes: $('#recipesView'), favorites: $('#favoritesView') };
const recipeList = $('#recipeList');
const allRecipes = $('#allRecipes');
const favList = $('#favList');
const statsNode = $('#stats');
const searchInput = $('#search');
const filterDifficulty = $('#filterDifficulty');
const filterTime = $('#filterTime');
const toggleThemeBtn = $('#toggleTheme');

let editingId = null;

function setView(name){
  Object.keys(views).forEach(k=>views[k].classList.toggle('hidden', k!==name));
  document.querySelectorAll('.sidebar button').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
}

// Render a recipe card
function renderCard(recipe){
  const div = document.createElement('div'); div.className='item';
  const img = document.createElement('img'); img.src = recipe.image || 'https://via.placeholder.com/400x240?text=Recipe';
  const h = document.createElement('h4'); h.textContent = recipe.title;
  const meta = document.createElement('div'); meta.className='meta'; meta.textContent = `${recipe.time} min · ${recipe.difficulty}`;
  const ing = document.createElement('div'); ing.className='meta'; ing.textContent = recipe.ingredients.join(', ');
  const actions = document.createElement('div'); actions.className='actions';
  const favBtn = document.createElement('button'); favBtn.textContent = recipe.favorite ? '★' : '☆';
  favBtn.onclick = async ()=>{ await api.toggleFav(recipe._id); load(); }
  const editBtn = document.createElement('button'); editBtn.textContent = 'Edit'; editBtn.onclick = ()=>openForm(recipe);
  const delBtn = document.createElement('button'); delBtn.textContent = 'Delete'; delBtn.onclick = async ()=>{ if(confirm('Delete recipe?')){ await api.del(recipe._id); load(); }}
  actions.append(favBtn, editBtn, delBtn);
  div.append(img,h,meta,ing,actions);
  return div;
}

// Load lists and analytics
async function load(){
  const q = buildQuery();
  const recipes = await api.list(q);
  const favs = recipes.filter(r=>r.favorite);
  // Render recent
  recipeList.innerHTML=''; recipes.slice(0,6).forEach(r=>recipeList.append(renderCard(r)));
  // Render all
  allRecipes.innerHTML=''; recipes.forEach(r=>allRecipes.append(renderCard(r)));
  // Render favorites
  favList.innerHTML=''; favs.forEach(r=>favList.append(renderCard(r)));
  // Analytics
  const a = await api.analytics();
  statsNode.innerHTML = `
    <div class="stat"><strong>${a.total}</strong><div class="meta">Total recipes</div></div>
    <div class="stat"><strong>${a.avgTime} min</strong><div class="meta">Avg cooking time</div></div>
    <div class="stat"><strong>${a.quick}</strong><div class="meta">Quick recipes (&le;15m)</div></div>
  `;
}

function buildQuery(){
  const params = new URLSearchParams();
  const q = searchInput.value.trim(); if(q) params.set('q', q);
  const ing = q; // search engine expects q or ingredient
  if(filterDifficulty.value) params.set('difficulty', filterDifficulty.value);
  if(filterTime.value) params.set('maxTime', filterTime.value);
  return params.toString() ? '?' + params.toString() : '';
}

// Modal/form handling
const modal = $('#modal');
const recipeForm = $('#recipeForm');
const modalTitle = $('#modalTitle');

function openForm(recipe){
  modal.classList.remove('hidden');
  modalTitle.textContent = recipe ? 'Edit Recipe' : 'Add Recipe';
  recipeForm.title.value = recipe?.title || '';
  recipeForm.image.value = recipe?.image || '';
  recipeForm.time.value = recipe?.time || '';
  recipeForm.difficulty.value = recipe?.difficulty || 'Easy';
  recipeForm.ingredients.value = recipe ? recipe.ingredients.join(', ') : '';
  recipeForm.steps.value = recipe ? recipe.steps.join('; ') : '';
  editingId = recipe?._id || null;
}

function closeForm(){ modal.classList.add('hidden'); editingId = null; recipeForm.reset(); }

recipeForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = {
    title: recipeForm.title.value,
    image: recipeForm.image.value,
    time: Number(recipeForm.time.value) || 0,
    difficulty: recipeForm.difficulty.value,
    ingredients: recipeForm.ingredients.value.split(',').map(s=>s.trim()).filter(Boolean),
    steps: recipeForm.steps.value.split(';').map(s=>s.trim()).filter(Boolean)
  };
  if(editingId){ await api.update(editingId, data); } else { await api.create(data); }
  closeForm(); load();
});

$('#cancelBtn').addEventListener('click', closeForm);

// UI wiring
document.querySelectorAll('.sidebar button').forEach(b => b.addEventListener('click', ()=>setView(b.dataset.view)));
$('#openAdd').addEventListener('click', ()=>openForm(null));
searchInput.addEventListener('input', ()=>debounce(load, 250)());
filterDifficulty.addEventListener('change', load);
filterTime.addEventListener('change', load);

// Theme toggle (persist in localStorage)
function setTheme(dark){
  if(dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
  toggleThemeBtn.textContent = dark ? 'Light' : 'Dark';
  localStorage.setItem('dark', dark ? '1' : '0');
}
toggleThemeBtn.addEventListener('click', ()=>setTheme(!document.documentElement.classList.contains('dark')));
setTheme(localStorage.getItem('dark') === '1');

// Debounce helper
function debounce(fn, ms){ let t; return () => { clearTimeout(t); t = setTimeout(fn, ms);} }

// Initialize app
load();
