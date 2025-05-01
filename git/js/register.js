document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('register-confirm');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strength-text');
    const passwordRules = document.querySelectorAll('.password-rules li');

    // Vérification en temps réel du mot de passe
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        checkPasswordStrength(password);
        validatePasswordRules(password);
    });

    // Confirmation du mot de passe
    confirmInput.addEventListener('input', function() {
        validatePasswordMatch();
    });

    // Soumission du formulaire
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            registerUser();
        }
    });

    function checkPasswordStrength(password) {
        const strength = calculatePasswordStrength(password);
        const strengthClasses = ['weak', 'medium', 'strong'];
        
        // Retirer toutes les classes de force
        strengthBar.parentElement.classList.remove(...strengthClasses);
        
        if (password.length === 0) {
            strengthText.textContent = '';
            strengthBar.style.width = '0%';
            return;
        }
        
        // Ajouter la classe appropriée
        strengthBar.parentElement.classList.add(strengthClasses[strength.level - 1]);
        strengthText.textContent = strength.text;
    }

    function calculatePasswordStrength(password) {
        let score = 0;
        
        // Longueur minimale
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Contient des chiffres
        if (/\d/.test(password)) score++;
        
        // Contient des caractères spéciaux
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        
        // Contient des majuscules et minuscules
        if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) score++;
        
        // Déterminer le niveau de force
        if (score <= 2) return { level: 1, text: 'Faible' };
        if (score <= 4) return { level: 2, text: 'Moyen' };
        return { level: 3, text: 'Fort' };
    }

    function validatePasswordRules(password) {
        // Règle 1: Longueur minimale
        toggleRuleValidation('rule-length', password.length >= 8);
        
        // Règle 2: Contient un chiffre
        toggleRuleValidation('rule-number', /\d/.test(password));
        
        // Règle 3: Contient un caractère spécial
        toggleRuleValidation('rule-special', /[!@#$%^&*(),.?":{}|<>]/.test(password));
    }

    function toggleRuleValidation(ruleId, isValid) {
        const rule = document.getElementById(ruleId);
        
        if (isValid) {
            rule.classList.add('valid');
        } else {
            rule.classList.remove('valid');
        }
    }

    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        const errorElement = document.getElementById('confirm-error');
        
        if (confirm.length === 0) {
            errorElement.textContent = '';
            return false;
        }
        
        if (password !== confirm) {
            errorElement.textContent = 'Les mots de passe ne correspondent pas';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    function validateEmail() {
        const email = document.getElementById('register-email').value;
        const errorElement = document.getElementById('email-error');
        
        // Validation basique de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            errorElement.textContent = 'Veuillez entrer une adresse email valide';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    function validateForm() {
        let isValid = true;
        
        // Valider l'email
        if (!validateEmail()) isValid = false;
        
        // Valider la force du mot de passe
        const strength = calculatePasswordStrength(passwordInput.value);
        if (strength.level < 2) {
            showAlert('Veuillez choisir un mot de passe plus fort', 'error');
            isValid = false;
        }
        
        // Valider la correspondance des mots de passe
        if (!validatePasswordMatch()) isValid = false;
        
        // Valider les CGU
        if (!document.getElementById('accept-terms').checked) {
            showAlert('Veuillez accepter les conditions générales', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    function registerUser() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        // Enregistrement dans le localStorage (simulation)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Vérifier si l'email existe déjà
        if (users.some(user => user.email === email)) {
            showAlert('Cet email est déjà utilisé', 'error');
            return;
        }
        
        // Ajouter le nouvel utilisateur
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // En production: utiliser bcrypt pour hasher
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Connecter l'utilisateur directement
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Afficher le modal de bienvenue
        document.getElementById('welcome-modal').style.display = 'flex';
    }

    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('welcome-modal')) {
            document.getElementById('welcome-modal').style.display = 'none';
            window.location.href = 'mon-compte.html';
        }
    });
});