// Main JavaScript for Car Rental System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips, popovers, etc.
    initializeUI();
});

function initializeUI() {
    // Set active sidebar link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPath || currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Format currency
    formatCurrencies();

    // Add event listeners
    addEventListeners();
}

function formatCurrencies() {
    document.querySelectorAll('[data-currency]').forEach(el => {
        const value = parseFloat(el.textContent);
        if (!isNaN(value)) {
            el.textContent = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(value);
        }
    });
}

function addEventListeners() {
    // Search forms
    document.querySelectorAll('input[type="search"]').forEach(input => {
        input.addEventListener('keyup', debounce(function() {
            // Add search functionality if needed
        }, 300));
    });

    // Delete confirmations
    document.querySelectorAll('a[onclick*="confirm"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!confirm('Bạn chắc chắn muốn xóa?')) {
                e.preventDefault();
            }
        });
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Alert notification
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Export functions
window.showAlert = showAlert;
window.formatCurrencies = formatCurrencies;
