const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const categories = [
  ["drivers","Drivers"],["woods","Fairway Woods"],["hybrids","Hybrids"],["golf_irons","Irons"],["wedges","Wedges"],["putters","Putters"],
  ["mens_shoes","Men’s Shoes"],["womens_shoes","Women’s Shoes"],["mens_polos","Men’s Polos"],["mens_pants","Men’s Trousers"],
  ["mens_jackets","Men’s Jackets"],["mens_shorts","Men’s Shorts"],["womens_polos","Women’s Polos"],["womens_skirts","Women’s Skirts"],
  ["womens_pants","Women’s Trousers"],["womens_dresses","Women’s Dresses"],["womens_jackets","Women’s Jackets"],["womens_tops","Women’s Tops"],
  ["bags","Golf Bags"],["balls","Golf Balls"],["gloves","Gloves"],["hats_and_caps","Hats & Caps"],["grips","Grips"],["range_finders","Range Finders"],["accessories","Accessories"],
];
const categoryGroups = [
  ["Clubs", ["drivers", "woods", "hybrids", "golf_irons", "wedges", "putters"]],
  ["Shoes", ["mens_shoes", "womens_shoes"]],
  ["Men’s apparel", ["mens_polos", "mens_pants", "mens_jackets", "mens_shorts"]],
  ["Women’s apparel", ["womens_polos", "womens_skirts", "womens_pants", "womens_dresses", "womens_jackets", "womens_tops"]],
  ["Bags, balls & accessories", ["bags", "balls", "gloves", "hats_and_caps", "grips", "range_finders", "accessories"]],
];
let products = [];
let activeFilter = "all";
let editingSku = null;

const api = async (url, options = {}) => {
  const response = await fetch(url, { credentials: "same-origin", ...options, headers: { ...(options.body instanceof ArrayBuffer ? {} : { "content-type": "application/json" }), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) { showLogin(); throw new Error(data.error || "Please sign in again."); }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

function showLogin() { $("#app").hidden = true; $("#login").hidden = false; }
function showApp() { $("#login").hidden = true; $("#app").hidden = false; }
function money(value) { return `KSh ${Math.round(Number(value) || 0).toLocaleString("en-KE")}`; }
function escapeHtml(value) { const node = document.createElement("span"); node.textContent = String(value ?? ""); return node.innerHTML; }
function categoryLabel(slug) { return categories.find(([value]) => value === slug)?.[1] || slug.replaceAll("_", " "); }

async function checkSession() {
  const response = await fetch("/api/admin-auth", { credentials: "same-origin" });
  const data = await response.json().catch(() => ({}));
  if (data.authenticated) { showApp(); await loadProducts(); } else showLogin();
}

async function loadProducts() {
  $("#product-rows").innerHTML = '<tr><td colspan="6" class="loading">Loading your catalog…</td></tr>';
  try {
    const data = await api("/api/admin-products");
    products = data.products;
    $("#stat-total").textContent = data.summary.total;
    $("#stat-live").textContent = data.summary.live;
    $("#stat-private").textContent = data.summary.private;
    $("#stat-stock").textContent = data.summary.inStock;
    populateCategoryFilter();
    const requestedCategory = new URL(location.href).searchParams.get("category") || "";
    if (requestedCategory && $("#category-filter").querySelector(`option[value="${CSS.escape(requestedCategory)}"]`)) $("#category-filter").value = requestedCategory;
    renderProducts(); renderCategories(); showView(location.hash === "#categories" ? "categories" : "products", false);
  } catch (error) { showNotice(error.message, true); }
}

function populateCategoryFilter() {
  const selected = $("#category-filter").value;
  const used = new Set(products.map((product) => product.categorySlug));
  $("#category-filter").innerHTML = '<option value="">All categories</option>' + categories.filter(([slug]) => used.has(slug)).map(([slug,label]) => `<option value="${slug}">${label}</option>`).join("");
  $("#category-filter").value = selected;
}

function filteredProducts() {
  const query = $("#search").value.trim().toLowerCase();
  const category = $("#category-filter").value;
  return products.filter((product) => {
    const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    const matchesCategory = !category || product.categorySlug === category;
    const matchesFilter = activeFilter === "all" || (activeFilter === "live" && product.websiteVisible) || (activeFilter === "private" && !product.websiteVisible) || (activeFilter === "stock" && product.status.toLowerCase() === "in stock" && Number(product.stock) > 0);
    return matchesQuery && matchesCategory && matchesFilter;
  });
}

function renderProducts() {
  const visible = filteredProducts();
  $("#product-rows").innerHTML = visible.length ? visible.map((product) => `<tr>
    <td><div class="product-cell">${product.image ? `<img class="thumb" src="${escapeHtml(product.image)}" alt="" onerror="this.outerHTML='<span class=thumb-placeholder>◇</span>'">` : '<span class="thumb-placeholder">◇</span>'}<div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)}</small></div></div></td>
    <td><button type="button" class="category-link" data-category="${escapeHtml(product.categorySlug)}">${escapeHtml(categoryLabel(product.categorySlug))}</button></td><td><strong>${money(product.priceKes)}</strong><br><small>¥${Number(product.priceCny || 0).toLocaleString()}</small></td>
    <td>${escapeHtml(product.stock)} <small>${escapeHtml(product.status)}</small></td>
    <td><button class="badge ${product.websiteVisible ? "live" : "private"}" data-toggle="${escapeHtml(product.sku)}"><i></i>${product.websiteVisible ? "LIVE" : "PRIVATE"}</button></td>
    <td><button class="edit-button" data-edit="${escapeHtml(product.sku)}">Edit</button></td></tr>`).join("") : '<tr><td colspan="6" class="loading">No products match this view.</td></tr>';
}

function selectCategory(slug) {
  activeFilter = "all";
  $$('[data-filter]').forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
  $("#category-filter").value = slug;
  const url = new URL(location.href);
  if (slug) url.searchParams.set("category", slug); else url.searchParams.delete("category");
  url.hash = "products";
  history.replaceState({}, "", url);
  showView("products", false);
  renderProducts();
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

function showView(view, updateHash = true) {
  const categoriesOpen = view === "categories";
  $("#products").hidden = categoriesOpen;
  $("#categories").hidden = !categoriesOpen;
  $("#view-title").textContent = categoriesOpen ? "Categories" : "Products";
  $("#new-product").hidden = categoriesOpen;
  $("#nav-products").classList.toggle("active", !categoriesOpen);
  $("#nav-categories").classList.toggle("active", categoriesOpen);
  if (updateHash) history.replaceState({}, "", `${location.pathname}${location.search}#${categoriesOpen ? "categories" : "products"}`);
}

function showNotice(message, error = false) {
  const notice = $("#notice"); notice.textContent = message; notice.className = `notice${error ? " error" : ""}`; notice.hidden = false;
  clearTimeout(showNotice.timer); showNotice.timer = setTimeout(() => { notice.hidden = true; }, 7000);
}

function formProduct() {
  const form = $("#product-form"); const data = new FormData(form);
  return {
    sku: data.get("sku"), name: data.get("name"), categorySlug: data.get("categorySlug"), status: data.get("status"), stock: data.get("stock"),
    description: data.get("description"), sizes: data.get("sizes"), colors: data.get("colors"), image: data.get("image"), websiteVisible: data.get("websiteVisible") === "on",
    costCny: Number(data.get("costCny") || 0), costKes: Number(data.get("costKes") || 0), priceCny: Number(data.get("priceCny") || 0), priceKes: Number(data.get("priceKes") || 0), priceUsd: Number(data.get("priceUsd") || 0),
  };
}

function openEditor(product = null) {
  editingSku = product?.sku || null; const form = $("#product-form"); form.reset();
  $("#editor-title").textContent = product ? "Edit product" : "Add product";
  form.elements.sku.readOnly = Boolean(product);
  for (const [key, value] of Object.entries(product || { status: "Out of Stock", stock: "0", categorySlug: "golf_irons" })) if (form.elements[key]) {
    if (form.elements[key].type === "checkbox") form.elements[key].checked = Boolean(value); else form.elements[key].value = value ?? "";
  }
  updateImagePreview(); $("#save-status").textContent = ""; $("#editor").showModal();
}

function updateImagePreview() {
  const url = $("#image-url").value.trim(); $("#image-preview").innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Product preview">` : "<span>No image</span>";
}

async function uploadImage(file) {
  const buffer = await file.arrayBuffer();
  return api("/api/admin-image", { method: "POST", body: buffer, headers: { "content-type": file.type, "x-filename": file.name } });
}

async function save(event) {
  event.preventDefault(); const button = $("#save-product"); const status = $("#save-status"); button.disabled = true; status.textContent = "Saving to Google Sheet…";
  try {
    const file = $("#image-file").files[0];
    if (file) { status.textContent = "Uploading product image…"; const uploaded = await uploadImage(file); $("#image-url").value = uploaded.url; }
    const product = formProduct(); status.textContent = "Saving and starting website update…";
    await api("/api/admin-products", { method: editingSku ? "PUT" : "POST", body: JSON.stringify(product) });
    $("#editor").close(); showNotice(`${product.name} saved. The live website rebuild has started.`); await loadProducts();
  } catch (error) { status.textContent = error.message; } finally { button.disabled = false; }
}

async function toggleVisibility(sku) {
  const product = products.find((item) => item.sku === sku); if (!product) return;
  const next = { ...product, websiteVisible: !product.websiteVisible };
  try { await api("/api/admin-products", { method: "PUT", body: JSON.stringify(next) }); product.websiteVisible = next.websiteVisible; renderProducts(); showNotice(`${product.name} is now ${next.websiteVisible ? "being published" : "private"}. Website rebuild started.`); await loadProducts(); }
  catch (error) { showNotice(error.message, true); }
}

const categoryOptions = categories.map(([value,label]) => `<option value="${value}">${label}</option>`).join("");
$("#product-form").elements.categorySlug.innerHTML = categoryOptions;
$("#login-form").addEventListener("submit", async (event) => { event.preventDefault(); $("#login-error").textContent = ""; try { await api("/api/admin-auth", { method: "POST", body: JSON.stringify({ password: $("#password").value.trim() }) }); showApp(); await loadProducts(); } catch (error) { $("#login-error").textContent = error.message; $("#password").focus(); $("#password").select(); } });
$("#show-password").addEventListener("change", (event) => { $("#password").type = event.target.checked ? "text" : "password"; });
$("#logout").addEventListener("click", async () => { await fetch("/api/admin-auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); location.reload(); });
$("#nav-products").addEventListener("click", (event) => { event.preventDefault(); showView("products"); });
$("#nav-categories").addEventListener("click", (event) => { event.preventDefault(); showView("categories"); });
$("#category-groups").addEventListener("click", (event) => { const category = event.target.closest("[data-category]"); if (category) selectCategory(category.dataset.category); });
$("#new-product").addEventListener("click", () => openEditor()); $("#close-editor").addEventListener("click", () => $("#editor").close()); $("#cancel-editor").addEventListener("click", () => $("#editor").close());
$("#product-form").addEventListener("submit", save); $("#image-url").addEventListener("input", updateImagePreview); $("#search").addEventListener("input", renderProducts); $("#category-filter").addEventListener("change", (event) => selectCategory(event.target.value)); $("#refresh").addEventListener("click", loadProducts);
$("#product-form").elements.costCny.addEventListener("input", (event) => { $("#product-form").elements.costKes.value = Math.round(Number(event.target.value || 0) * 19); });
$("#product-form").elements.priceCny.addEventListener("input", (event) => { const kes = Math.round(Number(event.target.value || 0) * 19); $("#product-form").elements.priceKes.value = kes; $("#product-form").elements.priceUsd.value = (kes / 129.5).toFixed(2); });
$("#product-rows").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit]"); const toggle = event.target.closest("[data-toggle]"); const category = event.target.closest("[data-category]"); if (edit) openEditor(products.find((product) => product.sku === edit.dataset.edit)); if (toggle) toggleVisibility(toggle.dataset.toggle); if (category) selectCategory(category.dataset.category); });
$$('[data-filter]').forEach((button) => button.addEventListener("click", () => { activeFilter = button.dataset.filter; $$('[data-filter]').forEach((item) => item.classList.toggle("active", item === button)); renderProducts(); }));
checkSession();
