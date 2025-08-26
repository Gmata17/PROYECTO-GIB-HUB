/**
 * app.js - CRUD + Analytics con AJAX (Axios)
 * - Forms generan payloads similares a los ejemplos solicitados:
 *   - brands: { country, founded: {"$numberInt":"2015"}, name }
 *   - clothing: { brand_id, category, color, in_stock: {"$numberInt":"150"}, name, price: {"$numberDouble":"89.95"}, size: [...] }
 *   - sales: { user_id, clothing_id, quantity: {"$numberInt":"2"}, date: {"$date":{"$numberLong":"..."} } }
 *   - users: { address: { city, country }, email, name, orders: [], password }
 *
 * - También incluye selects dinámicos: marcas en prenda, usuarios y prendas en venta.
 * - Paginación cliente: 10 items por página.
 */

const BASE_API = 'http://127.0.0.1:5000/api/v1/admin';
const URLS = {
  brands: `${BASE_API}/brands`,
  clothing: `${BASE_API}/clothing`,
  users: `${BASE_API}/users`,
  sales: `${BASE_API}/sales`,
  reports: `${BASE_API}/reports`
};
const PER_PAGE = 10;

/* helpers */
const $ = id => document.getElementById(id);
const show = el => { if(el) el.style.display = 'block'; };
const hide = el => { if(el) el.style.display = 'none'; };
const escapeHtml = s => s == null ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const toEpochMsFromDateInput = (dateInputValue) => {
  if(!dateInputValue) return Date.now();
  const d = new Date(dateInputValue + 'T00:00:00Z');
  return d.getTime();
};
const safeText = v => v == null ? '' : String(v);

/* axios wrappers */
async function apiGet(url){ return (await axios.get(url)).data; }
async function apiPost(url, data){ return (await axios.post(url, data)).data; }
async function apiPut(url, data){ return (await axios.put(url, data)).data; }
async function apiDelete(url){ return (await axios.delete(url)).data; }

/* smart endpoint helpers (/:id or ?id=) */
async function apiGetSmart(base, id){
  try { return await apiGet(`${base}/${id}`); } catch(e){ return await apiGet(`${base}?id=${id}`); }
}
async function apiPutSmart(base, id, data){
  try { return await apiPut(`${base}/${id}`, data); } catch(e){ return await apiPut(`${base}?id=${id}`, data); }
}
async function apiDeleteSmart(base, id){
  try { return await apiDelete(`${base}/${id}`); } catch(e){ return await apiDelete(`${base}?id=${id}`); }
}

/* state & pagination */
const state = {
  brands: { items: [], page: 1 },
  clothing: { items: [], page: 1 },
  users: { items: [], page: 1 },
  sales: { items: [], page: 1 }
};

/* tab navigation */
document.querySelectorAll('#mainTabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#mainTabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    document.querySelectorAll('.tab-content').forEach(s=>s.style.display='none');
    const node = document.querySelector(target);
    if(node) node.style.display = 'block';

    if(target === '#tab-clothing') loadCollection('clothing');
    if(target === '#tab-brands') loadCollection('brands');
    if(target === '#tab-users') loadCollection('users');
    if(target === '#tab-sales') loadCollection('sales');
    if(target === '#tab-analytics') loadAnalytics();
  });
});

/* init bindings */
document.addEventListener('DOMContentLoaded', ()=>{
  // Clothing
  $('btn-new-clothing').addEventListener('click', () => openClothingForm());
  $('clothing-cancel').addEventListener('click', () => { hide($('form-clothing')); clearClothingForm(); });
  $('clothing-save').addEventListener('click', saveClothing);
  $('btn-refresh-clothing').addEventListener('click', () => loadCollection('clothing'));
  $('clothing-prev').addEventListener('click', () => changePage('clothing', -1));
  $('clothing-next').addEventListener('click', () => changePage('clothing', 1));

  // Brands
  $('btn-new-brand').addEventListener('click', () => openBrandForm());
  $('brand-cancel').addEventListener('click', () => { hide($('form-brand')); clearBrandForm(); });
  $('brand-save').addEventListener('click', saveBrand);
  $('btn-refresh-brands').addEventListener('click', () => loadCollection('brands'));
  $('brands-prev').addEventListener('click', () => changePage('brands', -1));
  $('brands-next').addEventListener('click', () => changePage('brands', 1));

  // Sales
  $('btn-new-sale').addEventListener('click', () => openSaleForm());
  $('sale-cancel').addEventListener('click', () => { hide($('form-sale')); clearSaleForm(); });
  $('sale-save').addEventListener('click', saveSale);
  $('btn-refresh-sales').addEventListener('click', () => loadCollection('sales'));
  $('sales-prev').addEventListener('click', () => changePage('sales', -1));
  $('sales-next').addEventListener('click', () => changePage('sales', 1));

  // Users
  $('btn-new-user').addEventListener('click', () => openUserForm());
  $('user-cancel').addEventListener('click', () => { hide($('form-user')); clearUserForm(); });
  $('user-save').addEventListener('click', saveUser);
  $('btn-refresh-users').addEventListener('click', () => loadCollection('users'));
  $('users-prev').addEventListener('click', () => changePage('users', -1));
  $('users-next').addEventListener('click', () => changePage('users', 1));

  // initial load (and fill selects)
  loadAllDataForSelects();
  loadCollection('clothing');
  loadCollection('brands');
  loadCollection('users');
  loadCollection('sales');
});

/* pagination */
function changePage(collection, delta){
  const st = state[collection];
  st.page = Math.max(1, st.page + delta);
  renderCollection(collection);
}

/* load generic collection */
async function loadCollection(collection){
  try{
    const items = await apiGet(URLS[collection]);
    state[collection].items = Array.isArray(items) ? items : (items ? [items] : []);
    state[collection].page = 1;
    renderCollection(collection);
    // update selects when collections change
    if(collection === 'brands' || collection === 'clothing' || collection === 'users') fillSelectsFromState();
  }catch(err){
    console.error('loadCollection', collection, err);
    const tbody = $(`table-${collection}`);
    if(tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center p-3 text-muted">Error cargando datos.</td></tr>`;
  }
}

/* render collection with pagination */
function renderCollection(collection){
  const st = state[collection];
  const items = st.items || [];
  const page = st.page || 1;
  const total = items.length;
  const from = (page - 1) * PER_PAGE;
  const to = Math.min(total, page * PER_PAGE);
  const pageItems = items.slice(from, to);

  $(`${collection}-page-info`).textContent = total === 0 ? 'Sin registros' : `Mostrando ${from+1}-${to} de ${total}`;
  const prevBtn = $(`${collection}-prev`), nextBtn = $(`${collection}-next`);
  prevBtn.style.display = page > 1 ? 'inline-block' : 'none';
  nextBtn.style.display = to < total ? 'inline-block' : 'none';

  if(collection === 'clothing') renderClothingRows(pageItems);
  if(collection === 'brands') renderBrandRows(pageItems);
  if(collection === 'users') renderUserRows(pageItems);
  if(collection === 'sales') renderSalesRows(pageItems);
}

/* render rows per collection */
function renderClothingRows(items){
  const tbody = $('table-clothing'); tbody.innerHTML = '';
  if(!items.length){ tbody.innerHTML = `<tr><td colspan="9" class="text-center p-3 text-muted">No hay prendas.</td></tr>`; return; }
  items.forEach(it => {
    const sizes = Array.isArray(it.size) ? it.size.join(', ') : (it.size || '');
    const price = (it.price && typeof it.price === 'object' && it.price.$numberDouble) ? Number(it.price.$numberDouble).toFixed(2) : (it.price != null ? Number(it.price).toFixed(2) : '-');
    const in_stock = (it.in_stock && it.in_stock.$numberInt) ? it.in_stock.$numberInt : (it.in_stock ?? it.stock ?? 'N/A');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(it._id)}</td>
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.brand_id ?? it.brand ?? '')}</td>
      <td>${escapeHtml(it.category ?? '')}</td>
      <td>${escapeHtml(it.color ?? '')}</td>
      <td>${price}</td>
      <td>${in_stock}</td>
      <td>${escapeHtml(sizes)}</td>
      <td class="actions text-center">
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-warning" onclick="onEdit('clothing','${it._id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-danger" onclick="onDelete('clothing','${it._id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderBrandRows(items){
  const tbody = $('table-brands'); tbody.innerHTML = '';
  if(!items.length){ tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-muted">No hay marcas.</td></tr>`; return; }
  items.forEach(b => {
    const foundedVal = (b.founded && b.founded.$numberInt) ? b.founded.$numberInt : (b.founded ?? '');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(b._id)}</td>
      <td>${escapeHtml(b.name)}</td>
      <td>${escapeHtml(b.country ?? '')}</td>
      <td>${escapeHtml(foundedVal)}</td>
      <td class="actions text-center">
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-warning" onclick="onEdit('brands','${b._id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-danger" onclick="onDelete('brands','${b._id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderUserRows(items){
  const tbody = $('table-users'); tbody.innerHTML = '';
  if(!items.length){ tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-muted">No hay usuarios.</td></tr>`; return; }
  items.forEach(u => {
    const city = u.address?.city ?? '';
    const country = u.address?.country ?? '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(u._id)}</td>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(city)}</td>
      <td>${escapeHtml(country)}</td>
      <td class="actions text-center">
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-warning" onclick="onEdit('users','${u._id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-danger" onclick="onDelete('users','${u._id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderSalesRows(items){
  const tbody = $('table-sales'); tbody.innerHTML = '';
  if(!items.length){ tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-muted">No hay ventas.</td></tr>`; return; }
  items.forEach(s => {
    const qty = (s.quantity && s.quantity.$numberInt) ? s.quantity.$numberInt : (s.quantity ?? s.amount ?? 0);
    const dateStr = (s.date && s.date.$date && s.date.$date.$numberLong) ? new Date(Number(s.date.$date.$numberLong)).toLocaleString() : (s.date ? new Date(s.date).toLocaleString() : '');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s._id)}</td>
      <td>${escapeHtml(s.user_id ?? s.user ?? '')}</td>
      <td>${escapeHtml(s.clothing_id ?? s.item ?? '')}</td>
      <td>${qty}</td>
      <td>${escapeHtml(dateStr)}</td>
      <td class="actions text-center">
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-warning" onclick="onEdit('sales','${s._id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-danger" onclick="onDelete('sales','${s._id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* edit / delete */
async function onEdit(collection, id){
  try{
    const item = await apiGetSmart(URLS[collection], id);
    if(!item) return alert('Elemento no encontrado');
    if(collection === 'clothing') openClothingForm(item);
    if(collection === 'brands') openBrandForm(item);
    if(collection === 'users') openUserForm(item);
    if(collection === 'sales') openSaleForm(item);
  }catch(err){ console.error('onEdit', err); alert('Error al cargar elemento'); }
}

async function onDelete(collection, id){
  if(!confirm('¿Eliminar este elemento?')) return;
  try{
    await apiDeleteSmart(URLS[collection], id);
    await loadCollection(collection);
    // keep page in range
    const st = state[collection];
    const maxPage = Math.max(1, Math.ceil((st.items.length||0) / PER_PAGE));
    if(st.page > maxPage) st.page = maxPage;
    renderCollection(collection);
  }catch(err){ console.error('onDelete', err); alert('Error eliminando'); }
}

/* ------- FORMS: open / clear / save ------- */

/* ---------- Clothing ---------- */
async function openClothingForm(item=null){
  // ensure brands select is loaded
  await ensureBrandsLoaded();
  show($('form-clothing'));
  $('form-clothing-title').textContent = item ? 'Editar Prenda' : 'Nueva Prenda';
  $('clothing-id').value = item ? item._id : '';
  $('clothing-name').value = item ? item.name : '';
  $('clothing-brand_id').value = item ? (item.brand_id ?? '') : '';
  // price can be object { $numberDouble: "..." } or number
  const priceVal = item ? ((item.price && item.price.$numberDouble) ? item.price.$numberDouble : (item.price ?? '')) : '';
  $('clothing-price').value = priceVal;
  const stockVal = item ? ((item.in_stock && item.in_stock.$numberInt) ? item.in_stock.$numberInt : (item.in_stock ?? item.stock ?? '')) : '';
  $('clothing-in_stock').value = stockVal;
  $('clothing-size').value = item ? (Array.isArray(item.size) ? item.size.join(',') : (item.size || '')) : '';
  $('clothing-category').value = item ? (item.category || '') : '';
  $('clothing-color').value = item ? (item.color || '') : '';
}

function clearClothingForm(){
  ['clothing-id','clothing-name','clothing-brand_id','clothing-price','clothing-in_stock','clothing-size','clothing-category','clothing-color'].forEach(id=>{ $(id).value=''; });
}

async function saveClothing(){
  const id = $('clothing-id').value.trim();
  const name = $('clothing-name').value.trim();
  const brand_id = $('clothing-brand_id').value.trim();
  const priceRaw = $('clothing-price').value;
  const inStockRaw = $('clothing-in_stock').value;
  const sizesRaw = $('clothing-size').value;
  const category = $('clothing-category').value.trim();
  const color = $('clothing-color').value.trim();

  if(!name || !brand_id) return alert('Nombre y marca son obligatorios');

  // Build payload matching requested structure
  const payload = {
    brand_id: brand_id,
    category: category,
    color: color,
    in_stock: { "$numberInt": String(Math.max(0, parseInt(inStockRaw || 0))) },
    name: name,
    price: { "$numberDouble": (Number(priceRaw || 0)).toFixed(2) },
    size: sizesRaw.split(',').map(s => s.trim()).filter(Boolean)
  };

  try{
    if(id) await apiPutSmart(URLS.clothing, id, payload);
    else await apiPost(URLS.clothing, payload);
    hide($('form-clothing')); clearClothingForm(); await loadCollection('clothing'); await loadAllDataForSelects();
  }catch(err){ console.error('saveClothing', err); alert('Error guardando prenda'); }
}

/* ---------- Brands ---------- */
function openBrandForm(item=null){
  show($('form-brand'));
  $('form-brand-title').textContent = item ? 'Editar Marca' : 'Nueva Marca';
  $('brand-id').value = item ? item._id : '';
  $('brand-name').value = item ? item.name : '';
  $('brand-country').value = item ? (item.country || '') : '';
  const foundedVal = item && item.founded && item.founded.$numberInt ? item.founded.$numberInt : (item?.founded ?? '');
  $('brand-founded').value = foundedVal;
}

function clearBrandForm(){ ['brand-id','brand-name','brand-country','brand-founded'].forEach(id=>$(id).value=''); }

async function saveBrand(){
  const id = $('brand-id').value.trim();
  const name = $('brand-name').value.trim();
  const country = $('brand-country').value.trim();
  const foundedRaw = $('brand-founded').value;

  if(!name) return alert('Nombre es obligatorio');

  const payload = {
    country: country,
    name: name
  };
  if(foundedRaw) payload.founded = { "$numberInt": String(parseInt(foundedRaw)) };

  try{
    if(id) await apiPutSmart(URLS.brands, id, payload);
    else await apiPost(URLS.brands, payload);
    hide($('form-brand')); clearBrandForm(); await loadCollection('brands'); await loadAllDataForSelects();
  }catch(err){ console.error('saveBrand', err); alert('Error guardando marca'); }
}

/* ---------- Users ---------- */
function openUserForm(item=null){
  show($('form-user'));
  $('form-user-title').textContent = item ? 'Editar Usuario' : 'Nuevo Usuario';
  $('user-id').value = item ? item._id : '';
  $('user-name').value = item ? item.name : '';
  $('user-email').value = item ? item.email : '';
  $('user-city').value = item ? (item.address?.city || '') : '';
  $('user-country').value = item ? (item.address?.country || '') : '';
  $('user-password').value = item ? (item.password || '') : '';
}

function clearUserForm(){ ['user-id','user-name','user-email','user-city','user-country','user-password'].forEach(id=>$(id).value=''); }

async function saveUser(){
  const id = $('user-id').value.trim();
  const name = $('user-name').value.trim();
  const email = $('user-email').value.trim();
  const city = $('user-city').value.trim();
  const country = $('user-country').value.trim();
  const password = $('user-password').value;

  if(!name || !email) return alert('Nombre y correo son obligatorios');

  const payload = {
    address: { city: city, country: country },
    email: email,
    name: name,
    orders: [],
    password: password || ''
  };

  try{
    if(id) await apiPutSmart(URLS.users, id, payload);
    else await apiPost(URLS.users, payload);
    hide($('form-user')); clearUserForm(); await loadCollection('users'); await loadAllDataForSelects();
  }catch(err){ console.error('saveUser', err); alert('Error guardando usuario'); }
}

/* ---------- Sales ---------- */
async function openSaleForm(item=null){
  // ensure selects loaded
  await ensureUsersAndClothingLoaded();
  show($('form-sale'));
  $('form-sale-title').textContent = item ? 'Editar Venta' : 'Nueva Venta';
  $('sale-id').value = item ? item._id : '';
  $('sale-user_id').value = item ? (item.user_id || '') : '';
  $('sale-clothing_id').value = item ? (item.clothing_id || '') : '';
  const qty = item && item.quantity && item.quantity.$numberInt ? item.quantity.$numberInt : (item?.quantity ?? item?.amount ?? 1);
  $('sale-quantity').value = qty;
  if(item && item.date && item.date.$date && item.date.$date.$numberLong){
    $('sale-date').value = new Date(Number(item.date.$date.$numberLong)).toISOString().split('T')[0];
  } else {
    $('sale-date').value = item && item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  }
}

function clearSaleForm(){ ['sale-id','sale-user_id','sale-clothing_id','sale-quantity','sale-date'].forEach(id=>$(id).value=''); }

async function saveSale(){
  const id = $('sale-id').value.trim();
  const user_id = $('sale-user_id').value.trim();
  const clothing_id = $('sale-clothing_id').value.trim();
  const quantityRaw = $('sale-quantity').value;
  const dateVal = $('sale-date').value;

  if(!user_id || !clothing_id || (parseInt(quantityRaw) <= 0)) return alert('Usuario, prenda y cantidad son obligatorios');

  const ms = toEpochMsFromDateInput(dateVal);

  const payload = {
    user_id: user_id,
    clothing_id: clothing_id,
    quantity: { "$numberInt": String(Math.max(1, parseInt(quantityRaw))) },
    date: { "$date": { "$numberLong": String(Number(ms)) } }
  };

  try{
    if(id) await apiPutSmart(URLS.sales, id, payload);
    else await apiPost(URLS.sales, payload);
    hide($('form-sale')); clearSaleForm(); await loadCollection('sales'); await loadCollection('clothing'); // refresh stock view
  }catch(err){ console.error('saveSale', err); alert('Error guardando venta'); }
}

/* ------- Selects (brands/users/clothing) ------- */
async function loadAllDataForSelects(){
  await Promise.all([ensureBrandsLoaded(), ensureUsersAndClothingLoaded()]);
}
async function ensureBrandsLoaded(){
  try{
    const brands = await apiGet(URLS.brands);
    state.brands.items = Array.isArray(brands) ? brands : (brands ? [brands] : []);
    fillBrandSelect();
  }catch(err){ console.warn('ensureBrandsLoaded', err); }
}
async function ensureUsersAndClothingLoaded(){
  try{
    const [users, clothing] = await Promise.all([apiGet(URLS.users), apiGet(URLS.clothing)]);
    state.users.items = Array.isArray(users) ? users : (users ? [users] : []);
    state.clothing.items = Array.isArray(clothing) ? clothing : (clothing ? [clothing] : []);
    fillUserSelect();
    fillClothingSelect();
  }catch(err){ console.warn('ensureUsersAndClothingLoaded', err); }
}

function fillBrandSelect(){
  const sel = $('clothing-brand_id');
  sel.innerHTML = '<option value="">-- Seleccione marca --</option>';
  (state.brands.items||[]).forEach(b=>{
    sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(b._id)}">${escapeHtml(b.name)} (${escapeHtml(b._id)})</option>`);
  });
}
function fillUserSelect(){
  const sel = $('sale-user_id');
  sel.innerHTML = '<option value="">-- Seleccione usuario --</option>';
  (state.users.items||[]).forEach(u=>{
    sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(u._id)}">${escapeHtml(u.name)} (${escapeHtml(u._id)})</option>`);
  });
}
function fillClothingSelect(){
  const sel = $('sale-clothing_id');
  sel.innerHTML = '<option value="">-- Seleccione prenda --</option>';
  (state.clothing.items||[]).forEach(c=>{
    sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(c._id)}">${escapeHtml(c.name)} (${escapeHtml(c._id)})</option>`);
  });
}

/* called when collections refresh to keep selects updated */
function fillSelectsFromState(){
  fillBrandSelect();
  fillUserSelect();
  fillClothingSelect();
}

/* ------- Analytics (request /reports or fallback) ------- */
async function loadAnalytics(){
  const ulBrands = $('analytics-brands-with-sales');
  const tbodyItems = $('analytics-items-stock');
  const tbodyTop5 = $('analytics-top5');
  const updated = $('analytics-updated');

  ulBrands.innerHTML = '<li class="list-group-item text-muted">Cargando...</li>';
  tbodyItems.innerHTML = `<tr><td colspan="4" class="text-center p-3 text-muted">Cargando...</td></tr>`;
  tbodyTop5.innerHTML = `<tr><td colspan="2" class="text-center p-3 text-muted">Cargando...</td></tr>`;

  try{
    const data = await apiGet(URLS.reports);
    // brands with sales
    ulBrands.innerHTML = '';
    (data.brands_with_sales || []).forEach(b => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<span>${escapeHtml(b.name)}</span><span class="badge bg-primary rounded-pill">${b.sales_count}</span>`;
      ulBrands.appendChild(li);
    });

    // items sold
    tbodyItems.innerHTML = '';
    (data.items_sold || []).forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(it.name)}</td><td>${it.sold}</td><td>${it.in_stock ?? 'N/A'}</td><td>${it.remaining ?? 'N/A'}</td>`;
      tbodyItems.appendChild(tr);
    });

    // top5
    tbodyTop5.innerHTML = '';
    (data.top5_brands || []).forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(b.name)}</td><td>${b.sales_count}</td>`;
      tbodyTop5.appendChild(tr);
    });

    updated.textContent = new Date().toLocaleString();
  }catch(err){
    console.warn('loadAnalytics failed, using fallback', err);
    await loadAnalyticsFallbackClient();
  }
}

/* fallback (client-side) - same logic as before but adapted to wrappers */
async function loadAnalyticsFallbackClient(){
  try{
    const [sales, clothing, brands] = await Promise.all([apiGet(URLS.sales), apiGet(URLS.clothing), apiGet(URLS.brands)]);
    const clothMap = new Map((Array.isArray(clothing)?clothing:[]).map(c => [c._id, c]));
    const brandMap = new Map((Array.isArray(brands)?brands:[]).map(b => [b._id, b]));
    const brandSales = new Map();
    const soldByItem = new Map();

    (Array.isArray(sales)?sales:[]).forEach(s => {
      const qty = (s.quantity && s.quantity.$numberInt) ? Number(s.quantity.$numberInt) : (s.quantity ?? s.amount ?? 0);
      if(qty <= 0) return;
      const cloth = clothMap.get(s.clothing_id) || null;
      const itemKey = cloth ? cloth._id : (s.clothing_id || s.item || ('unknown-' + Math.random()));
      soldByItem.set(itemKey, (soldByItem.get(itemKey) || 0) + qty);
      const brandId = cloth ? cloth.brand_id : null;
      if(brandId && brandMap.has(brandId)){
        const name = brandMap.get(brandId).name;
        brandSales.set(name, (brandSales.get(name) || 0) + qty);
      }
    });

    const ulBrands = $('analytics-brands-with-sales'); ulBrands.innerHTML = '';
    if(brandSales.size === 0) ulBrands.innerHTML = `<li class="list-group-item">No hay marcas con ventas.</li>`;
    else Array.from(brandSales.entries()).sort((a,b)=>b[1]-a[1]).forEach(([n,c])=>{
      const li = document.createElement('li'); li.className='list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<span>${escapeHtml(n)}</span><span class="badge bg-primary rounded-pill">${c}</span>`; ulBrands.appendChild(li);
    });

    const tbodyItems = $('analytics-items-stock'); tbodyItems.innerHTML = '';
    if(soldByItem.size === 0) tbodyItems.innerHTML = `<tr><td colspan="4" class="text-center p-3 text-muted">No hay datos.</td></tr>`;
    else for(const [k,sold] of soldByItem.entries()){
      const cloth = clothMap.get(k);
      const name = cloth ? cloth.name : k;
      const stockRaw = cloth ? (cloth.in_stock && cloth.in_stock.$numberInt ? Number(cloth.in_stock.$numberInt) : (cloth.in_stock ?? cloth.stock ?? null)) : null;
      const remaining = stockRaw != null ? stockRaw - sold : null;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(name)}</td><td>${sold}</td><td>${stockRaw ?? 'N/A'}</td><td>${remaining ?? 'N/A'}</td>`;
      tbodyItems.appendChild(tr);
    }

    const tbodyTop5 = $('analytics-top5'); tbodyTop5.innerHTML = '';
    const topArr = Array.from(brandSales.entries()).map(([name,c])=>({name,c})).sort((a,b)=>b.c-a.c).slice(0,5);
    if(topArr.length === 0) tbodyTop5.innerHTML = `<tr><td colspan="2" class="text-center p-3 text-muted">No hay datos.</td></tr>`;
    else topArr.forEach(b => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${escapeHtml(b.name)}</td><td>${b.c}</td>`; tbodyTop5.appendChild(tr); });

    $('analytics-updated').textContent = new Date().toLocaleString();
  }catch(err){
    console.error('loadAnalyticsFallbackClient', err);
    $('analytics-brands-with-sales').innerHTML = `<li class="list-group-item text-danger">Error.</li>`;
    $('analytics-items-stock').innerHTML = `<tr><td colspan="4" class="text-danger p-3">Error.</td></tr>`;
    $('analytics-top5').innerHTML = `<tr><td colspan="2" class="text-danger p-3">Error.</td></tr>`;
  }
}

/* Load initial lists for selects */
async function loadAllDataForSelects(){
  await Promise.all([ensureBrandsLoaded(), ensureUsersAndClothingLoaded()]);
}

/* Reuse earlier helpers for selects */
async function ensureBrandsLoaded(){
  try{ const brands = await apiGet(URLS.brands); state.brands.items = Array.isArray(brands)?brands:(brands?[brands]:[]); fillBrandSelect(); }catch(e){ console.warn(e); }
}
async function ensureUsersAndClothingLoaded(){
  try{
    const [users, clothing] = await Promise.all([apiGet(URLS.users), apiGet(URLS.clothing)]);
    state.users.items = Array.isArray(users)?users:(users?[users]:[]);
    state.clothing.items = Array.isArray(clothing)?clothing:(clothing?[clothing]:[]);
    fillUserSelect(); fillClothingSelect();
  }catch(e){ console.warn(e); }
}
function fillBrandSelect(){ const sel=$('clothing-brand_id'); sel.innerHTML = '<option value="">-- Seleccione marca --</option>'; (state.brands.items||[]).forEach(b=> sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(b._id)}">${escapeHtml(b.name)} (${escapeHtml(b._id)})</option>`)); }
function fillUserSelect(){ const sel=$('sale-user_id'); sel.innerHTML = '<option value="">-- Seleccione usuario --</option>'; (state.users.items||[]).forEach(u=> sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(u._id)}">${escapeHtml(u.name)} (${escapeHtml(u._id)})</option>`)); }
function fillClothingSelect(){ const sel=$('sale-clothing_id'); sel.innerHTML = '<option value="">-- Seleccione prenda --</option>'; (state.clothing.items||[]).forEach(c=> sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(c._id)}">${escapeHtml(c.name)} (${escapeHtml(c._id)})</option>`)); }
function fillSelectsFromState(){ fillBrandSelect(); fillUserSelect(); fillClothingSelect(); }