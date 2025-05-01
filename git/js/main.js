

// Afficher les produits phares
function displayFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products');
    const featured = products.filter(p => p.rating >= 4.5).slice(0, 4);
    
    featuredGrid.innerHTML = featured.map(product => `
        <article class="product-card" data-id="${product.id}">
            <img src="${product.image}" 
                 alt="${product.name}" 
                 loading="lazy"
                 width="300"
                 height="200">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">${product.price.toLocaleString()} FCFA</p>
                <button class="add-to-cart">Ajouter au panier</button>
                <button class="add-to-fav">❤️</button>
            </div>
        </article>
    `).join('');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedProducts();
    updateCartCounter();
    
    // Gestion des événements
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
});

function addToCart(e) {
    const productId = parseInt(e.target.closest('.product-card').dataset.id);
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    showToast(`${product.name} ajouté au panier`);
}

window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    nav.classList.toggle('scrolled', window.scrollY > 50);
});



// Version améliorée avec gestion du body scroll
document.querySelector('.burger').addEventListener('click', function() {
    const navMenu = document.querySelector('nav ul');
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    
    // Basculer l'état
    this.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
    
    // Bloquer/débloquer le scroll
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Données des produits (peut venir d'une API)
const products = [
    // Votre tableau JSON de produits ici...
];

// Variables globales
let cart = [];
let favorites = [];

// Afficher les produits phares
function displayFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products');
    
    // Filtrer les best-sellers (rating >= 4.5 ou isBestSeller: true)
    const featured = products.filter(p => p.rating >= 4.5 || p.isBestSeller).slice(0, 4);
    
    featuredGrid.innerHTML = featured.map(product => `
        <article class="product-card" data-id="${product.id}">
            <img src="${product.image}" 
                 alt="${product.name}" 
                 loading="lazy"
                 width="300"
                 height="200">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="price-rating">
                    <p class="price">${product.price.toLocaleString()} FCFA</p>
                    <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</div>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">
                        🛒 Ajouter
                    </button>
                    <button class="add-to-fav" data-id="${product.id}">
                        ${favorites.includes(product.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </article>
    `).join('');
    
    // Ajouter les écouteurs d'événements
    addProductEventListeners();
}

// Gestion des événements
function addProductEventListeners() {
    // Ajout au panier
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        });
    });
    
    // Ajout aux favoris
    document.querySelectorAll('.add-to-fav').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            toggleFavorite(productId);
        });
    });
}

// Fonction pour ajouter au panier
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartCounter();
    showNotification(`${product.name} ajouté au panier`);
}

// Fonction pour les favoris
function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    
    if (index === -1) {
        favorites.push(productId);
    } else {
        favorites.splice(index, 1);
    }
    
    updateFavCounter();
    displayFeaturedProducts(); // Rafraîchir l'affichage des cœurs
}

// Mettre à jour les compteurs
function updateCartCounter() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-counter').textContent = total;
}

function updateFavCounter() {
    document.getElementById('fav-counter').textContent = favorites.length;
}

// Notification visuelle
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedProducts();
    updateCartCounter();
    updateFavCounter();
});