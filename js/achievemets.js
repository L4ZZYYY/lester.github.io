// achievements.js - Achievement management functions

// Load achievements from localStorage (persists even after logout)
let achievements = JSON.parse(localStorage.getItem('achievements')) || [
    {
        id: 1,
        title: "Dean's Lister",
        subtitle: "Dean's Lister - First Semester",
        date: "12/15/2023",
        category: "Academic",
        image: "https://via.placeholder.com/400x200/172a45/64ffda?text=Dean's+Lister"
    },
    {
        id: 2,
        title: "JPCS Membership",
        subtitle: "JPCS Membership - Sophomore Representative",
        date: "1/15/2025",
        category: "Academic",
        image: "https://via.placeholder.com/400x200/172a45/64ffda?text=JPCS"
    },
    {
        id: 3,
        title: "Web Design Competition",
        subtitle: "Web Design Competition - 2nd Place",
        date: "11/10/2023",
        category: "Award",
        image: "https://via.placeholder.com/400x200/172a45/64ffda?text=Web+Design"
    }
];

// DOM Elements for achievements
const galleryGrid = document.getElementById('galleryGrid');
const uploadArea = document.getElementById('uploadArea');
const achievementUpload = document.getElementById('achievementUpload');
const achievementCount = document.getElementById('achievementCount');

// Render gallery
function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.id = achievement.id;
        
        item.innerHTML = `
            <div class="gallery-image-container">
                <img src="${achievement.image}" alt="${achievement.title}" class="gallery-image">
                <div class="gallery-overlay">
                    <button class="gallery-action delete-btn" onclick="deleteAchievement(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="gallery-content">
                <h4 class="gallery-title">${achievement.title}</h4>
                <div class="gallery-subtitle">${achievement.subtitle}</div>
                <div class="gallery-meta">
                    <span class="gallery-date">${achievement.date}</span>
                    <span class="gallery-category">${achievement.category}</span>
                </div>
            </div>
        `;
        
        galleryGrid.appendChild(item);
    });
    
    updateAchievementCount();
}

// Save achievements to localStorage
function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

// Update achievement count
function updateAchievementCount() {
    if (achievementCount) {
        achievementCount.textContent = achievements.length;
    }
}

// Handle achievement upload
function handleAchievementUpload(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newAchievement = {
                    id: Date.now() + Math.random(),
                    title: "New Achievement",
                    subtitle: "Uploaded achievement",
                    date: new Date().toLocaleDateString(),
                    category: "Academic",
                    image: e.target.result
                };
                
                achievements.unshift(newAchievement);
                saveAchievements();
                renderGallery();
            };
            reader.readAsDataURL(file);
        }
    });
}

// Delete achievement
window.deleteAchievement = function(button) {
    if (!window.isLoggedIn) {
        alert('Please login first!');
        if (window.openAuthModal) window.openAuthModal();
        return;
    }
    
    if (confirm('Are you sure you want to delete this achievement?')) {
        const galleryItem = button.closest('.gallery-item');
        const id = parseFloat(galleryItem.dataset.id);
        
        achievements = achievements.filter(a => a.id !== id);
        saveAchievements();
        galleryItem.remove();
        updateAchievementCount();
    }
}

// Initialize achievements if logged in
if (window.isLoggedIn) {
    renderGallery();
    updateAchievementCount();
}