document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les étapes
    initSteps();
    
    // Initialiser les onglets de paiement
    initPaymentTabs();
    
    // Charger le récapitulatif
    loadOrderSummary();
    
    // Gérer la soumission du formulaire
    document.getElementById('checkout-form').addEventListener('submit', processPayment);
});

function initSteps() {
    // Gérer les boutons suivant/précédent
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStep = document.querySelector(`.form-step[data-step="${this.dataset.target}"]`);
            
            // Validation simple
            if (!validateStep(currentStep.dataset.step)) return;
            
            // Changer d'étape
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            
            // Mettre à jour les étapes
            document.querySelector('.checkout-steps .step.active').classList.remove('active');
            document.querySelector(`.checkout-steps .step[data-step="${this.dataset.target}"]`).classList.add('active');
            
            // Mettre à jour le récapitulatif si étape 2 (livraison)
            if (this.dataset.target === '3') {
                updateShippingCost();
            }
        });
    });
    
    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const prevStep = document.querySelector(`.form-step[data-step="${this.dataset.target}"]`);
            
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            
            document.querySelector('.checkout-steps .step.active').classList.remove('active');
            document.querySelector(`.checkout-steps .step[data-step="${this.dataset.target}"]`).classList.add('active');
        });
    });
}

function initPaymentTabs() {
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Désactiver tous les onglets
            document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.payment-content').forEach(c => c.classList.remove('active'));
            
            // Activer l'onglet cliqué
            this.classList.add('active');
            document.querySelector(`.payment-content[data-method="${this.dataset.method}"]`).classList.add('active');
        });
    });
}

function validateStep(step) {
    let isValid = true;
    const currentStep = document.querySelector(`.form-step[data-step="${step}"]`);
    
    // Valider tous les champs requis
    currentStep.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc2626';
            isValid = false;
            
            // Retirer le style d'erreur après correction
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.style.borderColor = '';
                }
            });
        }
    });
    
    if (!isValid) {
        alert('Veuillez remplir tous les champs obligatoires');
    }
    
    return isValid;
}

function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const summaryItems = document.getElementById('summary-items');
    let subtotal = 0;
    
    if (cart.length === 0) {
        window.location.href = 'panier.html';
        return;
    }
    
    summaryItems.innerHTML = '';
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <div class="summary-item-name">
                ${item.name} × ${item.quantity}
            </div>
            <div class="summary-item-price">
                ${(item.price * item.quantity).toLocaleString()} FCFA
            </div>
        `;
        
        summaryItems.appendChild(itemElement);
    });
    
    document.getElementById('summary-subtotal').textContent = `${subtotal.toLocaleString()} FCFA`;
    updateShippingCost();
}

function updateShippingCost() {
    const subtotalText = document.getElementById('summary-subtotal').textContent;
    const subtotal = parseInt(subtotalText.replace(/\D/g,''));
    let shipping = 3000; // Standard par défaut
    
    // Livraison gratuite si > 50 000 FCFA
    if (subtotal > 50000) {
        shipping = 0;
    }
    
    // Vérifier si livraison express sélectionnée
    const expressDelivery = document.querySelector('input[name="delivery"]:checked').value === 'express';
    if (expressDelivery) {
        shipping = 6000;
    }
    
    document.getElementById('summary-shipping').textContent = 
        shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString()} FCFA`;
    
    const total = subtotal + shipping;
    document.getElementById('summary-total').textContent = `${total.toLocaleString()} FCFA`;
    
    // Stocker le total pour le traitement du paiement
    localStorage.setItem('checkoutTotal', total);
}

function processPayment(e) {
    e.preventDefault();
    
    // Simuler un traitement de paiement
    const paymentMethod = document.querySelector('.payment-tab.active').dataset.method;
    const orderData = collectOrderData();
    
    // En production, vous enverriez ces données à votre backend
    console.log('Données de commande:', orderData);
    
    // Redirection vers la page de confirmation
    setTimeout(() => {
        window.location.href = 'confirmation.html';
        
        // Vider le panier après paiement (à adapter selon votre logique)
        localStorage.removeItem('cart');
    }, 1500);
}

function collectOrderData() {
    return {
        customer: {
            email: document.getElementById('email').value,
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipcode: document.getElementById('zipcode').value,
            country: document.getElementById('country').value
        },
        delivery: document.querySelector('input[name="delivery"]:checked').value,
        payment: document.querySelector('.payment-tab.active').dataset.method,
        items: JSON.parse(localStorage.getItem('cart')) || [],
        total: localStorage.getItem('checkoutTotal')
    };
}