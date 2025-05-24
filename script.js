// Global variables
let currentLanguage = 'ar'; // Default language

// Utility function to safely get elements
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
        initializeApp();
});

function initializeApp() {
    try {
        console.log('Initializing app...');
        
        // Get stored language or default to Arabic
        currentLanguage = localStorage.getItem('preferredLanguage') || 'ar';
        console.log('Current language:', currentLanguage);

        // Set language attributes
    setLanguageAttributes(currentLanguage);
        
        // Update content
    updateLanguageContent();
        
        // Initialize page specific features
    initializePageSpecificFeatures();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Detailed initialization error:', error);
        safeShowNotification('حدث خطأ أثناء تهيئة التطبيق', 'error');
    }
}

function setLanguageAttributes(lang) {
    try {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        document.body.setAttribute('data-language', lang);
        console.log('Language attributes set:', lang);
    } catch (error) {
        console.error('Error setting language attributes:', error);
    }
}

function updateLanguageContent() {
    try {
        // Update text content
        document.querySelectorAll('[data-ar], [data-en]').forEach(element => {
            const text = element.getAttribute(`data-${currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Update placeholders
        document.querySelectorAll(`[data-${currentLanguage}-placeholder]`).forEach(element => {
            const placeholder = element.getAttribute(`data-${currentLanguage}-placeholder`);
            if (placeholder) {
                element.placeholder = placeholder;
            }
        });
        
        console.log('Language content updated');
    } catch (error) {
        console.error('Error updating language content:', error);
    }
}

function initializePageSpecificFeatures() {
    try {
        const page = document.body.getAttribute('data-page');
        console.log('Initializing page:', page);
        
        if (!page) {
            console.log('No specific page found');
            return;
        }

        switch(page) {
            case 'color':
                initializeColorFeatures();
                break;
            case 'media':
                initializeMediaFeatures();
                break;
            case 'replacer':
                initializeReplacerFeatures();
                break;
            default:
                console.log('Unknown page type:', page);
        }
    } catch (error) {
        console.error('Error initializing page features:', error);
    }
}

function safeShowNotification(message, type = 'success') {
    try {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Remove after delay
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Initialize Color Picker Features
function initializeColorFeatures() {
if (document.querySelector('[data-page="color"]')) {
        // Color picker specific initialization
        console.log('Initializing color picker features');
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
            safeShowNotification(currentLanguage === 'ar' ? 'تم استخراج الألوان بنجاح' : 'Colors extracted successfully', 'success');
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
}

// Initialize Media Downloader Features
function initializeMediaFeatures() {
    if (document.querySelector('[data-page="media"]')) {
        console.log('Initializing media features');
        
        // Initialize variables
        const mediaUrl = document.getElementById('mediaUrl');
        const previewSection = document.getElementById('previewSection');
        const preview = document.getElementById('preview');
        const downloadHistory = document.getElementById('downloadHistory');
        
        // Load history from localStorage
        loadDownloadHistory();
        
        window.checkUrl = async function() {
            try {
                const url = mediaUrl.value.trim();
                if (!url) {
                    safeShowNotification(currentLanguage === 'ar' ? 'الرجاء إدخال رابط صحيح' : 'Please enter a valid URL', 'error');
                    return;
                }

                // Show loading state
                preview.innerHTML = '<div class="animate-spin"><i class="fas fa-spinner fa-2x text-gray-400"></i></div>';
                previewSection.classList.remove('hidden');

                // Validate URL
                try {
                    new URL(url);
                } catch {
                    safeShowNotification(currentLanguage === 'ar' ? 'الرجاء إدخال رابط صحيح' : 'Please enter a valid URL', 'error');
                    return;
                }

                // Check if URL is from supported sites
                const supportedSites = ['youtube.com', 'youtu.be', 'twitter.com', 'instagram.com', 'tiktok.com'];
                const isSupported = supportedSites.some(site => url.includes(site));
                
                if (!isSupported) {
                    safeShowNotification(currentLanguage === 'ar' ? 'عذراً، هذا الموقع غير مدعوم' : 'Sorry, this site is not supported', 'error');
                    previewSection.classList.add('hidden');
                    return;
                }

                // For demo purposes, show a preview (in real implementation, you'd fetch actual preview)
                preview.innerHTML = `
                    <div class="text-center p-4">
                        <i class="fas fa-link fa-3x text-gray-400 mb-2"></i>
                        <p class="text-gray-600">${url}</p>
                    </div>
                `;

                safeShowNotification(currentLanguage === 'ar' ? 'تم التحقق من الرابط بنجاح' : 'URL verified successfully', 'success');
            } catch (error) {
                console.error('Error checking URL:', error);
                safeShowNotification(currentLanguage === 'ar' ? 'حدث خطأ أثناء التحقق من الرابط' : 'Error checking URL', 'error');
            }
        };

        window.downloadMedia = async function() {
            try {
                const url = mediaUrl.value.trim();
                if (!url) return;

                // Show loading state
                safeShowNotification(currentLanguage === 'ar' ? 'جاري التحميل...' : 'Downloading...', 'info');

                // For demo purposes, simulate download
                setTimeout(() => {
                    // Add to download history
                    addToDownloadHistory(url, 'media_' + Date.now());
                    
                    safeShowNotification(currentLanguage === 'ar' ? 'تم التحميل بنجاح' : 'Download completed', 'success');
                }, 2000);
            } catch (error) {
                console.error('Error downloading media:', error);
                safeShowNotification(currentLanguage === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error downloading media', 'error');
            }
        };

        window.copyUrl = function() {
            const url = mediaUrl.value.trim();
            if (!url) return;

            navigator.clipboard.writeText(url).then(() => {
                safeShowNotification(currentLanguage === 'ar' ? 'تم نسخ الرابط' : 'URL copied', 'success');
            }).catch(() => {
                safeShowNotification(currentLanguage === 'ar' ? 'فشل نسخ الرابط' : 'Failed to copy URL', 'error');
            });
        };

        function addToDownloadHistory(url, filename) {
            const historyItem = document.createElement('div');
            historyItem.className = 'bg-white rounded-lg p-4 shadow transition-all hover:shadow-md';
            historyItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1 truncate ml-3">
                        <p class="text-gray-600 text-sm truncate">${url}</p>
                        <p class="text-gray-400 text-xs mt-1">${new Date().toLocaleString()}</p>
                    </div>
                    <button onclick="copyToClipboard('${url}')" class="text-gray-400 hover:text-blue-600 transition">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            
            downloadHistory.insertBefore(historyItem, downloadHistory.firstChild);
            saveDownloadHistory();
        }

        function saveDownloadHistory() {
            const historyItems = Array.from(downloadHistory.children).map(item => {
                return {
                    url: item.querySelector('.text-gray-600').textContent,
                    date: item.querySelector('.text-gray-400').textContent
                };
            });
            localStorage.setItem('downloadHistory', JSON.stringify(historyItems));
        }

        function loadDownloadHistory() {
            try {
                const history = JSON.parse(localStorage.getItem('downloadHistory')) || [];
                history.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'bg-white rounded-lg p-4 shadow transition-all hover:shadow-md';
                    historyItem.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div class="flex-1 truncate ml-3">
                                <p class="text-gray-600 text-sm truncate">${item.url}</p>
                                <p class="text-gray-400 text-xs mt-1">${item.date}</p>
                            </div>
                            <button onclick="copyToClipboard('${item.url}')" class="text-gray-400 hover:text-blue-600 transition">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    `;
                    downloadHistory.appendChild(historyItem);
                });
            } catch (error) {
                console.error('Error loading download history:', error);
            }
        }
    }
}

// Initialize Replacer Features
function initializeReplacerFeatures() {
    if (document.querySelector('[data-page="replacer"]')) {
        const symbolInput = safeGetElement('symbolInput');
        const outputSection = safeGetElement('outputSection');
        const outputText = safeGetElement('outputText');
        const history = safeGetElement('history');

        console.log('Initializing replacer features');
        
        if (!symbolInput || !outputSection || !outputText || !history) {
            console.error('Some replacer elements not found');
            return;
        }

        // Rest of replacer code...
        window.replaceSymbols = function(symbol, replacement) {
            try {
                const text = symbolInput.value;
                if (!text.trim()) {
                    safeShowNotification(
                        currentLanguage === 'ar' ? 'الرجاء إدخال نص' : 'Please enter text',
                        'error'
                    );
                    return;
                }

                const newText = text.replaceAll(symbol, replacement);
                outputSection.classList.remove('hidden');
                outputText.textContent = newText;
                addToHistory(text, newText, symbol);
                safeShowNotification(
                    currentLanguage === 'ar' ? 'تم تبديل العلامات بنجاح' : 'Symbols replaced successfully',
                    'success'
                );
            } catch (error) {
                console.error('Error replacing symbols:', error);
                safeShowNotification(
                    currentLanguage === 'ar' ? 'حدث خطأ أثناء تبديل العلامات' : 'Error replacing symbols',
                    'error'
                );
            }
        };

        window.finalizeText = function() {
            try {
                const outputText = safeGetElement('outputText');
                const finalText = outputText.textContent;
                
                if (!finalText.trim()) {
                    safeShowNotification(
                        currentLanguage === 'ar' ? 'لا يوجد نص للتحويل' : 'No text to finalize',
                        'error'
                    );
                    return;
                }

                // Copy the final text to the input for any further modifications
                symbolInput.value = finalText;
                
                // Show success message with special styling
                const successMsg = currentLanguage === 'ar' ? 'تمت المهمة بنجاح ✓' : 'Task completed successfully ✓';
                
                // Create a special notification
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
                notification.style.transform = 'scale(1.1)';
                notification.innerHTML = `
                    <i class="fas fa-check-circle ml-2"></i>
                    ${successMsg}
                `;
                
                // Remove any existing notifications
                const existingNotification = document.querySelector('.notification');
                if (existingNotification) {
                    existingNotification.remove();
                }
                
                document.body.appendChild(notification);
                
                // Add scale animation
                setTimeout(() => {
                    notification.style.transform = 'scale(1)';
                    notification.style.transition = 'transform 0.3s ease';
                }, 50);

                // Remove notification after delay
                setTimeout(() => {
                    notification.classList.add('hide');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);

            } catch (error) {
                console.error('Error finalizing text:', error);
                safeShowNotification(
                    currentLanguage === 'ar' ? 'حدث خطأ أثناء إتمام العملية' : 'Error finalizing the operation',
                    'error'
                );
            }
        };

        window.clearText = function() {
            try {
                symbolInput.value = '';
                outputSection.classList.add('hidden');
                safeShowNotification(
                    currentLanguage === 'ar' ? 'تم مسح النص' : 'Text cleared',
                    'success'
                );
            } catch (error) {
                console.error('Error clearing text:', error);
            }
        };

        window.copyOutput = function() {
            try {
                const textToCopy = outputText.textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    safeShowNotification(
                        currentLanguage === 'ar' ? 'تم النسخ بنجاح' : 'Text copied successfully',
                        'success'
                    );
                });
            } catch (error) {
                console.error('Error copying text:', error);
                safeShowNotification(
                    currentLanguage === 'ar' ? 'فشل نسخ النص' : 'Failed to copy text',
                    'error'
                );
            }
        };
    }
}

// Helper function for adding to history
function addToHistory(oldText, newText, symbol) {
    try {
        const history = safeGetElement('history');
        if (!history) return;

        const historyItem = document.createElement('div');
        historyItem.className = 'bg-gray-50 rounded-lg p-3 text-sm';
        
        const symbolMap = {
            '-': 'شرطة',
            '_': 'شرطة سفلية',
            '.': 'نقطة'
        };

        historyItem.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-gray-500" dir="auto">
                    ${currentLanguage === 'ar' ? 'تم تبديل ' + symbolMap[symbol] : 'Replaced ' + symbol}
                </span>
                <button onclick="copyToClipboard('${newText}')" class="text-blue-600 hover:text-blue-700 p-1">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="mt-2 text-gray-700" dir="auto">${newText}</div>
        `;
        
        if (history.firstChild) {
            history.insertBefore(historyItem, history.firstChild);
        } else {
            history.appendChild(historyItem);
        }
    } catch (error) {
        console.error('Error adding to history:', error);
    }
}

// Utility function for copying to clipboard
function copyToClipboard(text) {
    try {
        navigator.clipboard.writeText(text).then(() => {
            safeShowNotification(
                currentLanguage === 'ar' ? 'تم النسخ بنجاح' : 'Copied successfully',
            'success'
            );
        }).catch(() => {
            safeShowNotification(
                currentLanguage === 'ar' ? 'فشل النسخ' : 'Copy failed',
                'error'
            );
        });
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        safeShowNotification(
            currentLanguage === 'ar' ? 'فشل النسخ' : 'Copy failed',
            'error'
        );
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
        safeShowNotification('Error changing language', 'error');
    }
}

// Utility Functions
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
} 