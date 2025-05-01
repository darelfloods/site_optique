class ProductFilters {
    constructor() {
        this.filters = {
            category: 'all',
            maxPrice: 100000,
            colors: [],
            sortBy: 'default'
        };
        this.currentPage = 1;
        this.productsPerPage = 8;
        this.initEvents();
    }

    initEvents() {
        // Filtres catégorie
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.addEventListener('click', () => this.handleCategoryFilter(btn));
        });

        // Filtre prix
        const priceSlider = document.getElementById('price-filter');
        priceSlider.addEventListener('input', (e) => {
            this.filters.maxPrice = parseInt(e.target.value);
            document.getElementById('current-price').textContent = 
                parseInt(e.target.value).toLocaleString();
            this.applyFilters();
        });

        // Filtres couleur
        document.querySelectorAll('[data-color]').forEach(btn => {
            btn.addEventListener('click', () => this.handleColorFilter(btn));
        });

        // Tri
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        // Réinitialisation
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            this.changePage(-1);
        });
        document.getElementById('next-page').addEventListener('click', () => {
            this.changePage(1);
        });
    }

    handleCategoryFilter(btn) {
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.category = btn.dataset.category;
        this.currentPage = 1; // Reset à la première page
        this.applyFilters();
    }

    handleColorFilter(btn) {
        btn.classList.toggle('active');
        const color = btn.dataset.color;
        
        if (this.filters.colors.includes(color)) {
            this.filters.colors = this.filters.colors.filter(c => c !== color);
        } else {
            this.filters.colors.push(color);
        }
        
        this.currentPage = 1;
        this.applyFilters();
    }

    async applyFilters() {
        const products = await this.fetchFilteredProducts();
        this.displayProducts(products);
        this.updatePagination(products.length);
        this.updateURL();
    }

    async fetchFilteredProducts() {
        const allProducts = await fetchProducts();
        
        return allProducts.filter(product => {
            // Filtre catégorie
            if (this.filters.category !== 'all' && !product.category.includes(this.filters.category)) {
                return false;
            }
            
            // Filtre prix
            if (product.price > this.filters.maxPrice) {
                return false;
            }
            
            // Filtre couleurs
            if (this.filters.colors.length > 0 && 
                !this.filters.colors.some(color => product.colors.includes(color))) {
                return false;
            }
            
            return true;
        }).sort((a, b) => {
            // Tri
            switch (this.filters.sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'popularity': return b.rating - a.rating;
                case 'newest': return new Date(b.dateAdded) - new Date(a.dateAdded);
                default: return 0;
            }
        });
    }

    displayProducts(products) {
        const startIdx = (this.currentPage - 1) * this.productsPerPage;
        const paginatedProducts = products.slice(startIdx, startIdx + this.productsPerPage);
        const productsGrid = document.getElementById('products-grid');
        
        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = '<p class="no-results">Aucun produit ne correspond à vos critères</p>';
            return;
        }
        
        productsGrid.innerHTML = paginatedProducts.map(product => this.createProductCard(product)).join('');
        this.initProductEvents();
    }

    createProductCard(product) {
        return `
            <article class="product-card" data-id="${product.id}" 
                     data-category="${product.category}" 
                     data-price="${product.price}"
                     data-colors="${product.colors.join(',')}">
                <a href="produit.html?id=${product.id}" class="product-link">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         loading="lazy"
                         width="300"
                         height="200">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-meta">
                            <span class="price">${product.price.toLocaleString()} FCFA</span>
                            <span class="rating">⭐ ${product.rating}</span>
                        </div>
                    </div>
                </a>
                <div class="product-actions">
                    <button class="add-to-cart">Ajouter au panier</button>
                    <button class="add-to-fav" aria-label="Ajouter aux favoris">❤️</button>
                </div>
            </article>
        `;
    }

    initProductEvents() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.product-card').dataset.id);
                addToCart(productId);
            });
        });
        
        document.querySelectorAll('.add-to-fav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.product-card').dataset.id);
                toggleFavorite(productId);
            });
        });
    }

    updatePagination(totalProducts) {
        const totalPages = Math.ceil(totalProducts / this.productsPerPage);
        const pageIndicator = document.getElementById('page-indicator');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        pageIndicator.textContent = `Page ${this.currentPage}/${totalPages}`;
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    }

    changePage(step) {
        this.currentPage += step;
        this.applyFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateURL() {
        const params = new URLSearchParams();
        
        if (this.filters.category !== 'all') params.append('category', this.filters.category);
        if (this.filters.maxPrice < 100000) params.append('maxPrice', this.filters.maxPrice);
        if (this.filters.colors.length > 0) params.append('colors', this.filters.colors.join(','));
        if (this.filters.sortBy !== 'default') params.append('sortBy', this.filters.sortBy);
        if (this.currentPage > 1) params.append('page', this.currentPage);
        
        history.pushState(null, '', `?${params.toString()}`);
    }

    parseURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('category')) {
            this.filters.category = params.get('category');
            document.querySelector(`[data-category="${this.filters.category}"]`)?.classList.add('active');
        }
        
        if (params.has('maxPrice')) {
            this.filters.maxPrice = parseInt(params.get('maxPrice'));
            document.getElementById('price-filter').value = this.filters.maxPrice;
            document.getElementById('current-price').textContent = this.filters.maxPrice.toLocaleString();
        }
        
        if (params.has('colors')) {
            this.filters.colors = params.get('colors').split(',');
            this.filters.colors.forEach(color => {
                document.querySelector(`[data-color="${color}"]`)?.classList.add('active');
            });
        }
        
        if (params.has('sortBy')) {
            this.filters.sortBy = params.get('sortBy');
            document.getElementById('sort-by').value = this.filters.sortBy;
        }
        
        if (params.has('page')) {
            this.currentPage = parseInt(params.get('page'));
        }
    }

    resetFilters() {
        this.filters = {
            category: 'all',
            maxPrice: 100000,
            colors: [],
            sortBy: 'default'
        };
        this.currentPage = 1;
        
        // Réinitialiser UI
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-category="all"]').classList.add('active');
        
        document.getElementById('price-filter').value = 100000;
        document.getElementById('current-price').textContent = '100 000';
        
        document.querySelectorAll('[data-color]').forEach(b => b.classList.remove('active'));
        document.getElementById('sort-by').value = 'default';
        
        this.applyFilters();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const filters = new ProductFilters();
    filters.parseURL();
    filters.applyFilters();
});