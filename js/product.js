document.addEventListener('DOMContentLoaded', async function() {
    // Récupérer l'ID du produit depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'catalogue.html';
        return;
    }
    
    // Charger les données du produit
    const product = await loadProductData(productId);
    
    if (!product) {
        showToast('Produit non trouvé', 'error');
        setTimeout(() => {
            window.location.href = 'catalogue.html';
        }, 2000);
        return;
    }
    
    // Afficher les données du produit
    displayProductDetails(product);
    
    // Initialiser les événements
    initProductEvents(product);
    
    // Charger les produits similaires
    loadRelatedProducts(product.category, product.id);
});

async function loadProductData(productId) {
    try {
        // En production, remplacer par un appel API
        const response = await fetch('products.json');
        const products = await response.json();
        return products.find(p => p.id === productId);
    } catch (error) {
        console.error('Erreur de chargement:', error);
        return null;
    }
}

function displayProductDetails(product) {
    // Mettre à jour le titre de la page
    document.title = `${product.name} | OpticShop241`;
    
    // Fil d'Ariane
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-category').textContent = 
        product.category.map(c => capitalizeFirstLetter(c)).join(' / ');
    
    // Galerie d'images
    const mainImage = document.getElementById('main-image');
    mainImage.src = product.image;
    mainImage.alt = product.name;
    
    const thumbnailsContainer = document.getElementById('thumbnails');
    const allImages = [product.image, ...(product.images || [])];
    
    thumbnailsContainer.innerHTML = allImages.map((img, index) => `
        <img src="${img}" 
             alt="${product.name} - Vue ${index + 1}"
             data-index="${index}"
             ${index === 0 ? 'class="active"' : ''}>
    `).join('');
    
    // Badges
    document.getElementById('new-badge').style.display = 
        product.isNew ? 'block' : 'none';
    document.getElementById('bestseller-badge').style.display = 
        product.isBestSeller ? 'block' : 'none';
    
    // Titre et méta
    document.getElementById('product-title').textContent = product.name;
    
    // Note
    const ratingContainer = document.getElementById('product-rating');
    ratingContainer.innerHTML = generateStarRating(product.rating);
    
    // Avis
    document.getElementById('review-count').textContent = 
        `(${product.reviews || 0} avis)`;
    
    // Stock
    const stockElement = document.getElementById('stock-status');
    if (product.stock > 10) {
        stockElement.textContent = 'En stock';
        stockElement.style.color = '#16a34a';
    } else if (product.stock > 0) {
        stockElement.textContent = `Derniers ${product.stock} disponibles`;
        stockElement.style.color = '#d97706';
    } else {
        stockElement.textContent = 'Rupture de stock';
        stockElement.style.color = '#dc2626';
    }
    
    // Prix
    document.getElementById('current-price').textContent = 
        `${product.price.toLocaleString()} FCFA`;
    
    // Description
    document.getElementById('product-description').innerHTML = `
        <p>${product.description}</p>
    `;
    
    // Couleurs disponibles
    const colorOptions = document.getElementById('color-options');
    colorOptions.innerHTML = product.colors.map((color, index) => `
        <div class="color-option ${index === 0 ? 'selected' : ''}" 
             style="background: ${getColorHex(color)}"
             data-color="${color}"
             title="${capitalizeFirstLetter(color)}"
             aria-label="${capitalizeFirstLetter(color)}">
        </div>
    `).join('');
    
    // Caractéristiques techniques
    const specsGrid = document.getElementById('specs-grid');
    specsGrid.innerHTML = Object.entries(product.details).map(([key, value]) => `
        <div class="spec-item">
            <h3>${formatSpecName(key)}</h3>
            <p>${value}</p>
        </div>
    `).join('');
}

function initProductEvents(product) {
    // Changement de miniature
    document.querySelectorAll('#thumbnails img').forEach(img => {
        img.addEventListener('click', function() {
            document.querySelector('#thumbnails img.active').classList.remove('active');
            this.classList.add('active');
            document.getElementById('main-image').src = this.src;
        });
    });
    
    // Sélection de couleur
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelector('.color-option.selected').classList.remove('selected');
            this.classList.add('selected');
        });
    });
    
    // Quantité
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = document.getElementById('quantity');
            let value = parseInt(input.value);
            
            if (this.dataset.action === 'increase' && value < 10) {
                input.value = value + 1;
            } else if (this.dataset.action === 'decrease' && value > 1) {
                input.value = value - 1;
            }
        });
    });
    
    // Ajout au panier
    document.getElementById('product-options').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedColor = document.querySelector('.color-option.selected').dataset.color;
        const lensType = document.getElementById('lens-type').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        
        if (!lensType) {
            showToast('Veuillez sélectionner un type de verres', 'error');
            return;
        }
        
        // Calcul du prix avec options
        let finalPrice = product.price;
        let optionsText = '';
        
        switch (lensType) {
            case 'anti-reflet':
                finalPrice += 5000;
                optionsText = ' (Verres anti-reflet)';
                break;
            case 'polarise':
                finalPrice += 10000;
                optionsText = ' (Verres polarisés)';
                break;
            case 'progressif':
                finalPrice += 25000;
                optionsText = ' (Verres progressifs)';
                break;
        }
        
        // Ajout au panier
        addToCart({
            ...product,
            price: finalPrice,
            name: `${product.name} - ${capitalizeFirstLetter(selectedColor)}${optionsText}`,
            selectedColor,
            lensType,
            quantity
        });
        
        showToast('Produit ajouté au panier');
    });
    
    // Favoris
    document.getElementById('add-to-fav').addEventListener('click', function() {
        toggleFavorite(product);
        this.textContent = isFavorite(product.id) ? 
            'Retirer des favoris' : 'Ajouter aux favoris';
    });
}

async function loadRelatedProducts(categories, excludeId) {
    try {
        // En production, remplacer par un appel API
        const response = await fetch('products.json');
        const allProducts = await response.json();
        
        // Filtrer les produits similaires
        const relatedProducts = allProducts
            .filter(p => p.id !== excludeId && 
                  p.category.some(cat => categories.includes(cat)))
            .slice(0, 4);
        
        displayRelatedProducts(relatedProducts);
    } catch (error) {
        console.error('Erreur de chargement des produits similaires:', error);
    }
}

function displayRelatedProducts(products) {
    const container = document.getElementById('related-products');
    
    if (products.length === 0) {
        container.innerHTML = '<p>Aucun produit similaire trouvé</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <article class="product-card" data-id="${product.id}">
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
        </article>
    `).join('');
}

/* Fonctions utilitaires */
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '★'.repeat(fullStars) + 
           (halfStar ? '½' : '') + 
           '☆'.repeat(emptyStars);
}

function getColorHex(color) {
    const colors = {
        noir: '#000000',
        bleu: '#2563eb',
        rouge: '#dc2626',
        vert: '#16a34a',
        rose: '#ec4899',
        transparent: '#f3f4f6'
    };
    return colors[color] || color;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatSpecName(key) {
    const names = {
        material: 'Matériau',
        lensType: 'Type de verres',
        uvProtection: 'Protection UV',
        weight: 'Poids',
        dimensions: 'Dimensions'
    };
    return names[key] || key;
}

function isFavorite(productId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(item => item.id === productId);
}

