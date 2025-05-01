// Données des produits (peut être dans un fichier séparé products-data.js)
const products = [
    {
        "id": 1,
        "name": "Lunettes solaires GEB",
        "price": 26000,
        "image": "images/LunetSolaire.jpeg",
        "rating": 4.8,
        "isBestSeller": true
    },
    {
        "id": 2,
        "name": "Monture FLORA",
        "price": 45000,
        "image": "images/flora1.jpeg",
        "rating": 4.9,
        "isBestSeller": true
    },
    {
        "id": 3,
        "name": "Lunettes BANNISTER",
        "price": 13000,
        "image": "images/bannister.jpeg",
        "rating": 4.5,
        "isBestSeller": false
    },
    // ... autres produits ...
];

// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    displayFeaturedProducts();
    updateCounters();
});

function displayFeaturedProducts() {
    const grid = document.getElementById('featured-products');
    if (!grid) {
        console.error("Element #featured-products non trouvé");
        return;
    }

    const featured = products
        .filter(p => p.rating >= 4.5 || p.isBestSeller)
        .slice(0, 4);

    grid.innerHTML = featured.map(product => `
        <article class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">${product.price.toLocaleString()} FCFA</p>
                <button class="add-to-cart" data-id="${product.id}">🛒 Ajouter</button>
            </div>
        </article>
    `).join('');

    addEventListeners();
}

function addEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }

    updateCounters();
    saveToLocalStorage();
    showFeedback(`${product.name} ajouté au panier`);
}

function updateCounters() {
    const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);
    const favTotal = favorites.length;
    
    const cartCounter = document.getElementById('cart-counter');
    const favCounter = document.getElementById('fav-counter');
    
    if (cartCounter) cartCounter.textContent = cartTotal;
    if (favCounter) favCounter.textContent = favTotal;
}

function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
}