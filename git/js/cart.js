document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    // Écouteur pour le bouton de commande
    document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
});

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Votre panier est vide</p>
                <a href="catalogue.html" class="btn-primary">Découvrir nos produits</a>
            </div>
        `;
        updateSummary(0);
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-price">${item.price.toLocaleString()} FCFA</div>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn decrease" data-index="${index}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-index="${index}">
                        <button class="quantity-btn increase" data-index="${index}">+</button>
                    </div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(itemElement);
    });
    
    // Écouteurs pour les boutons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateQuantity(
                parseInt(this.dataset.index), 
                this.classList.contains('increase') ? 1 : -1
            );
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            setQuantity(
                parseInt(this.dataset.index), 
                parseInt(this.value) || 1
            );
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            removeItem(parseInt(this.dataset.index));
        });
    });
    
    updateSummary(subtotal);
}

function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1 || newQuantity > 10) return;
    
    cart[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function setQuantity(index, quantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (quantity < 1 || quantity > 10) {
        loadCart(); // Réinitialiser la valeur
        return;
    }
    
    cart[index].quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function updateSummary(subtotal) {
    document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()} FCFA`;
    
    // Calcul des frais de livraison (gratuit si > 50 000 FCFA)
    const shipping = subtotal > 50000 ? 0 : 3000;
    document.getElementById('shipping').textContent = 
        shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString()} FCFA`;
    
    const total = subtotal + shipping;
    document.getElementById('total').textContent = `${total.toLocaleString()} FCFA`;
    
    // Activer le bouton de commande si panier non vide
    document.getElementById('checkout-btn').disabled = subtotal === 0;
}

function proceedToCheckout() {
    // Redirection vers la page de paiement
    window.location.href = 'checkout.html';
    
    // Enregistrement du total dans localStorage pour la page de paiement
    const totalText = document.getElementById('total').textContent;
    const total = parseInt(totalText.replace(/\D/g,''));
    localStorage.setItem('checkoutTotal', total);
}