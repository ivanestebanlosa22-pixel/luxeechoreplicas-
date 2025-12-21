// ===========================
// LUXEECHOREPLICAS - SCRIPT PREMIUM
// El mejor catálogo jamás creado
// ===========================

// Estado Global
const AppState = {
    products: [],
    filteredProducts: [],
    currentPage: 1,
    productsPerPage: 48,
    filters: {
        category: 'all',
        brand: 'all',
        search: '',
        minPrice: null,
        maxPrice: null,
        sortBy: 'relevance'
    },
    likes: {},
    viewMode: 'grid',
    isLoading: false
};

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando sistema premium...');
    
    // Cargar productos
    initProducts();
    
    // Inicializar componentes
    initFilters();
    initSearch();
    initUI();
    initAnalytics();
    
    // Crear popup USFans
    setTimeout(() => createUSFansPopup(), 2000);
    
    console.log('✅ Sistema premium cargado exitosamente');
});

// ===========================
// CARGA DE PRODUCTOS
// ===========================
function initProducts() {
    if (typeof products === 'undefined') {
        console.error('❌ products.js no cargado');
        showError('Error al cargar el catálogo. Por favor, recarga la página.');
        return;
    }
    
    AppState.products = products;
    AppState.filteredProducts = [...products];
    
    // Cargar likes del localStorage
    loadLikes();
    
    // Generar filtros dinámicos
    generateFilters();
    
    // Renderizar productos iniciales
    renderProducts();
    
    console.log(`✅ ${AppState.products.length} productos cargados`);
    
    // Track evento
    trackEvent('catalog_loaded', { product_count: AppState.products.length });
}

// ===========================
// GENERACIÓN DE FILTROS DINÁMICOS
// ===========================
function generateFilters() {
    const categories = new Map();
    const brands = new Set();
    
    AppState.products.forEach(product => {
        // Categorías
        const cat = product.Categoria || 'Sin categoría';
        categories.set(cat, (categories.get(cat) || 0) + 1);
        
        // Marcas
        const brand = product.Nombre.split(' ')[0];
        brands.add(brand);
    });
    
    // Renderizar categorías
    renderCategoryFilters(categories);
    
    // Renderizar marcas
    renderBrandFilters(brands);
    
    // Actualizar contadores
    updateFilterCounts();
}

function renderCategoryFilters(categories) {
    const container = document.getElementById('categoriesFilter');
    if (!container) return;
    
    const sortedCategories = Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15 categorías
    
    let html = '<button class="chip active" data-category="all">' +
               `Todas <span class="chip-count" id="allCount">${AppState.products.length}</span>` +
               '</button>';
    
    sortedCategories.forEach(([category, count]) => {
        const slug = slugify(category);
        html += `
            <button class="chip" data-category="${category}">
                ${category} <span class="chip-count">${count}</span>
            </button>
        `;
    });
    
    container.innerHTML = html;
}

function renderBrandFilters(brands) {
    const container = document.getElementById('brandsFilter');
    if (!container) return;
    
    const topBrands = ['Nike', 'Jordan', 'Adidas', 'Yeezy', 'Supreme', 'Dior', 'Balenciaga', 'Bape', 'Essentials', 'New Balance', 'Stussy', 'Travis Scott'];
    
    let html = '<button class="chip active" data-brand="all">Todas</button>';
    
    topBrands.forEach(brand => {
        if (Array.from(brands).some(b => b.toLowerCase() === brand.toLowerCase())) {
            html += `<button class="chip" data-brand="${brand}">${brand}</button>`;
        }
    });
    
    container.innerHTML = html;
}

// ===========================
// SISTEMA DE FILTRADO AVANZADO
// ===========================
function initFilters() {
    // Categorías
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-category]')) {
            const category = e.target.closest('[data-category]').dataset.category;
            setFilter('category', category);
            updateActiveFilter(e.target.closest('[data-category]'), 'categoriesFilter');
            trackEvent('filter_category', { category });
        }
    });
    
    // Marcas
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-brand]')) {
            const brand = e.target.closest('[data-brand]').dataset.brand;
            setFilter('brand', brand);
            updateActiveFilter(e.target.closest('[data-brand]'), 'brandsFilter');
            trackEvent('filter_brand', { brand });
        }
    });
    
    // Ordenamiento
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            setFilter('sortBy', e.target.value);
            trackEvent('sort_changed', { sort_by: e.target.value });
        });
    }
    
    // Rango de precio
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    if (minPrice) minPrice.addEventListener('change', () => {
        setFilter('minPrice', minPrice.value ? parseFloat(minPrice.value) : null);
    });
    
    if (maxPrice) maxPrice.addEventListener('change', () => {
        setFilter('maxPrice', maxPrice.value ? parseFloat(maxPrice.value) : null);
    });
    
    // Reset filtros
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Toggle filtros móvil
    const filterToggle = document.getElementById('filterToggle');
    const filtersPanel = document.getElementById('filtersPanel');
    
    if (filterToggle && filtersPanel) {
        filterToggle.addEventListener('click', () => {
            filtersPanel.classList.toggle('active');
        });
    }
}

function setFilter(key, value) {
    AppState.filters[key] = value;
    AppState.currentPage = 1;
    applyFilters();
}

function applyFilters() {
    let filtered = [...AppState.products];
    
    // Filtro de categoría
    if (AppState.filters.category !== 'all') {
        filtered = filtered.filter(p => p.Categoria === AppState.filters.category);
    }
    
    // Filtro de marca
    if (AppState.filters.brand !== 'all') {
        filtered = filtered.filter(p => 
            p.Nombre.toLowerCase().startsWith(AppState.filters.brand.toLowerCase())
        );
    }
    
    // Filtro de búsqueda
    if (AppState.filters.search) {
        const term = AppState.filters.search.toLowerCase();
        filtered = filtered.filter(p =>
            p.Nombre.toLowerCase().includes(term) ||
            p.Descripcion.toLowerCase().includes(term) ||
            p.Categoria.toLowerCase().includes(term)
        );
    }
    
    // Filtro de precio
    if (AppState.filters.minPrice !== null) {
        filtered = filtered.filter(p => p.Precio >= AppState.filters.minPrice);
    }
    
    if (AppState.filters.maxPrice !== null) {
        filtered = filtered.filter(p => p.Precio <= AppState.filters.maxPrice);
    }
    
    // Ordenamiento
    filtered = sortProducts(filtered, AppState.filters.sortBy);
    
    AppState.filteredProducts = filtered;
    updateFilterCounts();
    renderProducts();
    
    // Scroll suave al inicio
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => a.Precio - b.Precio);
        case 'price-desc':
            return sorted.sort((a, b) => b.Precio - a.Precio);
        case 'popular':
            return sorted.sort((a, b) => (AppState.likes[b.ID] || 0) - (AppState.likes[a.ID] || 0));
        case 'newest':
            return sorted.sort((a, b) => b.ID - a.ID);
        case 'relevance':
        default:
            return sorted;
    }
}

function resetFilters() {
    AppState.filters = {
        category: 'all',
        brand: 'all',
        search: '',
        minPrice: null,
        maxPrice: null,
        sortBy: 'relevance'
    };
    
    // Reset UI
    document.querySelectorAll('.chip.active').forEach(chip => chip.classList.remove('active'));
    document.querySelectorAll('.chip[data-category="all"], .chip[data-brand="all"]')
        .forEach(chip => chip.classList.add('active'));
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'relevance';
    
    applyFilters();
    trackEvent('filters_reset');
}

function updateActiveFilter(element, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.querySelectorAll('.chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    element.classList.add('active');
}

function updateFilterCounts() {
    const currentResults = document.getElementById('currentResults');
    const totalResults = document.getElementById('totalResults');
    const categoryCount = document.getElementById('categoryCount');
    
    if (currentResults) currentResults.textContent = AppState.filteredProducts.length;
    if (totalResults) totalResults.textContent = AppState.products.length;
    if (categoryCount) {
        const activeFilters = Object.values(AppState.filters).filter(v => v && v !== 'all').length;
        categoryCount.textContent = activeFilters > 0 ? `(${activeFilters})` : '';
    }
}

// ===========================
// BÚSQUEDA INTELIGENTE
// ===========================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        
        const value = e.target.value.trim();
        
        if (value.length >= 2) {
            searchTimeout = setTimeout(() => {
                setFilter('search', value);
                trackEvent('search', { term: value, results: AppState.filteredProducts.length });
            }, 300);
        } else if (value.length === 0) {
            setFilter('search', '');
        }
    });
    
    // Enter para buscar
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setFilter('search', e.target.value.trim());
        }
    });
}

// ===========================
// RENDERIZADO DE PRODUCTOS
// ===========================
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (AppState.filteredProducts.length === 0) {
        grid.innerHTML = renderEmptyState();
        return;
    }
    
    // Paginación
    const startIdx = (AppState.currentPage - 1) * AppState.productsPerPage;
    const endIdx = startIdx + AppState.productsPerPage;
    const productsToShow = AppState.filteredProducts.slice(startIdx, endIdx);
    
    // Renderizar productos
    grid.innerHTML = productsToShow.map(product => renderProductCard(product)).join('');
    
    // Renderizar paginación
    renderPagination();
    
    // Lazy loading de imágenes
    lazyLoadImages();
}

function renderProductCard(product) {
    const likes = AppState.likes[product.ID] || generateInitialLikes(product.ID);
    const brand = product.Nombre.split(' ')[0];
    const isLiked = AppState.likes[product.ID] > 0;
    
    return `
        <article class="product-card" data-id="${product.ID}" itemscope itemtype="https://schema.org/Product">
            <div class="product-image-container">
                <img 
                    data-src="${product.Imagen}" 
                    alt="${product.Nombre}"
                    class="product-image lazy"
                    itemprop="image"
                    width="400"
                    height="400"
                    loading="lazy"
                    onerror="this.src='images/logo.svg'">
                
                <div class="product-badges">
                    <span class="badge-brand">${brand}</span>
                    ${product.Precio < 20 ? '<span class="badge-deal">Oferta</span>' : ''}
                </div>
                
                <button 
                    class="btn-like ${isLiked ? 'liked' : ''}" 
                    onclick="toggleLike(${product.ID})"
                    aria-label="Me gusta">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor">
                        <path d="M10 18.35l-1.45-1.32C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0c1.74 0 3.41.81 4.5 2.09C11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.54L10 18.35z" stroke-width="2"/>
                    </svg>
                    <span class="like-count">${likes}</span>
                </button>
                
                <a href="${product.Link_USFans}" 
                   target="_blank" 
                   rel="noopener"
                   class="quick-view"
                   onclick="trackEvent('product_quick_view', {product_id: ${product.ID}, product_name: '${product.Nombre}'})"
                   aria-label="Ver producto">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M1 10s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" stroke-width="2"/>
                        <circle cx="10" cy="10" r="3" stroke-width="2"/>
                    </svg>
                </a>
            </div>
            
            <div class="product-info">
                <div class="product-header">
                    <span class="product-category" itemprop="category">${product.Categoria}</span>
                    <span class="product-id">#${product.ID}</span>
                </div>
                
                <h3 class="product-name" itemprop="name">${product.Nombre}</h3>
                
                <p class="product-description" itemprop="description">
                    ${truncateText(product.Descripcion, 100)}
                </p>
                
                <div class="product-features">
                    <span class="feature">✓ Calidad AAA+</span>
                    <span class="feature">✓ QC Fotos</span>
                </div>
                
                <div class="product-footer">
                    <div class="price-section" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                        <span class="price" itemprop="price" content="${product.Precio}">
                            ${product.Precio.toFixed(2)}€
                        </span>
                        <meta itemprop="priceCurrency" content="EUR">
                        <link itemprop="availability" href="https://schema.org/InStock">
                    </div>
                    
                    <a href="${product.Link_USFans}" 
                       target="_blank"
                       rel="noopener" 
                       class="btn-buy"
                       onclick="trackEvent('product_click', {product_id: ${product.ID}, product_name: '${product.Nombre}', price: ${product.Precio}})"
                       aria-label="Comprar en USFans">
                        <img src="images/usfans_logo_nuevo.jpg" 
                             alt="USFans" 
                             class="usfans-logo"
                             width="60"
                             height="20">
                        <span>Ver en USFans</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                            <path d="M3 8h10M8 3l5 5-5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
            </div>
        </article>
    `;
}

function renderEmptyState() {
    return `
        <div class="empty-state">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="50" stroke="#E0E0E0" stroke-width="4"/>
                <path d="M40 60h40M60 40v40" stroke="#E0E0E0" stroke-width="4" stroke-linecap="round"/>
            </svg>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros o realizar una búsqueda diferente</p>
            <button class="btn-primary" onclick="resetFilters()">
                Limpiar Filtros
            </button>
        </div>
    `;
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(AppState.filteredProducts.length / AppState.productsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination">';
    
    // Botón anterior
    if (AppState.currentPage > 1) {
        html += `
            <button class="page-btn" onclick="changePage(${AppState.currentPage - 1})" aria-label="Página anterior">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M12 4l-6 6 6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
    }
    
    // Números de página
    const pages = generatePageNumbers(AppState.currentPage, totalPages);
    pages.forEach(page => {
        if (page === '...') {
            html += '<span class="page-dots">...</span>';
        } else {
            html += `
                <button 
                    class="page-btn ${page === AppState.currentPage ? 'active' : ''}"
                    onclick="changePage(${page})"
                    aria-label="Página ${page}"
                    ${page === AppState.currentPage ? 'aria-current="page"' : ''}>
                    ${page}
                </button>
            `;
        }
    });
    
    // Botón siguiente
    if (AppState.currentPage < totalPages) {
        html += `
            <button class="page-btn" onclick="changePage(${AppState.currentPage + 1})" aria-label="Página siguiente">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M8 4l6 6-6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function changePage(page) {
    AppState.currentPage = page;
    renderProducts();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    trackEvent('page_changed', { page });
}

function generatePageNumbers(current, total) {
    const pages = [];
    const delta = 2;
    
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    
    return pages;
}

// ===========================
// SISTEMA DE LIKES
// ===========================
function loadLikes() {
    try {
        const saved = localStorage.getItem('luxeLikes');
        if (saved) {
            AppState.likes = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading likes:', e);
    }
}

function saveLikes() {
    try {
        localStorage.setItem('luxeLikes', JSON.stringify(AppState.likes));
    } catch (e) {
        console.error('Error saving likes:', e);
    }
}

function toggleLike(productId) {
    if (!AppState.likes[productId]) {
        AppState.likes[productId] = 15; // Valor inicial
    }
    
    AppState.likes[productId]++;
    saveLikes();
    
    // Actualizar UI
    const card = document.querySelector(`[data-id="${productId}"]`);
    if (card) {
        const btn = card.querySelector('.btn-like');
        const count = card.querySelector('.like-count');
        
        if (btn) btn.classList.add('liked');
        if (count) {
            count.textContent = AppState.likes[productId];
            count.classList.add('animate-like');
            setTimeout(() => count.classList.remove('animate-like'), 600);
        }
    }
    
    trackEvent('product_liked', { product_id: productId, likes: AppState.likes[productId] });
}

function generateInitialLikes(productId) {
    if (!AppState.likes[productId]) {
        // Generar likes iniciales aleatorios para productos populares
        const likes = Math.floor(Math.random() * 30) + 5;
        AppState.likes[productId] = likes;
        saveLikes();
        return likes;
    }
    return AppState.likes[productId];
}

// ===========================
// POPUP USFANS
// ===========================
function createUSFansPopup() {
    // Verificar si ya se mostró en esta sesión
    if (sessionStorage.getItem('usfans_popup_shown')) return;
    
    const popup = document.createElement('div');
    popup.className = 'usfans-popup';
    popup.innerHTML = `
        <div class="popup-overlay"></div>
        <div class="popup-content">
            <button class="popup-close" aria-label="Cerrar">&times;</button>
            
            <div class="popup-body">
                <img src="images/usfans_logo_nuevo.jpg" alt="USFans" class="popup-logo">
                
                <h2 class="popup-title">🎉 ¡Oferta Exclusiva!</h2>
                
                <div class="popup-bonus">
                    <div class="bonus-amount">800€</div>
                    <div class="bonus-text">EN CRÉDITO DE BIENVENIDA</div>
                </div>
                
                <p class="popup-description">
                    Regístrate ahora en <strong>USFans</strong> y recibe <strong>800€ de crédito</strong> 
                    para tus primeras compras. ¡No dejes pasar esta oportunidad!
                </p>
                
                <ul class="popup-benefits">
                    <li>✓ Envío rápido y seguro en 7-15 días</li>
                    <li>✓ Atención al cliente en español 24/7</li>
                    <li>✓ Fotos QC de cada producto</li>
                    <li>✓ Garantía de calidad AAA+</li>
                </ul>
                
                <a href="https://www.usfans.com/register?ref=RCGD5Y" 
                   target="_blank"
                   rel="noopener"
                   class="popup-btn"
                   onclick="trackEvent('popup_cta_click', {source: 'welcome_popup'})">
                    REGISTRARME AHORA
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M5 10h10M10 5l5 5-5 5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                
                <p class="popup-note">* Oferta válida solo para nuevos usuarios</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animar entrada
    setTimeout(() => popup.classList.add('show'), 100);
    
    // Eventos de cierre
    popup.querySelector('.popup-close').addEventListener('click', closePopup);
    popup.querySelector('.popup-overlay').addEventListener('click', closePopup);
    
    // Marcar como mostrado
    sessionStorage.setItem('usfans_popup_shown', 'true');
    
    trackEvent('popup_shown', { type: 'welcome' });
    
    function closePopup() {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
        trackEvent('popup_closed', { type: 'welcome' });
    }
}

// ===========================
// UTILIDADES DE UI
// ===========================
function initUI() {
    // Scroll to top
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Smooth scroll para anclas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function lazyLoadImages() {
    const images = document.querySelectorAll('img.lazy');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores antiguos
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
}

function showError(message) {
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-state">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="#ff4757" stroke-width="4"/>
                    <path d="M40 20v24M40 52v4" stroke="#ff4757" stroke-width="4" stroke-linecap="round"/>
                </svg>
                <h3>¡Oops! Algo salió mal</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="window.location.reload()">
                    Recargar Página
                </button>
            </div>
        `;
    }
}

// ===========================
// ANALYTICS Y TRACKING
// ===========================
function initAnalytics() {
    // Track tiempo en página
    let timeOnPage = 0;
    setInterval(() => {
        timeOnPage += 5;
        if (timeOnPage % 30 === 0) {
            trackEvent('time_on_page', { seconds: timeOnPage });
        }
    }, 5000);
}

function trackEvent(eventName, params = {}) {
    try {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
        
        // Console log en desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📊 Event:', eventName, params);
        }
    } catch (e) {
        console.error('Error tracking event:', e);
    }
}

// ===========================
// UTILIDADES
// ===========================
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Exportar funciones globales necesarias
window.toggleLike = toggleLike;
window.changePage = changePage;
window.resetFilters = resetFilters;
window.trackEvent = trackEvent;

console.log('🎨 Script premium cargado - LuxeEchoReplicas 2025');
