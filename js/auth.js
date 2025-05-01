document.addEventListener('DOMContentLoaded', function() {
    // Gestionnaire de connexion
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validation basique
        if (!email || !password) {
            showAlert('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        // Vérifier l'utilisateur dans le localStorage (simulation)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Connexion réussie
            localStorage.setItem('currentUser', JSON.stringify(user));
            showAlert('Connexion réussie !', 'success');
            
            // Redirection après 1.5s
            setTimeout(() => {
                window.location.href = 'mon-compte.html';
            }, 1500);
        } else {
            showAlert('Email ou mot de passe incorrect', 'error');
        }
    });
    
    // Gestionnaire de mot de passe oublié
    document.getElementById('reset-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        
        // Simulation d'envoi d'email
        showAlert(`Un email de réinitialisation a été envoyé à ${email}`, 'success');
        document.querySelector('.close-modal').click();
    });
    
    // Basculer la visibilité du mot de passe
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
});

// Fonction d'affichage des alertes
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 300);
    }, 3000);
}

// Ajout de styles pour les alertes
const style = document.createElement('style');
style.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 6px;
        color: white;
        transform: translateY(-100px);
        opacity: 0;
        transition: all 0.3s;
        z-index: 1000;
    }
    
    .alert.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .alert-success {
        background: #16a34a;
    }
    
    .alert-error {
        background: #dc2626;
    }
`;
document.head.appendChild(style);