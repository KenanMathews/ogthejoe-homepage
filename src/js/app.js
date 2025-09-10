// Service status checker and search functionality
class OgTheJoeHomepage {
    constructor() {
        this.services = [
            {
                name: 'copyparty',
                url: 'https://copyparty.ogthejoe.com',
                healthEndpoint: 'https://copyparty.ogthejoe.com/',
                displayName: 'File Sharing',
                description: 'Secure file sharing and storage',
                icon: 'description',
                gradient: 'from-blue-500 to-purple-600'
            },
            {
                name: 'chat',
                url: 'http://chat.ogthejoe.com',
                healthEndpoint: 'http://chat.ogthejoe.com/',
                displayName: 'Matrix Chat',
                description: 'Element Matrix chat client',
                icon: 'chat',
                gradient: 'from-green-500 to-teal-600'
            },
            {
                name: 'story-editor',
                url: 'https://story-editor.ogthejoe.com',
                healthEndpoint: 'https://story-editor.ogthejoe.com/health',
                displayName: 'VN Story Editor',
                description: 'Create and edit visual novel stories',
                icon: 'edit',
                gradient: 'from-purple-500 to-pink-600'
            },
            {
                name: 'vn-compiler',
                url: 'https://vn-compiler.ogthejoe.com',
                healthEndpoint: 'https://vn-compiler.ogthejoe.com/health',
                displayName: 'VN Compiler API',
                description: 'Compile visual novel projects',
                icon: 'settings',
                gradient: 'from-orange-500 to-red-600'
            },
            {
                name: 'coolify',
                url: 'https://coolify.ogthejoe.com',
                healthEndpoint: 'https://coolify.ogthejoe.com/',
                displayName: 'Server Management',
                description: 'Docker container management',
                icon: 'dns',
                gradient: 'from-indigo-500 to-blue-600'
            },
            {
                name: 'homeassistant',
                url: 'https://homeassistant.ogthejoe.com',
                healthEndpoint: 'https://homeassistant.ogthejoe.com/',
                displayName: 'Home Assistant',
                description: 'Smart home automation',
                icon: 'home',
                gradient: 'from-cyan-500 to-teal-600'
            },
            {
                name: 'nocodb',
                url: 'https://nocodb.ogthejoe.com',
                healthEndpoint: 'https://nocodb.ogthejoe.com/',
                displayName: 'NocoDB',
                description: 'Database management',
                icon: 'storage',
                gradient: 'from-emerald-500 to-green-600'
            }
        ];
        
        this.init();
    }

    init() {
        this.renderServices();
        this.setupSearch();
        this.setupSmoothScrolling();
        this.checkServiceStatus();
        // Check status every 30 seconds
        setInterval(() => this.checkServiceStatus(), 30000);
    }

    renderServices() {
        const servicesGrid = document.getElementById('servicesGrid');
        if (!servicesGrid) return;

        servicesGrid.innerHTML = ''; // Clear existing content

        this.services.forEach(service => {
            const serviceCard = document.createElement('a');
            serviceCard.href = service.url;
            serviceCard.target = service.internal ? '_self' : '_blank';
            serviceCard.className = 'service-card flex flex-col items-center justify-center p-6 rounded-xl aspect-square group';
            
            // If it's an internal service without a URL, make it non-clickable
            if (service.internal && service.url === '#') {
                serviceCard.href = '#';
                serviceCard.onclick = (e) => e.preventDefault();
                serviceCard.className += ' opacity-75 cursor-default';
            }

            serviceCard.innerHTML = `
                <div class="w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-3xl text-white">${service.icon}</span>
                </div>
                <h3 class="text-lg font-bold mb-1">
                    ${service.healthEndpoint ? `<span class="status-indicator status-checking" data-service="${service.name}"></span>` : ''}
                    ${service.displayName}
                </h3>
                <p class="text-[#a093c8] text-sm text-center">${service.description}</p>
            `;

            servicesGrid.appendChild(serviceCard);
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const servicesGrid = document.getElementById('servicesGrid');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const serviceCards = servicesGrid.querySelectorAll('a');
                
                serviceCards.forEach(card => {
                    const serviceName = card.querySelector('h3').textContent.toLowerCase();
                    const serviceDesc = card.querySelector('p').textContent.toLowerCase();
                    
                    if (serviceName.includes(query) || serviceDesc.includes(query)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    async checkServiceStatus() {
        const lastCheckedElement = document.getElementById('lastChecked');
        const now = new Date().toLocaleString();
        
        // Set all indicators to checking state (only for services with health endpoints)
        const publicServices = this.services.filter(service => service.healthEndpoint);
        
        for (const service of publicServices) {
            const indicator = document.querySelector(`[data-service="${service.name}"]`);
            if (indicator) {
                indicator.className = 'status-indicator status-checking';
            }
        }

        if (lastCheckedElement) {
            lastCheckedElement.textContent = `Checking services... Last attempt: ${now}`;
        }

        // Check only services with health endpoints
        const results = await Promise.allSettled(
            publicServices.map(service => this.checkSingleService(service))
        );

        // Update indicators based on results
        results.forEach((result, index) => {
            const service = publicServices[index];
            const indicator = document.querySelector(`[data-service="${service.name}"]`);
            
            if (indicator) {
                if (result.status === 'fulfilled' && result.value) {
                    indicator.className = 'status-indicator status-online';
                } else {
                    indicator.className = 'status-indicator status-offline';
                }
            }
        });

        // Update status summary
        if (lastCheckedElement) {
            const onlineCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
            const totalPublicServices = publicServices.length;
            const internalCount = this.services.length - totalPublicServices;
            
            let statusText = `Last checked: ${now} • ${onlineCount}/${totalPublicServices} public services online`;
            if (internalCount > 0) {
                statusText += ` • ${internalCount} internal services`;
            }
            
            lastCheckedElement.textContent = statusText;
        }
    }

    async checkSingleService(service) {
        try {
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            // Simple approach: try to fetch with no-cors mode
            const response = await fetch(service.healthEndpoint, {
                method: 'HEAD',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return true; // If no error thrown, assume service is up
        } catch (error) {
            console.log(`Service ${service.name} appears to be offline:`, error.message);
            return false;
        }
    }

    // Method to manually refresh service status
    refreshStatus() {
        this.checkServiceStatus();
    }

    // Method to get current service statuses
    getServiceStatuses() {
        const statuses = {};
        this.services.forEach(service => {
            const indicator = document.querySelector(`[data-service="${service.name}"]`);
            if (indicator) {
                if (indicator.classList.contains('status-online')) {
                    statuses[service.name] = 'online';
                } else if (indicator.classList.contains('status-offline')) {
                    statuses[service.name] = 'offline';
                } else {
                    statuses[service.name] = 'checking';
                }
            } else {
                statuses[service.name] = 'internal';
            }
        });
        return statuses;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.ogTheJoeHomepage = new OgTheJoeHomepage();
    
    // Log initialization with detailed info
    console.log('🚀 OgTheJoe Homepage initialized');
    console.log('📋 Available services:', window.ogTheJoeHomepage.services.map(s => `${s.displayName} (${s.internal ? 'internal' : 'public'})`));
    console.log('🔧 Debug commands available:');
    console.log('  - ogTheJoeHomepage.refreshStatus() : Manually refresh all service statuses');
    console.log('  - ogTheJoeHomepage.testService("serviceName") : Test a specific service');
    console.log('  - ogTheJoeHomepage.getServiceStatuses() : Get current status of all services');
    
    // Show public vs internal service breakdown
    const publicCount = window.ogTheJoeHomepage.services.filter(s => !s.internal).length;
    const internalCount = window.ogTheJoeHomepage.services.filter(s => s.internal).length;
    console.log(`📊 Service breakdown: ${publicCount} public, ${internalCount} internal`);
});

// Handle service card clicks for analytics/logging
document.addEventListener('click', (e) => {
    const serviceCard = e.target.closest('.service-card');
    if (serviceCard) {
        const serviceName = serviceCard.querySelector('h3')?.textContent?.trim();
        if (serviceName) {
            console.log(`Service accessed: ${serviceName}`);
            // You can add analytics tracking here if needed
        }
    }
});

// Handle search button in header (if needed for mobile or additional functionality)
document.addEventListener('click', (e) => {
    if (e.target.closest('button')?.querySelector('.material-symbols-outlined')?.textContent === 'search') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    }
});

// Add some utility functions for potential future use
const utils = {
    // Format timestamp for display
    formatTimestamp: (date = new Date()) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Debounce function for search optimization
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
    }
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OgTheJoeHomepage, utils };
}