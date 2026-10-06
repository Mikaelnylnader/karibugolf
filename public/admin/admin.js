import { salesFigures } from "./sales-report.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const categories = [
  ["drivers", "Drivers"], ["woods", "Fairway Woods"], ["hybrids", "Hybrids"], ["golf_irons", "Irons"], ["wedges", "Wedges"], ["putters", "Putters"],
  ["junior_sets", "Junior Sets"],
  ["mens_shoes", "Men’s Shoes"], ["womens_shoes", "Women’s Shoes"], ["mens_polos", "Men’s Polos"], ["mens_pants", "Men’s Trousers"],
  ["mens_jackets", "Men’s Jackets"], ["mens_shorts", "Men’s Shorts"], ["womens_polos", "Women’s Polos"], ["womens_skirts", "Women’s Skirts"],
  ["womens_pants", "Women’s Trousers"], ["womens_dresses", "Women’s Dresses"], ["womens_jackets", "Women’s Jackets"], ["womens_tops", "Women’s Tops"],
  ["bags", "Golf Bags"], ["balls", "Golf Balls"], ["gloves", "Gloves"], ["hats_and_caps", "Hats & Caps"], ["grips", "Grips"], ["range_finders", "Range Finders"], ["accessories", "Accessories"],
];
const categoryGroups = [
  ["Clubs", ["drivers", "woods", "hybrids", "golf_irons", "wedges", "putters"]],
  ["Kids", ["junior_sets"]],
  ["Shoes", ["mens_shoes", "womens_shoes"]],
  ["Men’s apparel", ["mens_polos", "mens_pants", "mens_jackets", "mens_shorts"]],
  ["Women’s apparel", ["womens_polos", "womens_skirts", "womens_pants", "womens_dresses", "womens_jackets", "womens_tops"]],
  ["Bags, balls & accessories", ["bags", "balls", "gloves", "hats_and_caps", "grips", "range_finders", "accessories"]],
];
const viewCopy = {
  dashboard: ["Dashboard", "Your catalogue, stock and live shop in one place."],
  products: ["Products", "Search, filter and manage every product in your catalogue."],
  inventory: ["Inventory", "Review and update products that are currently in stock."],
  categories: ["Categories", "Browse the catalogue using the same structure as your shop."],
  clients: ["Clients", "Contact details and notes for people who have bought or received items."],
  sales: ["Sales", "Record what you sold and see figures based on your actual selling prices."],
};

let products = [];
let activeView = "dashboard";
let activeFilter = "all";
let editingSku = null;
const selectedSkus = new Set();
const inventoryChanges = new Map();
let clients = [];
let clientsLoaded = false;
let clientsLoading = false;
let editingClientId = null;
let clientSaving = false;
let sales = [];
let salesLoaded = false;
let salesLoading = null;
let editingSaleId = null;
let saleSubmissionId = null;
let saleSaving = false;

const api = async (url, options = {}) => {
  const headers = options.body instanceof ArrayBuffer ? options.headers : { "content-type": "application/json", ...options.headers };
  const response = await fetch(url, { credentials: "same-origin", ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    showLogin();
    throw new Error(data.error || "Please sign in again.");
  }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

function showLogin() {
  $("#app").hidden = true;
  $("#login").hidden = false;
  $("#editor").close();
  $("#client-editor").close();
  $("#sale-editor").close();
  clients = [];
  clientsLoaded = false;
  sales = [];
  salesLoaded = false;
  renderSales();
  renderClients();
}
function showApp() { $("#login").hidden = true; $("#app").hidden = false; }
function money(value) { return `KSh ${Math.round(Number(value) || 0).toLocaleString("en-KE")}`; }
function escapeHtml(value) { const node = document.createElement("span"); node.textContent = String(value ?? ""); return node.innerHTML; }
function categoryLabel(slug) { return categories.find(([value]) => value === slug)?.[1] || String(slug || "Uncategorised").replaceAll("_", " "); }
function stockNumber(product) { const value = Number(product.stock); return Number.isFinite(value) ? Math.max(0, value) : 0; }
function isInStock(product) { return product.status?.toLowerCase() === "in stock" && stockNumber(product) > 0; }
function productImage(product, className = "thumb") {
  return product.image
    ? `<img class="${className}" src="${escapeHtml(product.image)}" alt="" onerror="this.outerHTML='<span class=thumb-placeholder>◇</span>'">`
    : '<span class="thumb-placeholder">◇</span>';
}

async function checkSession() {
  const response = await fetch("/api/admin-auth", { credentials: "same-origin" });
  const data = await response.json().catch(() => ({}));
  if (data.authenticated) {
    showApp();
    await loadProducts();
  } else showLogin();
}

async function loadProducts() {
  setLoading(true);
  try {
    const data = await api("/api/admin-products");
    products = data.products;
    selectedSkus.clear();
    inventoryChanges.clear();
    syncSummaries(data.summary);
    populateCategoryFilters();
    renderDashboard();
    renderProducts();
    renderInventory();
    renderCategories();
    const requestedCategory = new URL(location.href).searchParams.get("category") || "";
    const requestedView = location.hash.replace("#", "") || "dashboard";
    if (requestedCategory && requestedView === "categories") showCategoryProducts(requestedCategory, false);
    if (requestedCategory && requestedView === "products") $("#category-filter").value = requestedCategory;
    showView(viewCopy[requestedView] ? requestedView : "dashboard", false);
    renderProducts();
  } catch (error) {
    showNotice(error.message, true);
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  $("#refresh").disabled = loading;
  $("#refresh").textContent = loading ? "Refreshing…" : "↻ Refresh";
}

function syncSummaries(summary) {
  const totalUnits = products.reduce((sum, product) => sum + (isInStock(product) ? stockNumber(product) : 0), 0);
  const out = products.filter((product) => !isInStock(product)).length;
  const values = {
    "#stat-total": summary.total, "#stat-live": summary.live, "#stat-private": summary.private,
    "#stat-stock": summary.inStock, "#stat-out": out, "#dash-total": summary.total,
    "#dash-live": summary.live, "#dash-private": summary.private, "#dash-units": totalUnits,
    "#inventory-units": totalUnits, "#inventory-in": summary.inStock,
    "#inventory-low": products.filter((product) => isInStock(product) && stockNumber(product) <= 2).length,
    "#inventory-live": products.filter((product) => isInStock(product) && product.websiteVisible).length,
  };
  for (const [selector, value] of Object.entries(values)) $(selector).textContent = Number(value).toLocaleString("en-KE");
}

function populateCategoryFilters() {
  const used = new Set(products.map((product) => product.categorySlug));
  const options = '<option value="">All categories</option>' + categories
    .filter(([slug]) => used.has(slug))
    .map(([slug, label]) => `<option value="${slug}">${label}</option>`).join("");
  const currentProductCategory = $("#category-filter").value;
  const currentInventoryCategory = $("#inventory-category").value;
  $("#category-filter").innerHTML = options;
  $("#inventory-category").innerHTML = options;
  $("#category-filter").value = used.has(currentProductCategory) ? currentProductCategory : "";
  $("#inventory-category").value = used.has(currentInventoryCategory) ? currentInventoryCategory : "";
}

function renderDashboard() {
  const stockWatch = [...products]
    .filter((product) => !isInStock(product) || stockNumber(product) <= 2)
    .sort((a, b) => stockNumber(a) - stockNumber(b))
    .slice(0, 6);
  $("#stock-watch-list").innerHTML = stockWatch.length ? stockWatch.map((product) => `<div class="mini-row">
    ${productImage(product, "mini-thumb")}
    <div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)} · ${escapeHtml(categoryLabel(product.categorySlug))}</small></div>
    <button type="button" data-dashboard-edit="${escapeHtml(product.sku)}"><span class="stock-number">${stockNumber(product)}</span></button>
  </div>`).join("") : '<p class="loading-inline">Everything has comfortable stock.</p>';

  const live = products.filter((product) => product.websiteVisible).slice(0, 6);
  $("#dashboard-products").innerHTML = live.length ? live.map((product) => `<div class="mini-row">
    ${productImage(product, "mini-thumb")}
    <div><strong>${escapeHtml(product.name)}</strong><small>${money(product.priceKes)} · ${stockNumber(product)} available</small></div>
    <button type="button" data-dashboard-edit="${escapeHtml(product.sku)}">Edit</button>
  </div>`).join("") : '<p class="loading-inline">No products are live yet.</p>';

  const counts = products.reduce((result, product) => {
    result[product.categorySlug] = (result[product.categorySlug] || 0) + 1;
    return result;
  }, {});
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = Math.max(1, ...ranked.map(([, count]) => count));
  $("#dashboard-categories").innerHTML = ranked.map(([slug, count]) => `<div class="bar-row">
    <button type="button" data-dashboard-category="${slug}">${escapeHtml(categoryLabel(slug))}</button>
    <div class="bar-track"><i style="width:${Math.round((count / max) * 100)}%"></i></div><span>${count}</span>
  </div>`).join("");
}

function filteredProducts() {
  const query = $("#search").value.trim().toLowerCase();
  const category = $("#category-filter").value;
  const visible = products.filter((product) => {
    const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    const matchesCategory = !category || product.categorySlug === category;
    const matchesFilter = activeFilter === "all"
      || (activeFilter === "live" && product.websiteVisible)
      || (activeFilter === "private" && !product.websiteVisible)
      || (activeFilter === "stock" && isInStock(product))
      || (activeFilter === "out" && !isInStock(product));
    return matchesQuery && matchesCategory && matchesFilter;
  });
  const sort = $("#sort-products").value;
  return visible.sort((a, b) => {
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "stock-asc") return stockNumber(a) - stockNumber(b);
    if (sort === "stock-desc") return stockNumber(b) - stockNumber(a);
    if (sort === "price-desc") return Number(b.priceKes || 0) - Number(a.priceKes || 0);
    if (sort === "price-asc") return Number(a.priceKes || 0) - Number(b.priceKes || 0);
    return a.name.localeCompare(b.name);
  });
}

function renderProducts() {
  const visible = filteredProducts();
  $("#product-count").textContent = `${visible.length} of ${products.length} products`;
  $("#product-rows").innerHTML = visible.length ? visible.map((product) => `<tr>
    <td class="check-column"><input type="checkbox" data-select="${escapeHtml(product.sku)}" aria-label="Select ${escapeHtml(product.name)}" ${selectedSkus.has(product.sku) ? "checked" : ""}></td>
    <td><div class="product-cell">${productImage(product)}<div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)}</small></div></div></td>
    <td><button type="button" class="category-link" data-category="${escapeHtml(product.categorySlug)}">${escapeHtml(categoryLabel(product.categorySlug))}</button></td>
    <td class="price-cell"><strong>${money(product.priceKes)}</strong><small>¥${Number(product.priceCny || 0).toLocaleString("en-KE")} · $${Number(product.priceUsd || 0).toLocaleString("en-US")}</small></td>
    <td class="inventory-cell"><strong>${stockNumber(product)} available</strong><small>${escapeHtml(product.status)}</small></td>
    <td><button class="badge ${product.websiteVisible ? "live" : "private"}" data-toggle="${escapeHtml(product.sku)}"><i></i>${product.websiteVisible ? "LIVE" : "PRIVATE"}</button></td>
    <td><button type="button" class="edit-button" data-edit="${escapeHtml(product.sku)}">Edit</button></td>
  </tr>`).join("") : '<tr><td colspan="7" class="loading">No products match this view.</td></tr>';
  const allVisibleSelected = visible.length > 0 && visible.every((product) => selectedSkus.has(product.sku));
  $("#select-all").checked = allVisibleSelected;
  $("#select-all").indeterminate = !allVisibleSelected && visible.some((product) => selectedSkus.has(product.sku));
  updateBulkBar();
}

function updateBulkBar() {
  $("#bulk-bar").hidden = selectedSkus.size === 0;
  $("#selected-count").textContent = selectedSkus.size;
}

function setProductFilter(filter) {
  activeFilter = filter;
  $$("[data-filter]").forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
  renderProducts();
}

async function runBulkAction(action) {
  const selected = products.filter((product) => selectedSkus.has(product.sku));
  if (!selected.length) return;
  const updates = selected.map((product) => {
    if (action === "live") return { ...product, websiteVisible: true };
    if (action === "private") return { ...product, websiteVisible: false };
    if (action === "in") return { ...product, status: "In Stock", stock: String(Math.max(1, stockNumber(product))) };
    return { ...product, status: "Out of Stock", stock: "0" };
  });
  setBulkDisabled(true);
  try {
    await api("/api/admin-products", { method: "PUT", body: JSON.stringify({ products: updates }) });
    showNotice(`${updates.length} products updated. One storefront rebuild has started.`);
    await loadProducts();
    showView("products", false);
  } catch (error) {
    showNotice(error.message, true);
  } finally {
    setBulkDisabled(false);
  }
}

function setBulkDisabled(disabled) { $$("#bulk-bar button").forEach((button) => { button.disabled = disabled; }); }

function inventoryProducts() {
  const query = $("#inventory-search").value.trim().toLowerCase();
  const category = $("#inventory-category").value;
  return products.filter((product) => isInStock(product)
    && (!query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query))
    && (!category || product.categorySlug === category));
}

function renderInventory() {
  const visible = inventoryProducts();
  $("#inventory-rows").innerHTML = visible.length ? visible.map((product) => {
    const quantity = inventoryChanges.has(product.sku) ? inventoryChanges.get(product.sku) : stockNumber(product);
    const changed = inventoryChanges.has(product.sku);
    const nextStatus = quantity > 0 ? "In Stock" : "Out of Stock";
    return `<tr>
      <td><div class="product-cell">${productImage(product)}<div><strong>${escapeHtml(product.name)}</strong></div></div></td>
      <td><code>${escapeHtml(product.sku)}</code></td><td>${escapeHtml(categoryLabel(product.categorySlug))}</td>
      <td><input class="stock-input${changed ? " changed" : ""}" type="number" min="0" step="1" value="${quantity}" data-inventory-sku="${escapeHtml(product.sku)}" aria-label="Available quantity for ${escapeHtml(product.name)}"></td>
      <td><span class="badge ${quantity > 0 ? "in" : "out"}">${nextStatus}</span></td>
      <td><span class="badge ${product.websiteVisible ? "live" : "private"}"><i></i>${product.websiteVisible ? "LIVE" : "PRIVATE"}</span></td>
      <td><button class="edit-button" type="button" data-inventory-edit="${escapeHtml(product.sku)}">Edit details</button></td>
    </tr>`;
  }).join("") : '<tr><td colspan="7" class="loading">No in-stock products match this view.</td></tr>';
  $("#save-inventory").disabled = inventoryChanges.size === 0;
  $("#save-inventory").textContent = inventoryChanges.size ? `Save ${inventoryChanges.size} change${inventoryChanges.size === 1 ? "" : "s"}` : "Save inventory changes";
}

async function saveInventory() {
  if (!inventoryChanges.size) return;
  const updates = [...inventoryChanges].map(([sku, quantity]) => {
    const product = products.find((item) => item.sku === sku);
    return { ...product, stock: String(quantity), status: quantity > 0 ? "In Stock" : "Out of Stock" };
  });
  $("#save-inventory").disabled = true;
  $("#save-inventory").textContent = "Saving to Google Sheets…";
  try {
    await api("/api/admin-products", { method: "PUT", body: JSON.stringify({ products: updates }) });
    showNotice(`${updates.length} inventory changes saved. One storefront rebuild has started.`);
    await loadProducts();
    showView("inventory", false);
  } catch (error) {
    showNotice(error.message, true);
    $("#save-inventory").disabled = false;
  }
}

function renderCategories() {
  const counts = products.reduce((result, product) => {
    result[product.categorySlug] = (result[product.categorySlug] || 0) + 1;
    return result;
  }, {});
  $("#category-groups").innerHTML = categoryGroups.map(([group, slugs]) => `<section class="category-group">
    <h2>${escapeHtml(group)}</h2>
    <div class="category-grid">${slugs.map((slug) => `<button type="button" class="category-card" data-category="${slug}">
      <span>CATEGORY</span><strong>${escapeHtml(categoryLabel(slug))}</strong><small>${counts[slug] || 0} products →</small>
    </button>`).join("")}</div>
  </section>`).join("");
}

function showCategoryProducts(slug, updateUrl = true) {
  const matches = products.filter((product) => product.categorySlug === slug);
  $("#category-groups").innerHTML = `<section class="category-detail">
    <header class="category-detail-head">
      <div><p class="eyebrow">CATEGORY · ${matches.length} PRODUCTS</p><h2>${escapeHtml(categoryLabel(slug))}</h2></div>
      <button class="category-back" type="button" data-all-categories>← All categories</button>
    </header>
    ${matches.length ? `<div class="category-product-grid">${matches.map((product) => `<article class="category-product">
      ${productImage(product, "category-image")}
      <div><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.sku)} · ${escapeHtml(product.status)} · ${stockNumber(product)} available</p>
      <footer><span>${money(product.priceKes)}</span><button type="button" class="edit-button" data-category-edit="${escapeHtml(product.sku)}">Edit</button></footer></div>
    </article>`).join("")}</div>` : '<div class="empty-category">No products have been added to this category yet.</div>'}
  </section>`;
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("category", slug);
    url.hash = "categories";
    history.replaceState({}, "", url);
  }
  showView("categories", false);
}

function openAllCategories() {
  const url = new URL(location.href);
  url.searchParams.delete("category");
  url.hash = "categories";
  history.replaceState({}, "", url);
  renderCategories();
  showView("categories", false);
}

function selectCategory(slug) {
  $("#category-filter").value = slug;
  setProductFilter("all");
  const url = new URL(location.href);
  if (slug) url.searchParams.set("category", slug); else url.searchParams.delete("category");
  url.hash = "products";
  history.replaceState({}, "", url);
  showView("products", false);
  renderProducts();
}

function showView(view, updateHash = true) {
  activeView = view;
  $$(".view-panel").forEach((panel) => { panel.hidden = panel.id !== view; });
  $$(".sidebar nav a[id^='nav-']").forEach((link) => link.classList.toggle("active", link.id === `nav-${view}`));
  $("#view-title").textContent = viewCopy[view][0];
  $("#view-subtitle").textContent = viewCopy[view][1];
  $("#new-product").hidden = ["categories", "clients", "sales"].includes(view);
  $("#new-client").hidden = view !== "clients";
  $("#new-sale").hidden = view !== "sales";
  $$(".mobile-admin-nav [data-go]").forEach((button) => {
    button.classList.toggle("active", button.dataset.go === view);
    if (button.dataset.go === view) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (view === "clients" && !clientsLoaded && !clientsLoading) loadClients();
  if ((view === "sales" || view === "dashboard") && !salesLoaded) loadSales();
  if (updateHash) {
    const url = new URL(location.href);
    if (view !== "categories") url.searchParams.delete("category");
    url.hash = view;
    history.replaceState({}, "", url);
  }
}

async function loadClients() {
  if (clientsLoading) return;
  clientsLoading = true;
  $("#refresh").disabled = true;
    $("#client-rows").innerHTML = '<tr><td colspan="7" class="loading">Loading clients…</td></tr>';
  try {
    const data = await api("/api/admin-clients");
    clients = data.clients;
    clientsLoaded = true;
    renderClients();
  } catch (error) {
    clientsLoaded = false;
      $("#client-rows").innerHTML = '<tr><td colspan="7" class="loading">Unable to load clients. <button type="button" class="edit-button" data-client-retry>Try again</button></td></tr>';
    showNotice(error.message, true);
  } finally {
    clientsLoading = false;
    $("#refresh").disabled = false;
  }
}

function renderClients() {
  const query = $("#client-search").value.trim().toLowerCase();
  const queryDigits = query.replace(/\D/g, "");
  const visible = clients.filter((client) => {
    const text = [client.firstName, client.lastName, client.company, client.email, client.phone, client.whatsapp, client.notes].join(" ").toLowerCase();
    return !query || text.includes(query) || (/^[+\d\s().-]+$/.test(query) && queryDigits && [client.phone, client.whatsapp].some((phone) => String(phone).replace(/\D/g, "").includes(queryDigits)));
  }).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  $("#client-count").textContent = `${visible.length} of ${clients.length} clients`;
  const phoneLink = (value, whatsapp = false) => {
    if (!value) return '<span class="client-missing">—</span>';
    const digits = String(value).replace(/\D/g, "");
    if (!/^\d{7,15}$/.test(digits)) return escapeHtml(value);
    const href = whatsapp ? `https://wa.me/${digits}` : `tel:${String(value).trim().startsWith("+") ? "+" : ""}${digits}`;
    return `<a href="${href}"${whatsapp ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(value)}</a>`;
  };
  $("#client-rows").innerHTML = visible.length ? visible.map((client) => `<tr>
    <td><strong>${escapeHtml(client.firstName)} ${escapeHtml(client.lastName)}</strong></td>
    <td>${client.company ? escapeHtml(client.company) : '<span class="client-missing">—</span>'}</td>
    <td>${client.email ? `<a href="mailto:${encodeURIComponent(client.email)}">${escapeHtml(client.email)}</a>` : '<span class="client-missing">—</span>'}</td>
    <td>${phoneLink(client.phone)}</td><td>${phoneLink(client.whatsapp, true)}</td>
    <td class="client-notes">${client.notes ? escapeHtml(client.notes) : '<span class="client-missing">—</span>'}</td>
    <td><div class="client-row-actions"><button type="button" class="edit-button" data-client-edit="${encodeURIComponent(client.id)}">Edit</button><button type="button" class="edit-button" data-client-sale="${encodeURIComponent(client.id)}">Record sale</button></div></td>
  </tr>`).join("") : `<tr><td colspan="7" class="loading">${clients.length ? "No clients match your search." : "No clients yet. Select Add client to save your first customer."}</td></tr>`;
}

function openClientEditor(client = null) {
  editingClientId = client?.id || null;
  const form = $("#client-form");
  form.reset();
  for (const key of ["firstName", "lastName", "company", "email", "phone", "whatsapp", "notes"]) form.elements[key].value = client?.[key] || "";
  $("#client-editor-title").textContent = client ? "Edit client" : "Add client";
  $("#client-save-status").textContent = "";
  $("#client-editor").showModal();
}

async function saveClient(event) {
  event.preventDefault();
  if (clientSaving) return;
  clientSaving = true;
  const form = $("#client-form");
  const client = Object.fromEntries(new FormData(form));
  if (editingClientId) client.id = editingClientId;
  $("#save-client").disabled = true;
  $("#save-client").textContent = "Saving…";
  $("#close-client-editor").disabled = true;
  $("#cancel-client-editor").disabled = true;
  $("#client-save-status").textContent = "Saving client…";
  try {
    const result = await api("/api/admin-clients", { method: editingClientId ? "PUT" : "POST", body: JSON.stringify(client) });
    const index = clients.findIndex((item) => item.id === result.client.id);
    if (index >= 0) clients[index] = result.client; else clients.push(result.client);
    $("#client-editor").close();
    renderClients();
    showNotice(`${result.client.firstName} ${result.client.lastName} saved to your client list.`);
  } catch (error) {
    $("#client-save-status").textContent = error.message;
  } finally {
    clientSaving = false;
    $("#save-client").disabled = false;
    $("#save-client").textContent = "Save client";
    $("#close-client-editor").disabled = false;
    $("#cancel-client-editor").disabled = false;
  }
}

function saleMoney(value) {
  return `KSh ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 2, minimumFractionDigits: Number(value) % 1 ? 2 : 0 })}`;
}

function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function loadSales() {
  if (salesLoading) return salesLoading;
  salesLoading = (async () => {
    $("#refresh").disabled = true;
    $("#sales-rows").innerHTML = '<tr><td colspan="7" class="loading">Loading sales…</td></tr>';
    try {
      const data = await api("/api/admin-sales");
      sales = data.sales;
      salesLoaded = true;
      renderSales();
    } catch (error) {
      salesLoaded = false;
      for (const selector of ["#sales-revenue", "#sales-count", "#sales-units", "#sales-average"]) $(selector).textContent = "—";
      $("#sales-months").textContent = "Sales figures are unavailable until records load.";
      $("#sales-top-products").textContent = "";
      $("#sales-rows").innerHTML = '<tr><td colspan="7" class="loading">Unable to load sales. <button type="button" class="edit-button" data-sales-retry>Try again</button></td></tr>';
      $("#dash-sales-total").textContent = "—";
      $("#dash-sales-month").textContent = "—";
      $("#dash-sales-month-count").textContent = "Sales unavailable";
      $("#dashboard-sales").innerHTML = '<p class="loading-inline">Sales are unavailable. Use Refresh to try again.</p>';
      showNotice(error.message, true);
    } finally { $("#refresh").disabled = false; }
  })();
  await salesLoading;
  salesLoading = null;
}

function filteredSales() {
  const query = $("#sales-search").value.trim().toLowerCase();
  const period = $("#sales-period").value;
  const status = $("#sales-status").value;
  const today = localDate();
  const previousMonth = localDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  return sales.filter((sale) => {
    const matchesPeriod = period === "all" || (period === "month" && sale.date.startsWith(today.slice(0, 7))) || (period === "last-month" && sale.date.startsWith(previousMonth.slice(0, 7))) || (period === "year" && sale.date.startsWith(today.slice(0, 4)));
    const matchesQuery = !query || [sale.productName, sale.productSku, sale.customerName, sale.notes].join(" ").toLowerCase().includes(query);
    return matchesPeriod && matchesQuery && (status === "all" || sale.status === status);
  }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

function renderSales() {
  const visible = filteredSales();
  const figures = salesFigures(visible);
  $("#sales-revenue").textContent = saleMoney(figures.totalKes);
  $("#sales-count").textContent = figures.count.toLocaleString("en-KE");
  $("#sales-units").textContent = figures.units.toLocaleString("en-KE");
  $("#sales-average").textContent = saleMoney(figures.averageKes);
  const max = Math.max(1, ...figures.months.map((month) => month.totalKes));
  $("#sales-months").innerHTML = figures.months.map((month) => `<div class="sales-month-row"><span>${month.label}</span><div class="bar-track" aria-hidden="true"><i style="width:${Math.round(month.totalKes / max * 100)}%"></i></div><strong>${saleMoney(month.totalKes)}</strong></div>`).join("");
  $("#sales-top-products").innerHTML = figures.topProducts.length ? figures.topProducts.map((item) => `<div class="sales-top-row"><div><strong>${escapeHtml(item.name)}</strong><small>${item.units} items / sets sold</small></div><span>${saleMoney(item.totalKes)}</span></div>`).join("") : '<p class="loading-inline">Record a sale to see your top selling items.</p>';
  $("#sales-record-count").textContent = `${visible.length} of ${sales.length} records · Figures follow your filters`;
  $("#sales-rows").innerHTML = visible.length ? visible.map((sale) => `<tr class="${sale.status === "void" ? "sale-void" : ""}">
    <td>${new Date(`${sale.date}T12:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</td>
    <td class="sale-item"><strong>${escapeHtml(sale.productName)}</strong><small>${escapeHtml(sale.productSku || "Previous / other item")}${sale.status === "void" ? " · VOIDED" : ""}</small>${sale.notes ? `<small>${escapeHtml(sale.notes)}</small>` : ""}</td>
    <td>${escapeHtml(sale.customerName || "Walk-in")}</td><td>${sale.quantity}</td><td>${saleMoney(sale.unitPriceKes)}</td><td><strong>${saleMoney(sale.totalKes)}</strong></td>
    <td><button type="button" class="edit-button" data-sale-edit="${encodeURIComponent(sale.id)}">Edit</button></td>
  </tr>`).join("") : `<tr><td colspan="7" class="loading">${sales.length ? "No sales match your filters." : "No sales recorded yet. Select Record sale to add your first sale."}</td></tr>`;
  renderDashboardSales();
}

function renderDashboardSales() {
  const completed = sales.filter((sale) => sale.status === "completed");
  const monthKey = localDate().slice(0, 7);
  const monthSales = completed.filter((sale) => sale.date.startsWith(monthKey));
  const allFigures = salesFigures(completed);
  const monthFigures = salesFigures(monthSales);
  $("#dash-sales-total").textContent = saleMoney(allFigures.totalKes);
  $("#dash-sales-month").textContent = saleMoney(monthFigures.totalKes);
  $("#dash-sales-month-count").textContent = `${monthFigures.count} sale${monthFigures.count === 1 ? "" : "s"} this month`;
  const recent = [...sales].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  $("#dashboard-sales").innerHTML = recent.length ? recent.map((sale) => `<div class="dashboard-sale-row${sale.status === "void" ? " sale-void" : ""}">
    <div><strong>${escapeHtml(sale.productName)}</strong><small>${new Date(`${sale.date}T12:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}${sale.status === "void" ? " · VOIDED" : ""}</small></div>
    <span>${escapeHtml(sale.customerName || "Walk-in")}</span><b>${saleMoney(sale.totalKes)}</b><button type="button" data-dashboard-sale="${encodeURIComponent(sale.id)}">Edit</button>
  </div>`).join("") : '<p class="loading-inline">No sales recorded yet. Use Record a sale to add the first one.</p>';
}

async function openSaleEditor(sale = null, client = null) {
  await Promise.all([salesLoaded ? Promise.resolve() : loadSales(), clientsLoaded ? Promise.resolve() : loadClients()]);
  if (!salesLoaded) return;
  editingSaleId = sale?.id || null;
  saleSubmissionId = sale?.id || crypto.randomUUID();
  const form = $("#sale-form");
  form.reset();
  // Use DOM options so product and client names cannot become HTML attributes.
  form.elements.productSku.replaceChildren(new Option("Other / previous item", ""), ...products.map((product) => new Option(`${product.name} · ${product.sku}`, product.sku)));
  form.elements.clientId.replaceChildren(new Option("Walk-in / no saved client", ""), ...clients.map((item) => new Option(`${item.firstName} ${item.lastName}${item.company ? ` · ${item.company}` : ""}`, item.id)));
  if (sale?.productSku && !products.some((item) => item.sku === sale.productSku)) form.elements.productSku.add(new Option(`${sale.productName} · Previous product`, sale.productSku));
  if (sale?.clientId && !clients.some((item) => item.id === sale.clientId)) form.elements.clientId.add(new Option(sale.customerName, sale.clientId));
  const values = sale || { quantity: 1, date: localDate(), status: "completed", clientId: client?.id || "", customerName: client ? `${client.firstName} ${client.lastName}` : "" };
  for (const [key, value] of Object.entries(values)) if (form.elements[key]) form.elements[key].value = value;
  $("#sale-editor-title").textContent = sale ? "Edit sale" : "Record sale";
  $("#sale-save-status").textContent = "";
  updateSalePreview();
  $("#sale-editor").showModal();
}

function updateSalePreview() {
  const form = $("#sale-form");
  $("#sale-total-preview").textContent = saleMoney(Math.round(Number(form.elements.unitPriceKes.value || 0) * 100) * Number(form.elements.quantity.value || 0) / 100);
  const product = products.find((item) => item.sku === form.elements.productSku.value);
  $("#sale-catalogue-price").textContent = product ? `Catalogue price: ${saleMoney(product.priceKes)}. Enter the actual price agreed.` : "Enter the price you actually sold it for.";
}

async function saveSale(event) {
  event.preventDefault();
  if (saleSaving) return;
  saleSaving = true;
  const input = { ...Object.fromEntries(new FormData($("#sale-form"))), id: saleSubmissionId };
  for (const selector of ["#save-sale", "#close-sale-editor", "#cancel-sale-editor"]) $(selector).disabled = true;
  $("#save-sale").textContent = "Saving…";
  $("#sale-save-status").textContent = "Saving sale…";
  try {
    const result = await api("/api/admin-sales", { method: editingSaleId ? "PUT" : "POST", body: JSON.stringify(input) });
    const index = sales.findIndex((sale) => sale.id === result.sale.id);
    if (index >= 0) sales[index] = result.sale; else sales.push(result.sale);
    $("#sale-editor").close();
    renderSales();
    showNotice(`${result.sale.productName} saved at ${saleMoney(result.sale.totalKes)}${result.sale.status === "void" ? " · Voided, excluded from figures." : "."}`);
  } catch (error) { $("#sale-save-status").textContent = error.message; }
  finally {
    saleSaving = false;
    for (const selector of ["#save-sale", "#close-sale-editor", "#cancel-sale-editor"]) $(selector).disabled = false;
    $("#save-sale").textContent = "Save sale";
  }
}

function showNotice(message, error = false) {
  const notice = $("#notice");
  notice.textContent = message;
  notice.className = `notice global-notice${error ? " error" : ""}`;
  notice.hidden = false;
  clearTimeout(showNotice.timer);
  showNotice.timer = setTimeout(() => { notice.hidden = true; }, 7000);
}

function formProduct() {
  const form = $("#product-form");
  const data = new FormData(form);
  return {
    sku: data.get("sku"), name: data.get("name"), categorySlug: data.get("categorySlug"), status: data.get("status"), stock: data.get("stock"),
    description: data.get("description"), sizes: data.get("sizes"), colors: data.get("colors"), image: data.get("image"), websiteVisible: data.get("websiteVisible") === "on",
    costCny: Number(data.get("costCny") || 0), costKes: Number(data.get("costKes") || 0), priceCny: Number(data.get("priceCny") || 0), priceKes: Number(data.get("priceKes") || 0), priceUsd: Number(data.get("priceUsd") || 0),
  };
}

function openEditor(product = null) {
  editingSku = product?.sku || null;
  const form = $("#product-form");
  form.reset();
  $("#editor-title").textContent = product ? "Edit product" : "Add product";
  $("#editor-sku-note").textContent = product ? `${product.sku} · Saved in Google Sheets` : "Create a complete listing, then decide when it goes live.";
  form.elements.sku.readOnly = Boolean(product);
  const defaults = { status: "Out of Stock", stock: "0", categorySlug: "golf_irons", websiteVisible: false };
  for (const [key, value] of Object.entries(product || defaults)) {
    if (!form.elements[key]) continue;
    if (form.elements[key].type === "checkbox") form.elements[key].checked = Boolean(value);
    else form.elements[key].value = value ?? "";
  }
  const preview = $("#editor-preview");
  preview.hidden = !product?.websiteVisible;
  preview.href = product ? `/shop/product/${product.sku.toLowerCase()}/` : "#";
  updateImagePreview();
  updateMargin();
  $("#save-status").textContent = "";
  $("#editor").showModal();
}

function updateImagePreview() {
  const url = $("#image-url").value.trim();
  $("#image-preview").innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Product preview">` : "<span>No image</span>";
}

function updateMargin() {
  const form = $("#product-form");
  const cost = Number(form.elements.costKes.value || 0);
  const price = Number(form.elements.priceKes.value || 0);
  $("#margin-value").textContent = price > 0 ? `${Math.round(((price - cost) / price) * 100)}%` : "—";
}

const CNY_TO_KES = 19;
const USD_TO_KES = 129.5;
let pricingUpdating = false;

function numericInputValue(input) {
  const value = Number(input.value);
  return input.value !== "" && Number.isFinite(value) ? value : null;
}

function convertedValue(value, decimals) {
  return decimals === 0 ? String(Math.round(value)) : value.toFixed(decimals);
}

function syncPricing(source) {
  if (pricingUpdating) return;
  pricingUpdating = true;
  const form = $("#product-form");
  const input = form.elements[source];
  const value = numericInputValue(input);
  const set = (name, next, decimals) => { form.elements[name].value = next === null ? "" : convertedValue(next, decimals); };

  if (source === "costCny") set("costKes", value === null ? null : value * CNY_TO_KES, 0);
  if (source === "costKes") set("costCny", value === null ? null : value / CNY_TO_KES, 2);

  if (source === "priceCny") {
    const kes = value === null ? null : value * CNY_TO_KES;
    set("priceKes", kes, 0);
    set("priceUsd", kes === null ? null : kes / USD_TO_KES, 2);
  }
  if (source === "priceKes") {
    set("priceCny", value === null ? null : value / CNY_TO_KES, 2);
    set("priceUsd", value === null ? null : value / USD_TO_KES, 2);
  }
  if (source === "priceUsd") {
    const kes = value === null ? null : value * USD_TO_KES;
    set("priceKes", kes, 0);
    set("priceCny", kes === null ? null : kes / CNY_TO_KES, 2);
  }

  updateMargin();
  pricingUpdating = false;
}

async function uploadImage(file) {
  const buffer = await file.arrayBuffer();
  return api("/api/admin-image", { method: "POST", body: buffer, headers: { "content-type": file.type, "x-filename": file.name } });
}

async function save(event) {
  event.preventDefault();
  const button = $("#save-product");
  const status = $("#save-status");
  button.disabled = true;
  status.textContent = "Saving to Google Sheets…";
  try {
    const file = $("#image-file").files[0];
    if (file) {
      status.textContent = "Uploading product image…";
      const uploaded = await uploadImage(file);
      $("#image-url").value = uploaded.url;
    }
    const product = formProduct();
    status.textContent = "Saving and starting website update…";
    await api("/api/admin-products", { method: editingSku ? "PUT" : "POST", body: JSON.stringify(product) });
    $("#editor").close();
    showNotice(`${product.name} saved. The live website rebuild has started.`);
    await loadProducts();
    showView(activeView, false);
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function toggleVisibility(sku) {
  const product = products.find((item) => item.sku === sku);
  if (!product) return;
  const next = { ...product, websiteVisible: !product.websiteVisible };
  try {
    await api("/api/admin-products", { method: "PUT", body: JSON.stringify(next) });
    product.websiteVisible = next.websiteVisible;
    renderProducts();
    renderDashboard();
    showNotice(`${product.name} is now ${next.websiteVisible ? "being published" : "private"}. Website rebuild started.`);
  } catch (error) {
    showNotice(error.message, true);
  }
}

const categoryOptions = categories.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
$("#product-form").elements.categorySlug.innerHTML = categoryOptions;

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("#login-error").textContent = "";
  try {
    await api("/api/admin-auth", { method: "POST", body: JSON.stringify({ password: $("#password").value.trim() }) });
    showApp();
    await loadProducts();
  } catch (error) {
    $("#login-error").textContent = error.message;
    $("#password").focus();
    $("#password").select();
  }
});
$("#show-password").addEventListener("change", (event) => { $("#password").type = event.target.checked ? "text" : "password"; });
$("#logout").addEventListener("click", async () => { await fetch("/api/admin-auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); location.reload(); });

for (const view of Object.keys(viewCopy)) $("#nav-" + view).addEventListener("click", (event) => { event.preventDefault(); view === "categories" ? openAllCategories() : showView(view); });
$$("[data-go]").forEach((button) => button.addEventListener("click", () => {
  const target = button.dataset.go;
  if (button.dataset.filterTarget) setProductFilter(button.dataset.filterTarget);
  target === "categories" ? openAllCategories() : showView(target);
}));
$("[data-quick='add']").addEventListener("click", () => openEditor());
$("#new-product").addEventListener("click", () => openEditor());
$("#refresh").addEventListener("click", () => activeView === "clients" ? loadClients() : activeView === "sales" ? loadSales() : activeView === "dashboard" ? Promise.all([loadProducts(), loadSales()]) : loadProducts());
$("#new-client").addEventListener("click", () => openClientEditor());
$("#client-search").addEventListener("input", renderClients);
$("#client-rows").addEventListener("click", (event) => {
  if (event.target.closest("[data-client-retry]")) { loadClients(); return; }
  const saleButton = event.target.closest("[data-client-sale]");
  if (saleButton) {
    const client = clients.find((item) => item.id === decodeURIComponent(saleButton.dataset.clientSale));
    showView("sales");
    openSaleEditor(null, client);
    return;
  }
  const button = event.target.closest("[data-client-edit]");
  if (button) openClientEditor(clients.find((client) => client.id === decodeURIComponent(button.dataset.clientEdit)));
});
$("#client-form").addEventListener("submit", saveClient);
$("#use-client-phone").addEventListener("click", () => {
  $("#client-form").elements.whatsapp.value = $("#client-form").elements.phone.value;
});
$("#close-client-editor").addEventListener("click", () => $("#client-editor").close());
$("#cancel-client-editor").addEventListener("click", () => $("#client-editor").close());
$("#client-editor").addEventListener("cancel", (event) => { if (clientSaving) event.preventDefault(); });
$("#new-sale").addEventListener("click", () => openSaleEditor());
$("[data-quick='sale']").addEventListener("click", () => { showView("sales"); openSaleEditor(); });
$("#sales-search").addEventListener("input", renderSales);
$("#sales-period").addEventListener("change", renderSales);
$("#sales-status").addEventListener("change", renderSales);
$("#sales-rows").addEventListener("click", (event) => {
  if (event.target.closest("[data-sales-retry]")) { loadSales(); return; }
  const button = event.target.closest("[data-sale-edit]");
  if (button) openSaleEditor(sales.find((sale) => sale.id === decodeURIComponent(button.dataset.saleEdit)));
});
$("#sale-form").addEventListener("submit", saveSale);
$("#sale-product").addEventListener("change", () => {
  const product = products.find((item) => item.sku === $("#sale-product").value);
  if (product) $("#sale-form").elements.productName.value = product.name;
  updateSalePreview();
});
$("#sale-client").addEventListener("change", () => {
  const client = clients.find((item) => item.id === $("#sale-client").value);
  $("#sale-form").elements.customerName.value = client ? `${client.firstName} ${client.lastName}` : "";
});
$("#sale-form").elements.quantity.addEventListener("input", updateSalePreview);
$("#sale-form").elements.unitPriceKes.addEventListener("input", updateSalePreview);
$("#close-sale-editor").addEventListener("click", () => $("#sale-editor").close());
$("#cancel-sale-editor").addEventListener("click", () => $("#sale-editor").close());
$("#sale-editor").addEventListener("cancel", (event) => { if (saleSaving) event.preventDefault(); });

$("#dashboard").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-dashboard-edit]");
  const category = event.target.closest("[data-dashboard-category]");
  const sale = event.target.closest("[data-dashboard-sale]");
  if (edit) openEditor(products.find((product) => product.sku === edit.dataset.dashboardEdit));
  else if (category) showCategoryProducts(category.dataset.dashboardCategory);
  else if (sale) openSaleEditor(sales.find((item) => item.id === decodeURIComponent(sale.dataset.dashboardSale)));
});

$("#category-groups").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-category-edit]");
  const category = event.target.closest("[data-category]");
  if (edit) openEditor(products.find((product) => product.sku === edit.dataset.categoryEdit));
  else if (event.target.closest("[data-all-categories]")) openAllCategories();
  else if (category) showCategoryProducts(category.dataset.category);
});

$("#product-rows").addEventListener("click", (event) => {
  const select = event.target.closest("[data-select]");
  const edit = event.target.closest("[data-edit]");
  const toggle = event.target.closest("[data-toggle]");
  const category = event.target.closest("[data-category]");
  if (select) {
    select.checked ? selectedSkus.add(select.dataset.select) : selectedSkus.delete(select.dataset.select);
    updateBulkBar();
  } else if (edit) openEditor(products.find((product) => product.sku === edit.dataset.edit));
  else if (toggle) toggleVisibility(toggle.dataset.toggle);
  else if (category) selectCategory(category.dataset.category);
});

$("#select-all").addEventListener("change", (event) => {
  for (const product of filteredProducts()) event.target.checked ? selectedSkus.add(product.sku) : selectedSkus.delete(product.sku);
  renderProducts();
});
$("#clear-selection").addEventListener("click", () => { selectedSkus.clear(); renderProducts(); });
$$("[data-bulk]").forEach((button) => button.addEventListener("click", () => runBulkAction(button.dataset.bulk)));
$$("[data-filter]").forEach((button) => button.addEventListener("click", () => setProductFilter(button.dataset.filter)));
$("#search").addEventListener("input", renderProducts);
$("#category-filter").addEventListener("change", renderProducts);
$("#sort-products").addEventListener("change", renderProducts);

$("#inventory-search").addEventListener("input", renderInventory);
$("#inventory-category").addEventListener("change", renderInventory);
$("#inventory-rows").addEventListener("input", (event) => {
  const input = event.target.closest("[data-inventory-sku]");
  if (!input) return;
  const quantity = Math.max(0, Math.floor(Number(input.value) || 0));
  input.value = quantity;
  const original = stockNumber(products.find((product) => product.sku === input.dataset.inventorySku));
  if (quantity === original) inventoryChanges.delete(input.dataset.inventorySku);
  else inventoryChanges.set(input.dataset.inventorySku, quantity);
  renderInventory();
});
$("#inventory-rows").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-inventory-edit]");
  if (edit) openEditor(products.find((product) => product.sku === edit.dataset.inventoryEdit));
});
$("#save-inventory").addEventListener("click", saveInventory);

$("#close-editor").addEventListener("click", () => $("#editor").close());
$("#cancel-editor").addEventListener("click", () => $("#editor").close());
$("#product-form").addEventListener("submit", save);
$("#image-url").addEventListener("input", updateImagePreview);
for (const field of ["costCny", "costKes", "priceCny", "priceKes", "priceUsd"]) {
  $("#product-form").elements[field].addEventListener("input", () => syncPricing(field));
}
$("#product-form").elements.stock.addEventListener("input", (event) => {
  const quantity = Number(event.target.value || 0);
  const status = $("#product-form").elements.status;
  if (quantity > 0 && status.value === "Out of Stock") status.value = "In Stock";
  if (quantity <= 0 && status.value === "In Stock") status.value = "Out of Stock";
});

checkSession();
