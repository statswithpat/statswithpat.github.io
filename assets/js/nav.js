
async function loadNav(){
  const res = await fetch('/data/nav.json', {cache:'no-store'}).catch(()=>null);
  if(!res || !res.ok){ console.error('nav.json not found'); return []; }
  const data = await res.json();
  return data.items || [];
}

function groupByCategory(items){
  const map = new Map();
  for(const it of items){
    const cat = it.category || 'Other';
    if(!map.has(cat)) map.set(cat, []);
    map.get(cat).push(it);
  }
  return map;
}

function makeNavList(container, grouped){
  container.innerHTML = '';
  for(const [cat, items] of grouped){
    const h = document.createElement('h2');
    h.textContent = cat;
    container.appendChild(h);
    const ul = document.createElement('ul');
    for(const it of items){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = it.url;
      a.textContent = it.title;
      if(window.location.pathname.endsWith(it.url)) a.setAttribute('aria-current', 'page');
      li.appendChild(a); ul.appendChild(li);
    }
    container.appendChild(ul);
  }
}

function setupMobileToggle(){
  const btn = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  if(!btn || !sidebar) return;
  btn.addEventListener('click', ()=>{
    const open = sidebar.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    if(open){ sidebar.querySelector('input, a, button')?.focus(); }
  });
}

function setupThemeToggle(){
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  const key = 'swp-theme';
  function apply(val){
    document.documentElement.dataset.theme = val;
    btn.setAttribute('aria-pressed', String(val === 'dark'));
  }
  const stored = localStorage.getItem(key);
  if(stored){ apply(stored); }
  btn.addEventListener('click', ()=>{
    const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(key, current); apply(current);
  });
}

document.addEventListener('DOMContentLoaded', async ()=>{
  setupMobileToggle();
  setupThemeToggle();
  const items = await loadNav();
  const grouped = groupByCategory(items);
  const navContainer = document.getElementById('navContainer');
  if(navContainer) makeNavList(navContainer, grouped);
});
