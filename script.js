// Language Management
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('An error occurred while initializing the app', 'error');
    }
});

function initializeApp() {
    const currentLanguage = localStorage.getItem('preferredLanguage') || 'ar';
    setLanguageAttributes(currentLanguage);
    updateLanguageContent();
    initializePageSpecificFeatures();
}

function setLanguageAttributes(lang) {
    try {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        document.body.setAttribute('data-language', lang);
    } catch (error) {
        console.error('Error setting language attributes:', error);
    }
}

// Update text content based on language
function updateLanguageContent() {
    try {
        const currentLanguage = localStorage.getItem('preferredLanguage') || 'ar';
        document.querySelectorAll('[data-ar]').forEach(element => {
            element.textContent = element.getAttribute(`data-${currentLanguage}`) || element.textContent;
        });
        document.querySelectorAll(`[data-${currentLanguage}-placeholder]`).forEach(element => {
            element.placeholder = element.getAttribute(`data-${currentLanguage}-placeholder`) || '';
        });
    } catch (error) {
        console.error('Error updating language content:', error);
    }
}

// Set language and redirect
function setLanguage(lang) {
    try {
        if (!['ar', 'en'].includes(lang)) {
            throw new Error('Invalid language code');
        }
        localStorage.setItem('preferredLanguage', lang);
        setLanguageAttributes(lang);
        updateLanguageContent();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error setting language:', error);
        showNotification('Error changing language', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    try {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" aria-hidden="true"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Initialize page specific features
function initializePageSpecificFeatures() {
    const page = document.body.getAttribute('data-page');
    
    switch(page) {
        case 'color':
            initializeColorPicker();
            break;
        case 'media':
            initializeMediaDownloader();
            break;
        case 'replacer':
            initializeSymbolReplacer();
            break;
    }
}

// Color Picker Functions
if (document.querySelector('[data-page="color"]')) {
    const colorPicker = document.getElementById('colorPicker');
    const imageInput = document.getElementById('imageInput');
    const colorResults = document.getElementById('colorResults');
    const currentColorPreview = document.getElementById('currentColorPreview');
    const currentColorCode = document.getElementById('currentColorCode');
    const imagePreview = document.getElementById('imagePreview');
    const uploadedImage = document.getElementById('uploadedImage');
    const dragZone = document.querySelector('.border-dashed');

    // Handle direct color picker
    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        updateCurrentColor(color);
    });

    colorPicker.addEventListener('change', (e) => {
        const color = e.target.value;
        addColorToResults(color);
    });

    function updateCurrentColor(color) {
        currentColorPreview.style.backgroundColor = color;
        currentColorCode.textContent = color.toUpperCase();
        
        // Calculate contrast color for text
        const rgb = hexToRgb(color);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        currentColorPreview.style.color = brightness > 128 ? '#000000' : '#FFFFFF';
    }

    // Handle image upload
    imageInput.addEventListener('change', handleImageUpload);

    // Drag and drop
    dragZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragZone.classList.add('border-blue-500');
        dragZone.classList.add('bg-blue-50');
    });

    dragZone.addEventListener('dragleave', () => {
        dragZone.classList.remove('border-blue-500');
        dragZone.classList.remove('bg-blue-50');
    });

    dragZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragZone.classList.remove('border-blue-500');
        dragZone.classList.remove('bg-blue-50');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    }

    function handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage.src = e.target.result;
            imagePreview.classList.remove('hidden');
            const img = new Image();
            img.onload = () => extractColors(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractColors(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorMap = new Map();
        
        for (let i = 0; i < imageData.length; i += 4) {
            const color = rgbToHex(imageData[i], imageData[i + 1], imageData[i + 2]);
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }
        
        const sortedColors = [...colorMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([color]) => color);
        
        colorResults.innerHTML = '';
        sortedColors.forEach(addColorToResults);
        showNotification(currentLanguage === 'ar' ? 'تم استخراج الألوان بنجاح' : 'Colors extracted successfully');
    }

    function addColorToResults(color) {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-item bg-white rounded-lg shadow-md overflow-hidden';
        
        // Calculate contrast color for text
        const rgb = hexToRgb(color);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        const textColor = brightness > 128 ? '#000000' : '#FFFFFF';
        
        colorItem.innerHTML = `
            <div class="aspect-square" style="background-color: ${color};" onclick="copyToClipboard('${color}')"></div>
            <div class="p-2 text-center text-sm font-mono" style="color: ${textColor}; background-color: ${color}">
                ${color.toUpperCase()}
            </div>
        `;
        colorResults.appendChild(colorItem);
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// Symbol Replacer Functions
if (document.querySelector('[data-page="replacer"]')) {
    const symbolInput = document.getElementById('symbolInput');
    const history = document.getElementById('history');

    function replaceSymbols(symbol, replacement) {
        const text = symbolInput.value;
        const newText = text.replaceAll(symbol, replacement);
        symbolInput.value = newText;
        addToHistory(text, newText);
        showNotification(currentLanguage === 'ar' ? 'تم تبديل العلامات بنجاح' : 'Symbols replaced successfully');
    }

    function addToHistory(oldText, newText) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="flex-1">
                <div class="text-sm text-gray-500">${oldText}</div>
                <div class="font-medium">${newText}</div>
            </div>
            <div class="history-actions">
                <button onclick="copyToClipboard('${newText}')" class="text-blue-600 hover:text-blue-700">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        history.insertBefore(historyItem, history.firstChild);
    }
}

// Media Downloader Functions
if (document.querySelector('[data-page="media"]')) {
    const mediaUrl = document.getElementById('mediaUrl');
    const previewSection = document.getElementById('previewSection');
    const preview = document.getElementById('preview');
    const downloadHistory = document.getElementById('downloadHistory');

    function checkUrl() {
        const url = mediaUrl.value.trim();
        if (!url) {
            showNotification(
                currentLanguage === 'ar' ? 'الرجاء إدخال رابط صحيح' : 'Please enter a valid URL',
                'error'
            );
            return;
        }

        // Show loading state
        preview.innerHTML = '<div class="loading"></div>';
        previewSection.classList.remove('hidden');

        // Simulate API call (replace with actual API integration)
        setTimeout(() => {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.includes('youtu.be') 
                    ? url.split('/').pop()
                    : new URLSearchParams(new URL(url).search).get('v');
                preview.innerHTML = `
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                preview.innerHTML = `
                    <img src="${url}" alt="Media preview" class="w-full h-full object-contain">
                `;
            }
            addToDownloadHistory(url);
        }, 1000);
    }

    function addToDownloadHistory(url) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item mb-2';
        historyItem.innerHTML = `
            <div class="flex-1 truncate">
                <a href="${url}" target="_blank" class="text-blue-600 hover:text-blue-700">${url}</a>
            </div>
            <div class="history-actions">
                <button onclick="copyToClipboard('${url}')" class="text-blue-600 hover:text-blue-700">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        downloadHistory.insertBefore(historyItem, downloadHistory.firstChild);
    }

    function downloadMedia() {
        const url = mediaUrl.value.trim();
        if (!url) return;
        
        showNotification(
            currentLanguage === 'ar' ? 'جاري تحميل الوسائط...' : 'Downloading media...',
            'success'
        );
        
        // Simulate download (replace with actual download logic)
        setTimeout(() => {
            window.open(url, '_blank');
        }, 500);
    }
}

// Utility Functions
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(
            currentLanguage === 'ar' ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard',
            'success'
        );
    }).catch(() => {
        showNotification(
            currentLanguage === 'ar' ? 'فشل النسخ إلى الحافظة' : 'Failed to copy to clipboard',
            'error'
        );
    });
} 