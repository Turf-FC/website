// Utility Functions

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle();

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const theme = document.documentElement.getAttribute('data-theme');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    if (sunIcon && moonIcon) {
        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            break;
        case 'error':
            icon = '<svg class="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            break;
        case 'warning':
            icon = '<svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
            break;
        default:
            icon = '<svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }

    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, duration);
}

// Confirmation Dialog
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');

        if (!modal || !confirmMessage || !confirmYes || !confirmNo) {
            resolve(false);
            return;
        }

        confirmMessage.textContent = message;
        modal.classList.remove('hidden');

        const handleYes = () => {
            cleanup();
            resolve(true);
        };

        const handleNo = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modal.classList.add('hidden');
            confirmYes.removeEventListener('click', handleYes);
            confirmNo.removeEventListener('click', handleNo);
        };

        confirmYes.addEventListener('click', handleYes);
        confirmNo.addEventListener('click', handleNo);

        // Close on backdrop click
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', handleNo);
        }
    });
}

// Date/Time Formatting
function formatDateTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
}

// Convert datetime-local input format to ISO
function toISO(dateTimeLocalValue) {
    if (!dateTimeLocalValue) return null;
    return new Date(dateTimeLocalValue).toISOString();
}

// Convert ISO to datetime-local input format
function fromISO(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Debounce function for search
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

// Create Multi-select Component
function createMultiSelect(container, options, selected = [], maxSelections = null) {
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'multi-select-tags';
    
    const dropdownDiv = document.createElement('div');
    dropdownDiv.className = 'multi-select-dropdown hidden';
    
    container.appendChild(tagsDiv);
    container.appendChild(dropdownDiv);
    
    let selectedValues = [...selected];
    
    function updateTags() {
        tagsDiv.innerHTML = '';
        
        if (selectedValues.length === 0) {
            const placeholder = document.createElement('span');
            placeholder.className = 'text-secondary';
            placeholder.textContent = 'Select options...';
            tagsDiv.appendChild(placeholder);
        } else {
            selectedValues.forEach(value => {
                const option = options.find(opt => opt.value === value);
                if (option) {
                    const tag = document.createElement('span');
                    tag.className = 'multi-select-tag';
                    tag.innerHTML = `
                        ${option.label}
                        <button type="button" data-value="${value}">×</button>
                    `;
                    
                    tag.querySelector('button').addEventListener('click', (e) => {
                        e.stopPropagation();
                        removeSelection(value);
                    });
                    
                    tagsDiv.appendChild(tag);
                }
            });
        }
    }
    
    function updateDropdown() {
        dropdownDiv.innerHTML = '';
        
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multi-select-option';
            optionDiv.textContent = option.label;
            optionDiv.dataset.value = option.value;
            
            if (selectedValues.includes(option.value)) {
                optionDiv.classList.add('selected');
            }
            
            optionDiv.addEventListener('click', () => {
                toggleSelection(option.value);
            });
            
            dropdownDiv.appendChild(optionDiv);
        });
    }
    
    function toggleSelection(value) {
        const index = selectedValues.indexOf(value);
        
        if (index > -1) {
            selectedValues.splice(index, 1);
        } else {
            if (!maxSelections || selectedValues.length < maxSelections) {
                selectedValues.push(value);
            } else {
                showToast(`Maximum ${maxSelections} selections allowed`, 'warning');
                return;
            }
        }
        
        updateTags();
        updateDropdown();
        
        // Trigger change event
        const event = new CustomEvent('change', { detail: selectedValues });
        container.dispatchEvent(event);
    }
    
    function removeSelection(value) {
        const index = selectedValues.indexOf(value);
        if (index > -1) {
            selectedValues.splice(index, 1);
            updateTags();
            updateDropdown();
            
            // Trigger change event
            const event = new CustomEvent('change', { detail: selectedValues });
            container.dispatchEvent(event);
        }
    }
    
    // Toggle dropdown
    tagsDiv.addEventListener('click', () => {
        dropdownDiv.classList.toggle('hidden');
    });
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdownDiv.classList.add('hidden');
        }
    });
    
    // Initial render
    updateTags();
    updateDropdown();
    
    // Return methods for external control
    return {
        getSelected: () => selectedValues,
        setSelected: (values) => {
            selectedValues = values;
            updateTags();
            updateDropdown();
        },
        clear: () => {
            selectedValues = [];
            updateTags();
            updateDropdown();
        }
    };
}

// Connection Status Manager
let connectionStatus = 'connected';
let connectionInterval = null;

function updateConnectionStatus(status) {
    connectionStatus = status;
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;
    
    if (status === 'connected') {
        statusElement.innerHTML = `
            <span class="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span class="text-sm text-secondary">Connected</span>
        `;
    } else if (status === 'disconnected') {
        statusElement.innerHTML = `
            <span class="w-2 h-2 bg-error rounded-full"></span>
            <span class="text-sm text-secondary">Disconnected</span>
        `;
    } else {
        statusElement.innerHTML = `
            <span class="w-2 h-2 bg-warning rounded-full animate-pulse"></span>
            <span class="text-sm text-secondary">Connecting...</span>
        `;
    }
}

function startConnectionCheck() {
    // Check connection every 30 seconds
    connectionInterval = setInterval(async () => {
        try {
            await API.auth.check();
            updateConnectionStatus('connected');
        } catch (error) {
            updateConnectionStatus('disconnected');
        }
    }, 30000);
}

function stopConnectionCheck() {
    if (connectionInterval) {
        clearInterval(connectionInterval);
        connectionInterval = null;
    }
}

// Initialize utilities on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Start connection check on main page
    if (!window.location.pathname.includes('login.html')) {
        startConnectionCheck();
    }
});