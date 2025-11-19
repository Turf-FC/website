// Utility functions for Competition Tracker

const utils = {
    // Format timestamp to readable date
    formatDate: (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format timestamp to date and time
    formatDateTime: (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Format date range
    formatDateRange: (startTimestamp, endTimestamp) => {
        return `${utils.formatDate(startTimestamp)} - ${utils.formatDate(endTimestamp)}`;
    },

    // Get competition status based on dates
    getCompetitionStatus: (starts, ends) => {
        const now = Date.now();
        if (now < starts) {
            return { status: 'upcoming', label: 'Upcoming', class: 'status-upcoming' };
        } else if (now >= starts && now <= ends) {
            return { status: 'active', label: 'Active', class: 'status-active' };
        } else {
            return { status: 'completed', label: 'Completed', class: 'status-completed' };
        }
    },

    // Get fixture status
    getFixtureStatus: (starts, finalScore) => {
        const now = Date.now();
        if (finalScore && finalScore.length === 2) {
            return { status: 'completed', label: 'Full Time' };
        } else if (now < starts) {
            return { status: 'scheduled', label: 'Scheduled' };
        } else {
            return { status: 'live', label: 'Live' };
        }
    },

    // Format score
    formatScore: (score) => {
        if (!score || score.length !== 2) return '-';
        return `${score[0]} - ${score[1]}`;
    },

    // Get event icon based on type
    getEventIcon: (eventType) => {
        switch (eventType.toLowerCase()) {
            case 'goal':
                return `<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3H9V7h2v3z"/>
                </svg>`;
            case 'yellow card':
                return `<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4h12v12H4V4z"/>
                </svg>`;
            case 'red card':
                return `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4h12v12H4V4z"/>
                </svg>`;
            default:
                return `<svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"/>
                </svg>`;
        }
    },

    // Get event color based on type
    getEventColor: (eventType) => {
        switch (eventType.toLowerCase()) {
            case 'goal':
                return 'text-green-500';
            case 'yellow card':
                return 'text-yellow-500';
            case 'red card':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    },

    // Format player name with alias
    formatPlayerName: (player) => {
        if (!player) return 'Unknown Player';
        const fullName = `${player.firstName} ${player.lastName}`;
        return player.alias ? `${fullName} (${player.alias})` : fullName;
    },

    // Format positions
    formatPositions: (primary, alternates = []) => {
        const positions = [primary, ...alternates].filter(Boolean);
        return positions.join(', ');
    },

    // Show loading overlay
    showLoading: () => {
        document.getElementById('loading-overlay').classList.remove('hidden');
    },

    // Hide loading overlay
    hideLoading: () => {
        document.getElementById('loading-overlay').classList.add('hidden');
    },

    // Show toast notification
    showToast: (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const bgColor = type === 'success' ? 'bg-green-600' : 
                       type === 'error' ? 'bg-red-600' : 
                       type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600';
        
        toast.className = `toast ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg max-w-md`;
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    },

    // Create modal
    createModal: (title, content, size = 'medium') => {
        const container = document.getElementById('modal-container');
        
        const sizeClass = size === 'large' ? 'max-w-4xl' : 
                         size === 'small' ? 'max-w-md' : 'max-w-2xl';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="modal-content bg-gray-800 rounded-lg shadow-2xl ${sizeClass} w-full max-h-[90vh] flex flex-col">
                <div class="flex items-center justify-between p-6 border-b border-gray-700">
                    <h3 class="text-xl font-semibold text-gray-100">${title}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-6 overflow-y-auto">
                    ${content}
                </div>
            </div>
        `;
        
        container.innerHTML = '';
        container.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    // Close modal
    closeModal: () => {
        document.getElementById('modal-container').innerHTML = '';
    },

    // Debounce function for search
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate unique ID
    generateId: () => {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },

    // Get player image or fallback
    getPlayerImage: (imageUrl) => {
        if (!imageUrl) {
            return `<div class="w-full h-48 bg-gray-700 flex items-center justify-center rounded-t-lg">
                <svg class="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
            </div>`;
        }
        return `<img src="${imageUrl}" alt="Player" class="w-full h-48 object-cover rounded-t-lg" onerror="this.onerror=null; this.parentElement.innerHTML=utils.getPlayerImage();">`;
    },

    // Sort array by property
    sortBy: (array, property, ascending = true) => {
        return [...array].sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            if (ascending) {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    },

    // Filter array by search term
    filterBySearch: (array, searchTerm, properties) => {
        if (!searchTerm) return array;
        
        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return properties.some(prop => {
                const value = item[prop];
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    }
};
