
let NAV_ITEMS = [];
async function loadIndex(){
  if(NAV_ITEMS.length) return NAV_ITEMS;
  try{
    const res = await fetch('/data/nav.json', {cache:'no-store'});
    const data = await res.json();
    NAV_ITEMS = data.items || [];
  }catch(e){ console.error(e); }
  return NAV_ITEMS;
}

function scoreItem(item, qTokens){
  // Simple scoring: +3 for title token match, +2 for tag match, +1 for summary/token in url
  // Bonus for exact phrase in title
  let s = 0;
  const t = (item.title||'').toLowerCase();
  const url = (item.url||'').toLowerCase();
  const tags = (item.tags||[]).map(x=>String(x).toLowerCase());
  const sum = (item.summary||'').toLowerCase();
  const phrase = qTokens.join(' ');
  if(t.includes(phrase)) s += 5;
  for(const tok of qTokens){
    if(!tok) continue;
    if(t.includes(tok)) s += 3;
    if(tags.some(tag=>tag.includes(tok))) s += 2;
    if(sum.includes(tok)) s += 2;
    if(url.includes(tok)) s += 1;
  }
  return s;
}

function renderResults(results, container){
  container.innerHTML = '';
  if(!results.length){
    container.innerHTML = '<div role="status" aria-live="polite">No results.</div>';
    return;
  }
  const ul = document.createElement('ul');
  ul.style.listStyle='none'; ul.style.margin='0'; ul.style.padding='0';
  for(const r of results.slice(0, 12)){
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = r.url;
    a.textContent = r.title;
    a.setAttribute('role','link');
    a.style.display='block';
    a.style.padding='.5rem .5rem';
    a.style.border='1px solid var(--border)';
    a.style.borderRadius='10px';
    a.style.margin='.25rem 0';
    li.appendChild(a);

    const small = document.createElement('div');
    small.textContent = r.summary || '';
    small.style.color='var(--muted)';
    small.style.fontSize='.875rem';
    small.style.margin='0 0 .25rem .5rem';
    li.appendChild(small);

    ul.appendChild(li);
  }
  container.appendChild(ul);
}

function setupSearch(){
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if(!input || !results) return;

  input.addEventListener('input', async (e)=>{
    const q = String(e.target.value||'').trim().toLowerCase();
    if(!q){ results.innerHTML=''; return; }
    const items = await loadIndex();
    const qTokens = q.split(/\s+/);
    const scored = items.map(it=>({ ...it, _score: scoreItem(it, qTokens) }))
                        .filter(it=>it._score>0)
                        .sort((a,b)=>b._score-a._score);
    renderResults(scored, results);
  });

  // Keyboard: ESC clears
  input.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ input.value=''; results.innerHTML=''; input.blur(); }
  });
}

document.addEventListener('DOMContentLoaded', setupSearch);
