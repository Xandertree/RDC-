async function loadData(){
  const res = await fetch('./data/sample_listings.json', {cache:'no-store'});
  return await res.json();
}

function money(n){
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

function pct(n){
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return (n*100).toFixed(1) + '%';
}

function dealRatio(item, includeFeesAndTransport){
  const base = item.price ?? 0;
  const fees = includeFeesAndTransport ? (item.fees_est ?? 0) : 0;
  const transport = includeFeesAndTransport ? (item.transport_buffer ?? 0) : 0;
  const cost = base + fees + transport;
  const fmv = item.fmv ?? 0;
  if (!fmv) return null;
  return cost / fmv;
}

function textMatch(item, q){
  if (!q) return true;
  const hay = [
    item.source, item.state, item.city,
    item.year, item.make, item.model, item.trim,
    item.title, item.damage, item.id
  ].join(' ').toLowerCase();
  return hay.includes(q.toLowerCase());
}

function passesFilters(item, f){
  if (f.state !== 'ALL' && item.state !== f.state) return false;
  if (f.source !== 'Both' && item.source !== f.source) return false;
  if (f.cleanTitleOnly && (item.title || '').toLowerCase() !== 'clean') return false;

  // Normal wear check: exact or includes "normal wear"
  if (f.normalWearOnly){
    const d = (item.damage || '').toLowerCase();
    if (!d.includes('normal wear')) return false;
  }

  if (f.priceMax && item.price > f.priceMax) return false;
  if (f.milesMax && item.miles > f.milesMax) return false;
  if (!textMatch(item, f.q)) return false;

  const r = dealRatio(item, f.includeFeesAndTransport);
  if (r === null) return false;
  if (r > (f.dealMax/100)) return false;

  return true;
}

function render(items, f){
  const cards = document.getElementById('cards');
  const count = document.getElementById('count');
  const meta = document.getElementById('meta');

  const filtered = items
    .map(it => ({...it, _deal: dealRatio(it, f.includeFeesAndTransport)}))
    .filter(it => passesFilters(it, f))
    .sort((a,b) => (a._deal ?? 9) - (b._deal ?? 9));

  count.textContent = filtered.length + ' match(es)';
  meta.textContent = 'Updated: ' + new Date().toLocaleString();

  cards.innerHTML = '';
  if (!filtered.length){
    cards.innerHTML = '<div class="panel" style="grid-column:1/-1;">No matches. Loosen filters or load more inventory.</div>';
    return;
  }

  for (const it of filtered){
    const cost = (it.price ?? 0) + (f.includeFeesAndTransport ? ((it.fees_est ?? 0) + (it.transport_buffer ?? 0)) : 0);
    const deal = it._deal;
    const dealClass = deal <= 0.5 ? 'good' : 'bad';

    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${it.img || 'https://placehold.co/640x360?text=Vehicle'}" alt="">
      <div class="body">
        <div class="headline">
          <div>
            <div class="h1">${it.year} ${it.make} ${it.model} ${it.trim || ''}</div>
            <div class="muted">${it.city}, ${it.state} • ${it.source} • ${it.miles?.toLocaleString?.() || it.miles} mi</div>
          </div>
          <div class="pill ${dealClass}">${pct(deal)}</div>
        </div>

        <div class="pills">
          <span class="pill">Title: ${it.title}</span>
          <span class="pill">Damage: ${it.damage}</span>
          <span class="pill">ID: ${it.id}</span>
        </div>

        <div class="kpis">
          <div class="kpi">
            <div class="k">Auction price</div>
            <div class="v">${money(it.price)}</div>
          </div>
          <div class="kpi">
            <div class="k">All-in cost</div>
            <div class="v">${money(cost)}</div>
          </div>
          <div class="kpi">
            <div class="k">FMV (comps)</div>
            <div class="v">${money(it.fmv)}</div>
          </div>
        </div>

        <a class="btn" href="${it.url}" target="_blank" rel="noreferrer">Open lot</a>
      </div>
    `;
    cards.appendChild(el);
  }
}

function getFilters(){
  const source = document.getElementById('source').value;
  const state = document.getElementById('state').value;
  const dealMax = Number(document.getElementById('dealMax').value || 50);
  const priceMax = Number(document.getElementById('priceMax').value || 0) || null;
  const milesMax = Number(document.getElementById('milesMax').value || 0) || null;
  const q = document.getElementById('q').value.trim();

  const cleanTitleOnly = document.getElementById('cleanTitleOnly').checked;
  const normalWearOnly = document.getElementById('normalWearOnly').checked;
  const includeFeesAndTransport = document.getElementById('includeFeesAndTransport').checked;

  return {source, state, dealMax, priceMax, milesMax, q, cleanTitleOnly, normalWearOnly, includeFeesAndTransport};
}

function reset(){
  document.getElementById('source').value = 'Both';
  document.getElementById('state').value = 'CA';
  document.getElementById('dealMax').value = 50;
  document.getElementById('priceMax').value = '';
  document.getElementById('milesMax').value = '';
  document.getElementById('q').value = '';
  document.getElementById('cleanTitleOnly').checked = true;
  document.getElementById('normalWearOnly').checked = true;
  document.getElementById('includeFeesAndTransport').checked = true;
}

async function main(){
  const items = await loadData();
  const f = getFilters();
  render(items, f);

  const controls = ['source','state','dealMax','priceMax','milesMax','q','cleanTitleOnly','normalWearOnly','includeFeesAndTransport'];
  controls.forEach(id => {
    document.getElementById(id).addEventListener('input', () => render(items, getFilters()));
    document.getElementById(id).addEventListener('change', () => render(items, getFilters()));
  });

  document.getElementById('reset').addEventListener('click', () => { reset(); render(items, getFilters()); });
  document.getElementById('refresh').addEventListener('click', async () => {
    const fresh = await loadData();
    render(fresh, getFilters());
  });
}

main();
