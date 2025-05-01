// Gestion du panier
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    showToast(`${product.name} ajouté au panier`);
}

// Gestion des favoris
function toggleFavorite(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const product = products.find(p => p.id === productId);
    
    const index = favorites.findIndex(item => item.id === productId);
    if (index === -1) {
        favorites.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
        showToast(`${product.name} ajouté aux favoris`);
    } else {
        favorites.splice(index, 1);
        showToast(`${product.name} retiré des favoris`);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavCounter();
}

// Mise à jour des compteurs
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-counter').textContent = total;
    document.getElementById('cart-counter').style.display = total > 0 ? 'flex' : 'none';
}

function updateFavCounter() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    document.getElementById('fav-counter').textContent = favorites.length;
    document.getElementById('fav-counter').style.display = favorites.length > 0 ? 'flex' : 'none';
}

// Notification toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// CSS pour les toasts (à ajouter dans votre CSS)
/*
.toast-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
}

.toast-notification.show {
    transform: translateY(0);
    opacity: 1;
}
*/