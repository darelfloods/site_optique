document.addEventListener('DOMContentLoaded', function() {
    // Simuler des données de commande (en production, récupérer depuis le backend)
    const orderData = {
        id: generateOrderId(),
        date: new Date(),
        customer: {
            email: localStorage.getItem('checkoutEmail') || 'client@example.com',
            name: localStorage.getItem('checkoutName') || 'Jean Dupont',
            address: localStorage.getItem('checkoutAddress') || '123 Rue Principale',
            city: localStorage.getItem('checkoutCity') || 'Libreville',
            zipcode: localStorage.getItem('checkoutZip') || '12345',
            country: localStorage.getItem('checkoutCountry') || 'Gabon'
        },
        payment: {
            method: localStorage.getItem('checkoutPaymentMethod') || 'mobile',
            details: localStorage.getItem('checkoutPaymentDetails') || 'Airtel Money'
        },
        items: JSON.parse(localStorage.getItem('cart')) || [],
        subtotal: parseInt(localStorage.getItem('checkoutSubtotal')) || 0,
        shipping: parseInt(localStorage.getItem('checkoutShipping')) || 0,
        total: parseInt(localStorage.getItem('checkoutTotal')) || 0
    };

    // Afficher les données de la commande
    displayOrderDetails(orderData);
    
    // Gestionnaire d'impression
    document.getElementById('print-invoice').addEventListener('click', function(e) {
        e.preventDefault();
        window.print();
    });
    
    // Nettoyer le panier après confirmation (sauf pour démo)
    // localStorage.removeItem('cart');
});

function generateOrderId() {
    return 'CMD-' + Math.floor(Math.random() * 900000) + 100000;
}

function displayOrderDetails(order) {
    // En-tête
    document.getElementById('order-id').textContent = order.id;
    document.getElementById('customer-email').textContent = order.customer.email;
    
    // Date et heure
    const now = new Date();
    document.getElementById('order-time').textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Date estimée de livraison (3 jours ouvrables)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    document.getElementById('delivery-date').textContent = deliveryDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    // Informations de livraison
    const shippingDetails = document.getElementById('shipping-details');
    shippingDetails.innerHTML = `
        <div class="details-content">
            <div class="details-row">
                <strong>Nom :</strong> ${order.customer.name}
            </div>
            <div class="details-row">
                <strong>Adresse :</strong> ${order.customer.address}
            </div>
            <div class="details-row">
                <strong>Ville :</strong> ${order.customer.city}, ${order.customer.zipcode}
            </div>
            <div class="details-row">
                <strong>Pays :</strong> ${order.customer.country}
            </div>
        </div>
    `;
    
    // Informations de paiement
    const paymentDetails = document.getElementById('payment-details');
    let paymentText = '';
    
    switch(order.payment.method) {
        case 'card':
            paymentText = 'Carte bancaire terminant par ****';
            break;
        case 'mobile':
            paymentText = `${order.payment.details || 'Mobile Money'}`;
            break;
        case 'cash':
            paymentText = 'Paiement à la livraison';
            break;
        default:
            paymentText = order.payment.method;
    }
    
    paymentDetails.innerHTML = `
        <div class="details-content">
            <div class="details-row">
                <strong>Méthode :</strong> ${paymentText}
            </div>
            <div class="details-row">
                <strong>Statut :</strong> Paiement confirmé
            </div>
        </div>
    `;
    
    // Articles commandés
    const orderItems = document.getElementById('order-items');
    orderItems.innerHTML = '';
    
    if (order.items.length === 0) {
        orderItems.innerHTML = '<p>Aucun article dans cette commande</p>';
    } else {
        order.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="order-item-image">
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-color">Couleur : ${item.color || 'Non spécifié'}</div>
                </div>
                <div class="order-item-price">
                    ${item.price.toLocaleString()} FCFA × ${item.quantity}<br>
                    <strong>${(item.price * item.quantity).toLocaleString()} FCFA</strong>
                </div>
            `;
            orderItems.appendChild(itemElement);
        });
    }
    
    // Totaux
    document.getElementById('confirm-subtotal').textContent = `${order.subtotal.toLocaleString()} FCFA`;
    document.getElementById('confirm-shipping').textContent = 
        order.shipping === 0 ? 'Gratuite' : `${order.shipping.toLocaleString()} FCFA`;
    document.getElementById('confirm-total').textContent = `${order.total.toLocaleString()} FCFA`;
}