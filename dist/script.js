// Golf Kenya - Script v2 (Optimized)

// ── Lightweight Scroll Animation (replaces AOS) ──
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        var animEls = document.querySelectorAll('[data-anim]');
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        animEls.forEach(function(el) { observer.observe(el); });
    } else {
        document.querySelectorAll('[data-anim]').forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
});

// ── Navbar scroll ──
(function() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                navbar.classList.toggle('scrolled', window.pageYOffset > 100);
                ticking = false;
            });
            ticking = true;
        }
    });
})();

// ── Mobile nav toggle ──
(function() {
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.querySelector('.nav-menu');
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    });

    navMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });
})();

// ── Product filtering ──
(function() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var productCards = document.querySelectorAll('.product-card');
    if (!filterBtns.length || !productCards.length) return;

    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var filter = btn.dataset.filter;
            productCards.forEach(function(card) {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(function() {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(function() { card.style.display = 'none'; }, 300);
                }
            });
        });
    });
})();

// ── WhatsApp inquiry ──
function inquireProduct(productName, price) {
    var msg = encodeURIComponent("Hi! I'm interested in:\n\n*" + productName + "*\nPrice: " + price + "\n\nPlease provide more details.");
    window.open('https://wa.me/254116416105?text=' + msg, '_blank');
}

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ── Lazy loading fallback for older browsers ──
if (!('loading' in HTMLImageElement.prototype)) {
    document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
        var src = img.getAttribute('data-src');
        if (src) img.src = src;
    });
}

// ── IntersectionObserver lazy loading ──
if ('IntersectionObserver' in window) {
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    var imgObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var img = entry.target;
                if (img.dataset.src) img.src = img.dataset.src;
                imgObserver.unobserve(img);
            }
        });
    });
    lazyImages.forEach(function(img) { imgObserver.observe(img); });
}

console.log('Karibu Golf - Optimized v2');
