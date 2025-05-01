// Données des produits (en pratique, charger depuis un JSON)
async function fetchProducts() {
    try {
        // Simule un chargement asynchrone
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Erreur de chargement');
        return await response.json();
    } catch (error) {
        console.error("Erreur:", error);
        return [];
    }
}

// Afficher les produits
async function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '<div class="skeleton-loader"></div>'.repeat(4);
    
    const products = await fetchProducts();
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-results">Aucun produit trouvé</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
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
    `).join('');
    
    updateProductCount(products.length);
}

// Mettre à jour le compteur de produits
function updateProductCount(count) {
    document.getElementById('product-count').textContent = 
        `${count} produit${count > 1 ? 's' : ''}`;
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    
    // Gestion des événements
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
    
    document.querySelectorAll('.add-to-fav').forEach(btn => {
        btn.addEventListener('click', addToFavorites);
    });
});

// Exemple de fichier products.json
/*
[
    {
        "id": 1,
        "name": "Lunettes solaires GEB",
        "price": 26000,
        "category": "solaires",
        "colors": ["noir", "bleu"],
        "image": "https://res.cloudinary.com/demo/image/upload/w_300,q_auto,f_auto/lunettes-geb.jpg",
        "rating": 4.8,
        "stock": 15,
        "description": "Lunettes solaires polarisées avec monture légère",
        "details": "Monture en acétate - Verres polarisés UV400 - Poids: 28g"
    },
    ...
]
*/