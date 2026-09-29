const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const categories = [
  ["drivers", "Drivers"], ["woods", "Fairway Woods"], ["hybrids", "Hybrids"], ["golf_irons", "Irons"], ["wedges", "Wedges"], ["putters", "Putters"],
  ["mens_shoes", "Men’s Shoes"], ["womens_shoes", "Women’s Shoes"], ["mens_polos", "Men’s Polos"], ["mens_pants", "Men’s Trousers"],
  ["mens_jackets", "Men’s Jackets"], ["mens_shorts", "Men’s Shorts"], ["womens_polos", "Women’s Polos"], ["womens_skirts", "Women’s Skirts"],
  ["womens_pants", "Women’s Trousers"], ["womens_dresses", "Women’s Dresses"], ["womens_jackets", "Women’s Jackets"], ["womens_tops", "Women’s Tops"],
  ["bags", "Golf Bags"], ["balls", "Golf Balls"], ["gloves", "Gloves"], ["hats_and_caps", "Hats & Caps"], ["grips", "Grips"], ["range_finders", "Range Finders"], ["accessories", "Accessories"],
];
const categoryGroups = [
  ["Clubs", ["drivers", "woods", "hybrids", "golf_irons", "wedges", "putters"]],
  ["Shoes", ["mens_shoes", "womens_shoes"]],
  ["Men’s apparel", ["mens_polos", "mens_pants", "mens_jackets", "mens_shorts"]],
  ["Women’s apparel", ["womens_polos", "womens_skirts", "womens_pants", "womens_dresses", "womens_jackets", "womens_tops"]],
  ["Bags, balls & accessories", ["bags", "balls", "gloves", "hats_and_caps", "grips", "range_finders", "accessories"]],
];
const viewCopy = {
  dashboard: ["Dashboard", "Your catalogue, stock and live shop in one place."],
  products: ["Products", "Search, filter and manage every product in your catalogue."],
  inventory: ["Inventory", "Update several stock quantities in one save."],
  categories: ["Categories", "Browse the catalogue using the same structure as your shop."],
};

let products = [];
let activeView = "dashboard";
let activeFilter = "all";
let editingSku = null;
const selectedSkus = new Set();
const inventoryChanges = new Map();

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

function showLogin() { $("#app").hidden = true; $("#login").hidden = false; }
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
    "#inventory-out": out,
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
  return products.filter((product) => (!query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)) && (!category || product.categorySlug === category));
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
  }).join("") : '<tr><td colspan="7" class="loading">No inventory matches this view.</td></tr>';
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
  $("#new-product").hidden = view === "categories";
  if (updateHash) {
    const url = new URL(location.href);
    if (view !== "categories") url.searchParams.delete("category");
    url.hash = view;
    history.replaceState({}, "", url);
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
$("#refresh").addEventListener("click", loadProducts);

$("#dashboard").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-dashboard-edit]");
  const category = event.target.closest("[data-dashboard-category]");
  if (edit) openEditor(products.find((product) => product.sku === edit.dataset.dashboardEdit));
  if (category) showCategoryProducts(category.dataset.dashboardCategory);
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
$("#product-form").elements.costCny.addEventListener("input", (event) => {
  $("#product-form").elements.costKes.value = Math.round(Number(event.target.value || 0) * 19);
  updateMargin();
});
$("#product-form").elements.priceCny.addEventListener("input", (event) => {
  const kes = Math.round(Number(event.target.value || 0) * 19);
  $("#product-form").elements.priceKes.value = kes;
  $("#product-form").elements.priceUsd.value = (kes / 129.5).toFixed(2);
  updateMargin();
});
$("#product-form").elements.costKes.addEventListener("input", updateMargin);
$("#product-form").elements.priceKes.addEventListener("input", updateMargin);
$("#product-form").elements.stock.addEventListener("input", (event) => {
  const quantity = Number(event.target.value || 0);
  const status = $("#product-form").elements.status;
  if (quantity > 0 && status.value === "Out of Stock") status.value = "In Stock";
  if (quantity <= 0 && status.value === "In Stock") status.value = "Out of Stock";
});

checkSession();
