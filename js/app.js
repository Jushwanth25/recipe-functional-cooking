// Frontend-only functionality using localStorage as data store
const storageKey = 'recipes_v1';

// Default sample data if none exists
const defaultRecipes = [
  { _id: 'r1', title: 'Spaghetti Aglio e Olio', image: '', time: 20, difficulty: 'Easy', ingredients: ['spaghetti','garlic','olive oil','chili flakes'], steps: ['Boil pasta','Saute garlic','Toss together'], favorite: false, createdAt: Date.now()-100000 },
  { _id: 'r2', title: 'Tomato Soup', image: '', time: 35, difficulty: 'Medium', ingredients: ['tomato','onion','garlic','cream'], steps: ['Roast tomatoes','Blend','Simmer'], favorite: true, createdAt: Date.now()-50000 },
  { _id: 'r3', title: 'Quick Pancakes', image: '', time: 15, difficulty: 'Easy', ingredients: ['flour','milk','egg','sugar'], steps: ['Mix','Cook on pan'], favorite: false, createdAt: Date.now()-20000 }
];

function loadFromStorage(){
  try{
    const raw = localStorage.getItem(storageKey);
    if(!raw){ localStorage.setItem(storageKey, JSON.stringify(defaultRecipes)); return structuredClone(defaultRecipes); }
    return JSON.parse(raw);
  }catch(e){ console.error('read error', e); return [] }
}

function saveToStorage(list){
  localStorage.setItem(storageKey, JSON.stringify(list));
}

const api = {
  list: (q='') => new Promise(res => {
    const items = loadFromStorage();
    if(!q) return res(items.sort((a,b)=>b.createdAt - a.createdAt));
    const params = new URLSearchParams(q.replace(/^\?/, ''));
    let out = items.slice();
    const qq = params.get('q');
    if(qq){ const s = qq.toLowerCase(); out = out.filter(r=> r.title.toLowerCase().includes(s) || r.ingredients.join(' ').toLowerCase().includes(s)); }
    if(params.get('difficulty')) out = out.filter(r=> r.difficulty === params.get('difficulty'));
    if(params.get('maxTime')) out = out.filter(r=> r.time <= Number(params.get('maxTime')));
    res(out.sort((a,b)=>b.createdAt - a.createdAt));
  }),
  create: (data) => new Promise(res => {
    const items = loadFromStorage();
    const id = 'r' + Date.now() + Math.floor(Math.random()*1000);
    const doc = Object.assign({ _id: id, favorite: false, createdAt: Date.now() }, data);
    items.push(doc); saveToStorage(items); res(doc);
  }),
  update: (id,data) => new Promise(res => {
    const items = loadFromStorage(); const idx = items.findIndex(r=>r._id===id);
    if(idx===-1) return res(null);
    items[idx] = Object.assign(items[idx], data); saveToStorage(items); res(items[idx]);
  }),
  del: (id) => new Promise(res => {
    let items = loadFromStorage(); items = items.filter(r=>r._id!==id); saveToStorage(items); res({ ok: true });
  }),
  toggleFav: (id) => new Promise(res => {
    const items = loadFromStorage(); const it = items.find(r=>r._id===id); if(!it) return res(null); it.favorite = !it.favorite; saveToStorage(items); res(it);
  }),
  analytics: () => new Promise(res => {
    const items = loadFromStorage();
    const total = items.length;
    const avgTime = total ? Math.round(items.reduce((s,r)=>s + (r.time||0),0) / total) : 0;
    const quick = items.filter(r=> (r.time||0) <= 15).length;
    res({ total, avgTime, quick });
  })
};

// Export / Import helpers
function exportData(){
  const data = localStorage.getItem(storageKey) || '[]';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'recipes-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function importDataFile(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try{
        const parsed = JSON.parse(r.result);
        if(!Array.isArray(parsed)) return reject(new Error('Invalid format'));
        saveToStorage(parsed);
        resolve(parsed);
      }catch(e){ reject(e); }
    };
    r.onerror = () => reject(new Error('File read error'));
    r.readAsText(file);
  });
}

function readFileAsDataURL(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(new Error('file read')); r.readAsDataURL(file);
  });
}

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
  // If user provided a file, prefer that (store as data URL)
  const file = document.getElementById('imageFile').files[0];
  if(file){ try{ data.image = await readFileAsDataURL(file); }catch(e){ console.warn('image load failed', e); }}
  if(editingId){ await api.update(editingId, data); } else { await api.create(data); }
  closeForm(); load();
});

$('#cancelBtn').addEventListener('click', closeForm);

// UI wiring
document.querySelectorAll('.sidebar button').forEach(b => b.addEventListener('click', (ev)=>{ location.hash = '#/' + b.dataset.view; }));
$('#openAdd').addEventListener('click', ()=>openForm(null));
searchInput.addEventListener('input', ()=>debounce(load, 250)());
filterDifficulty.addEventListener('change', load);
filterTime.addEventListener('change', load);

// Export / Import wiring
$('#exportBtn').addEventListener('click', exportData);
$('#importBtn').addEventListener('click', ()=>$('#importFile').click());
$('#importFile').addEventListener('change', async (e)=>{
  const f = e.target.files[0]; if(!f) return; try{ await importDataFile(f); load(); alert('Import successful'); }catch(err){ alert('Import failed: ' + err.message); }
  e.target.value = '';
});

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
// Hash routing: keep view in sync with URL
function syncFromHash(){
  const h = (location.hash || '#/dashboard').replace('#/','');
  const view = (h === '' ? 'dashboard' : h.split('/')[0]);
  setView(view);
}
window.addEventListener('hashchange', syncFromHash);
syncFromHash();
load();
