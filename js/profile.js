// profile.js - Profile and authentication functions with OTP

// Hardcoded credentials for demo
const VALID_CREDENTIALS = {
    email: 'johnlesterazarcon@gmail.com',
    password: '123456'
};

// Check if user is logged in (from session storage)
let isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// Make isLoggedIn available globally
window.isLoggedIn = isLoggedIn;

// OTP variables
let pendingLoginEmail = '';
let pendingUserName = '';

// DOM Elements
const authModal = document.getElementById('authModal');
const closeAuth = document.getElementById('closeAuth');
const authButtons = document.getElementById('authButtons');
const protectedContent = document.getElementById('protectedContent');
const lockScreen = document.getElementById('lockScreen');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginMessage = document.getElementById('loginMessage');
const signupMessage = document.getElementById('signupMessage');
const otpMessage = document.getElementById('otpMessage');

// Profile picture elements
const addPhotoBtn = document.getElementById('addPhotoBtn');
const profileUpload = document.getElementById('profileUpload');
const profileImage = document.getElementById('profileImage');
const profilePlaceholder = document.getElementById('profilePlaceholder');

// Update UI based on login status
function updateAuthUI() {
    if (isLoggedIn && currentUser) {
        // User is logged in
        authButtons.innerHTML = `
            <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <span>${currentUser.name}</span>
            </div>
            <button class="auth-btn logout-btn" onclick="logout()">Logout</button>
        `;
        protectedContent.classList.add('visible');
        lockScreen.style.display = 'none';
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <button class="auth-btn login-btn" onclick="openAuthModal()">Login</button>
            <button class="auth-btn signup-btn" onclick="openAuthModal('signup')">Sign Up</button>
        `;
        protectedContent.classList.remove('visible');
        lockScreen.style.display = 'block';
    }
    
    // Update global variable
    window.isLoggedIn = isLoggedIn;
}

// Open auth modal
window.openAuthModal = function(tab = 'login') {
    authModal.classList.add('active');
    switchAuthTab(tab);
}

// Close auth modal
if (closeAuth) {
    closeAuth.addEventListener('click', () => {
        authModal.classList.remove('active');
        clearAuthMessages();
    });
}

// Click outside to close
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
            clearAuthMessages();
        }
    });
}

// Clear auth messages
function clearAuthMessages() {
    if (loginMessage) {
        loginMessage.className = 'auth-message';
        loginMessage.textContent = '';
    }
    if (signupMessage) {
        signupMessage.className = 'auth-message';
        signupMessage.textContent = '';
    }
    if (otpMessage) {
        otpMessage.className = 'auth-message';
        otpMessage.textContent = '';
    }
}

// Switch between login and signup tabs
window.switchAuthTab = function(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => {
        if (t.textContent.toLowerCase().includes(tab)) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });
    
    forms.forEach(f => {
        if (f.id.toLowerCase().includes(tab)) {
            f.classList.add('active');
        } else {
            f.classList.remove('active');
        }
    });
    
    clearAuthMessages();
    
    // Clear OTP inputs when switching tabs
    if (tab !== 'otp') {
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`otp${i}`);
            if (input) input.value = '';
        }
    }
}

// ==================== OTP VERIFICATION SYSTEM ====================

// Login form submission with OTP
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Simple validation
        if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
            // Store email for OTP verification
            pendingLoginEmail = email;
            pendingUserName = 'Jhon Lester';
            
            loginMessage.className = 'auth-message success';
            loginMessage.textContent = '✓ Credentials verified! Sending OTP...';
            
            // Show OTP form after 1 second
            setTimeout(() => {
                switchToOTPForm();
            }, 1000);
        } else {
            // Login failed
            loginMessage.className = 'auth-message error';
            loginMessage.textContent = '✗ Invalid email or password. Try: johnlesterazarcon@gmail.com / 123456';
        }
    });
}

// Switch to OTP form
function switchToOTPForm() {
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(f => f.classList.remove('active'));
    document.getElementById('otpForm').classList.add('active');
    
    // Update email display
    const otpEmailDisplay = document.getElementById('otpEmailDisplay');
    if (otpEmailDisplay) {
        otpEmailDisplay.textContent = pendingLoginEmail;
    }
    
    // Clear any existing OTP message
    if (otpMessage) {
        otpMessage.className = 'auth-message';
        otpMessage.textContent = '';
    }
    
    // Clear OTP inputs
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otp${i}`);
        if (input) input.value = '';
    }
    
    // Auto-focus first OTP input
    const firstInput = document.getElementById('otp1');
    if (firstInput) firstInput.focus();
}

// Auto-move to next OTP field
for (let i = 1; i <= 6; i++) {
    const input = document.getElementById(`otp${i}`);
    if (input) {
        input.addEventListener('keyup', function(e) {
            // Allow only numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // If a number is entered, move to next field
            if (this.value.length === 1 && i < 6) {
                document.getElementById(`otp${i + 1}`).focus();
            }
            
            // If backspace is pressed and field is empty, move to previous field
            if (e.key === 'Backspace' && this.value.length === 0 && i > 1) {
                document.getElementById(`otp${i - 1}`).focus();
            }
            
            // Auto-submit when all fields are filled
            if (i === 6 && this.value.length === 1) {
                let allFilled = true;
                for (let j = 1; j <= 6; j++) {
                    const field = document.getElementById(`otp${j}`);
                    if (!field || !field.value) {
                        allFilled = false;
                        break;
                    }
                }
                if (allFilled) {
                    setTimeout(() => verifyOTP(), 100);
                }
            }
        });
        
        // Allow only numbers on keypress
        input.addEventListener('keypress', function(e) {
            const charCode = e.which ? e.which : e.keyCode;
            if (charCode < 48 || charCode > 57) {
                e.preventDefault();
            }
        });
    }
}

// Verify OTP
window.verifyOTP = function() {
    // Get all OTP inputs
    let otpCode = '';
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otp${i}`);
        if (input) {
            otpCode += input.value;
        }
    }
    
    // Check if all fields are filled
    if (otpCode.length < 6) {
        if (otpMessage) {
            otpMessage.className = 'auth-message error';
            otpMessage.textContent = '✗ Please enter all 6 digits';
        }
        return;
    }
    
    // Demo OTP is 123456
    if (otpCode === '123456') {
        // OTP verified successfully
        currentUser = {
            name: pendingUserName,
            email: pendingLoginEmail,
            loginTime: new Date().toISOString()
        };
        
        isLoggedIn = true;
        window.isLoggedIn = true;
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        if (otpMessage) {
            otpMessage.className = 'auth-message success';
            otpMessage.textContent = '✓ OTP verified! Logging in...';
        }
        
        setTimeout(() => {
            if (authModal) authModal.classList.remove('active');
            updateAuthUI();
            clearAuthMessages();
            
            // Reset forms
            if (loginForm) loginForm.reset();
            for (let i = 1; i <= 6; i++) {
                const input = document.getElementById(`otp${i}`);
                if (input) input.value = '';
            }
            
            // Load user data
            loadProfilePicture();
            if (typeof renderGallery === 'function') renderGallery();
        }, 1000);
    } else {
        // OTP verification failed
        if (otpMessage) {
            otpMessage.className = 'auth-message error';
            otpMessage.textContent = '✗ Invalid OTP. Try: 123456';
        }
        
        // Shake animation for wrong OTP
        const container = document.querySelector('.auth-container');
        if (container) {
            container.style.animation = 'shake 0.3s';
            setTimeout(() => {
                container.style.animation = '';
            }, 300);
        }
    }
}

// Resend OTP
window.resendOTP = function() {
    if (otpMessage) {
        otpMessage.className = 'auth-message success';
      
    }
    
    // Clear OTP inputs
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otp${i}`);
        if (input) input.value = '';
    }
    
    const firstInput = document.getElementById('otp1');
    if (firstInput) firstInput.focus();
}

// Back to login from OTP
window.backToLogin = function() {
    switchAuthTab('login');
}

// Signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;
        
        // Validation
        if (password !== confirm) {
            signupMessage.className = 'auth-message error';
            signupMessage.textContent = '✗ Passwords do not match';
            return;
        }
        
        if (password.length < 6) {
            signupMessage.className = 'auth-message error';
            signupMessage.textContent = '✗ Password must be at least 6 characters';
            return;
        }
        
        // For demo, just login directly (you can add OTP for signup too if desired)
        currentUser = {
            name: name,
            email: email,
            loginTime: new Date().toISOString()
        };
        
        isLoggedIn = true;
        window.isLoggedIn = true;
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        signupMessage.className = 'auth-message success';
        signupMessage.textContent = '✓ Account created! Logging in...';
        
        setTimeout(() => {
            authModal.classList.remove('active');
            updateAuthUI();
            clearAuthMessages();
            signupForm.reset();
            
            // Load user data
            loadProfilePicture();
            if (typeof renderGallery === 'function') renderGallery();
        }, 1000);
    });
}

// Logout function
window.logout = function() {
    isLoggedIn = false;
    window.isLoggedIn = false;
    currentUser = null;
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    updateAuthUI();
    
    // Clear gallery
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) galleryGrid.innerHTML = '';
}

// Profile picture upload
if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', () => {
        if (!isLoggedIn) {
            alert('Please login first!');
            openAuthModal();
            return;
        }
        profileUpload.click();
    });
}

if (profileUpload) {
    profileUpload.addEventListener('change', function(e) {
        if (!isLoggedIn) {
            alert('Please login first!');
            openAuthModal();
            return;
        }
        
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
                profileImage.style.display = 'block';
                profilePlaceholder.style.display = 'none';
                
                // Save to localStorage
                localStorage.setItem('profilePicture', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Load saved profile picture
function loadProfilePicture() {
    const saved = localStorage.getItem('profilePicture');
    if (saved && profileImage && profilePlaceholder) {
        profileImage.src = saved;
        profileImage.style.display = 'block';
        profilePlaceholder.style.display = 'none';
    }
}

// Initialize
updateAuthUI();
loadProfilePicture();

// Add shake animation style if not exists
if (!document.querySelector('#shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}
// Fix navigation links
document.querySelectorAll('.nav-links a[href="index.html"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'index.html';
    });
});

document.querySelectorAll('.nav-links a[href="#profile"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const profileSection = document.getElementById('profile');
        if (profileSection) {
            profileSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

document.querySelectorAll('.nav-links a[href="#achievements"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const achievementsSection = document.getElementById('achievements');
        if (achievementsSection) {
            achievementsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});