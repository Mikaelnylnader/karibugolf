/** Karibu Golf — Cart System */
var cart = JSON.parse(localStorage.getItem('karibuCart') || '[]');

function saveCart() {
    localStorage.setItem('karibuCart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(name, price, img, config) {
    var key = name + '|' + (config || '');
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
        if ((cart[i].name + '|' + (cart[i].config || '')) === key) {
            existing = cart[i];
            break;
        }
    }
    if (existing) {
        existing.qty = (existing.qty || 1) + 1;
    } else {
        var priceNum = parseInt(String(price).replace(/[^0-9]/g, '')) || 0;
        cart.push({ name: name, price: priceNum, img: img, config: config || '', qty: 1 });
    }
    saveCart();
    showCartFeedback();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function updateQty(index, qty) {
    qty = parseInt(qty) || 1;
    if (qty < 1) { removeFromCart(index); return; }
    cart[index].qty = qty;
    saveCart();
    renderCart();
}

function getCartCount() {
    var count = 0;
    for (var i = 0; i < cart.length; i++) count += (cart[i].qty || 1);
    return count;
}

function getCartTotal() {
    var total = 0;
    for (var i = 0; i < cart.length; i++) total += (cart[i].price || 0) * (cart[i].qty || 1);
    return total;
}

function updateCartBadge() {
    var count = getCartCount();
    document.querySelectorAll('.cart-badge').forEach(function(b) {
        b.textContent = count;
        b.style.display = count ? 'flex' : 'none';
    });
}

function showCartFeedback() {
    document.querySelectorAll('.btn-add-cart').forEach(function(btn) {
        btn.textContent = '\u2713 Added!';
        setTimeout(function() { btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart'; }, 1500);
    });
}

function clearCart() {
    cart = [];
    saveCart();
    if (typeof renderCart === 'function') renderCart();
}

// Init on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
