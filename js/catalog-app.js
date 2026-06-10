(function() {
  'use strict';
  var currentFilter = 'all';
  var currentSearch = '';
  var currentPage = 1;
  var perPage = 24;
  var _allProducts = [];

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function attrSafe(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
  }

  function getProducts() {
    return _allProducts.length ? _allProducts : (window.products || []);
  }

  function getFilteredProducts() {
    var filtered = getProducts();
    if (currentFilter !== 'all') {
      filtered = filtered.filter(function(p) { return p.Categoria === currentFilter; });
    }
    if (currentSearch) {
      var q = currentSearch.toLowerCase();
      filtered = filtered.filter(function(p) {
        return (p.Nombre && p.Nombre.toLowerCase().indexOf(q) > -1) ||
               (p.Categoria && p.Categoria.toLowerCase().indexOf(q) > -1) ||
               (p.Descripcion && p.Descripcion.toLowerCase().indexOf(q) > -1);
      });
    }
    return filtered;
  }

  function filterProducts(cat) {
    currentFilter = cat;
    currentPage = 1;
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-filter') === cat);
      b.setAttribute('aria-pressed', b.getAttribute('data-filter') === cat);
    });
    renderProducts();
    initLazyImages();
  }

  function searchProducts() {
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 1;
    renderProducts();
    initLazyImages();
  }

  function debounce(fn, delay) {
    var timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function renderProducts() {
    var filtered = getFilteredProducts();
    var grid = document.getElementById('productsGrid');
    var noResults = document.getElementById('noResults');
    var pag = document.getElementById('pagination');
    var totalPages = Math.ceil(filtered.length / perPage);

    if (filtered.length === 0) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      pag.innerHTML = '';
      return;
    }
    noResults.style.display = 'none';

    var start = (currentPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = filtered.slice(start, end);

    grid.innerHTML = pageItems.map(function(p) {
      var catLabel = escapeHTML(p.Categoria || 'General');
      var desc = escapeHTML((p.Descripcion && p.Descripcion.length > 20) ? p.Descripcion : 'Premium AAA+ quality replica with perfect details and premium materials. Fast shipping with QC photos included.');
      var usfansLink = attrSafe(p.Link_USFans || '#');
      var imgSrc = attrSafe(p.Imagen || '');
      var imgAlt = attrSafe((p.Nombre || 'Replica product') + ' - AAA+ quality replica');
      var productName = escapeHTML(p.Nombre || 'Product');
      var badgeHTML = '';
      var priceVal = parseFloat(p.Precio);
      var priceDisplay = (!isNaN(priceVal) && priceVal > 0) ? priceVal.toFixed(2) : '0.00';
      if (!isNaN(priceVal) && priceVal >= 60) { badgeHTML = '<span class="product-badge badge-top">PREMIUM</span>'; }
      else if (!isNaN(priceVal) && priceVal <= 20) { badgeHTML = '<span class="product-badge badge-sale">BEST VALUE</span>'; }
      return '<article class="product-card" role="listitem">' +
        '<div class="product-image-container">' + badgeHTML +
        '<img src="' + imgSrc + '" alt="' + imgAlt + '" class="product-image" width="400" height="400" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 fill=%22%2316161e%22%3E%3Crect width=%22400%22 height=%22400%22/%3E%3Ctext x=%22200%22 y=%22200%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2214%22 font-family=%22sans-serif%22%3EImage unavailable%3C/text%3E%3C/svg%3E\'">' +
        '<div class="product-overlay"><a href="' + usfansLink + '" target="_blank" rel="noopener noreferrer nofollow" class="product-overlay-link">Buy Now &rarr;</a></div>' +
        '</div>' +
        '<div class="product-content">' +
        '<div class="product-category-badge">' + catLabel + '</div>' +
        '<h3 class="product-name">' + productName + '</h3>' +
        '<p class="product-description">' + desc + '</p>' +
        '<div class="product-meta">' +
        '<span class="product-price">$' + priceDisplay + '</span>' +
        '<div class="product-rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
        '</div>' +
        '</div></article>';
    }).join('');

    var pagHtml = '';
    if (totalPages > 1) {
      pagHtml += '<div class="pagination">';
      if (currentPage > 1) {
        pagHtml += '<button class="pagination-btn" onclick="goToPage(' + (currentPage-1) + ')">&larr; Previous</button>';
      }
      pagHtml += '<span class="pagination-info">Page ' + currentPage + ' of ' + totalPages + '</span>';
      if (currentPage < totalPages) {
        pagHtml += '<button class="pagination-btn" onclick="goToPage(' + (currentPage+1) + ')">Next &rarr;</button>';
      }
      pagHtml += '</div>';
    }
    pagHtml += '<p class="pagination-stats">Showing ' + (start+1) + '-' + Math.min(end, filtered.length) + ' of ' + filtered.length + ' products</p>';
    pag.innerHTML = pagHtml;
  }

  function goToPage(page) {
    currentPage = page;
    renderProducts();
    initLazyImages();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function initLazyImages() {
    document.querySelectorAll('#productsGrid img[loading="lazy"]').forEach(function(img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() { img.classList.add('loaded'); });
      }
    });
  }

  function tryInitCatalog() {
    var prods = window.products || (typeof products !== 'undefined' ? products : null);
    if (prods && prods.length > 0) {
      _allProducts = prods;
      renderProducts();
      initLazyImages();
      return true;
    }
    return false;
  }

  function init() {
    if (!tryInitCatalog()) {
      var attempts = 0;
      var maxAttempts = 10;
      document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;padding:60px;color:var(--text-secondary);font-size:18px">Loading products...</p>';
      var retryInterval = setInterval(function() {
        attempts++;
        if (tryInitCatalog()) {
          clearInterval(retryInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(retryInterval);
          var grid = document.getElementById('productsGrid');
          if (grid) grid.innerHTML = '<div style="text-align:center;padding:60px"><p style="color:var(--text-secondary);font-size:18px;margin-bottom:15px">Product catalog failed to load.</p><a href="catalog.html" style="color:var(--accent-orange);font-weight:700;text-decoration:underline">Reload page</a></div>';
        }
      }, 500);
    }

    // Bind filter buttons
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.setAttribute('aria-pressed', btn.classList.contains('active'));
      btn.addEventListener('click', function() {
        filterProducts(btn.getAttribute('data-filter'));
      });
    });

    // Bind search input with 300ms debounce
    var searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('keyup', debounce(searchProducts, 300));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose functions globally for onclick handlers
  window.filterProducts = filterProducts;
  window.searchProducts = searchProducts;
  window.goToPage = goToPage;
})();
