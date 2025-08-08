// Service status checker and search functionality
class OgTheJoeHomepage {
    constructor() {
        this.services = [
            {
                name: 'copyparty',
                url: 'https://copyparty.ogthejoe.com',
                healthEndpoint: 'https://copyparty.ogthejoe.com/',
                displayName: 'File Sharing'
            },
            {
                name: 'story-editor',
                url: 'https://story-editor.ogthejoe.com',
                healthEndpoint: 'https://story-editor.ogthejoe.com/health',
                displayName: 'VN Story Editor'
            },
            {
                name: 'vn-compiler',
                url: 'https://vn-compiler.ogthejoe.com',
                healthEndpoint: 'https://vn-compiler.ogthejoe.com/health',
                displayName: 'VN Compiler API'
            },
            {
                name: 'coolify',
                url: 'https://coolify.ogthejoe.com',
                healthEndpoint: 'https://coolify.ogthejoe.com/',
                displayName: 'Server Management'
            }
        ];
        
        this.init();
    }

    init() {
        this.setupSearch();
        this.checkServiceStatus();
        // Check status every 30 seconds
        setInterval(() => this.checkServiceStatus(), 30000);
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const servicesGrid = document.getElementById('servicesGrid');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const serviceCards = servicesGrid.querySelectorAll('.service-card');
                
                serviceCards.forEach(card => {
                    const serviceName = card.querySelector('p').textContent.toLowerCase();
                    const serviceDesc = card.querySelector('.text-\\[\\#a093c8\\]').textContent.toLowerCase();
                    
                    if (serviceName.includes(query) || serviceDesc.includes(query)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    }

    async checkServiceStatus() {
        const lastCheckedElement = document.getElementById('lastChecked');
        const now = new Date().toLocaleString();
        
        for (const service of this.services) {
            const indicator = document.querySelector(`[data-service="${service.name}"]`);
            if (indicator) {
                indicator.className = 'status-indicator status-checking';
            }
        }

        if (lastCheckedElement) {
            lastCheckedElement.textContent = `Checking services... Last attempt: ${now}`;
        }

        const results = await Promise.allSettled(
            this.services.map(service => this.checkSingleService(service))
        );

        results.forEach((result, index) => {
            const service = this.services[index];
            const indicator = document.querySelector(`[data-service="${service.name}"]`);
            
            if (indicator) {
                if (result.status === 'fulfilled' && result.value) {
                    indicator.className = 'status-indicator status-online';
                } else {
                    indicator.className = 'status-indicator status-offline';
                }
            }
        });

        if (lastCheckedElement) {
            const onlineCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
            lastCheckedElement.textContent = `Last checked: ${now} • ${onlineCount}/${this.services.length} services online`;
        }
    }

    async checkSingleService(service) {
        try {
            // Simple approach: try to fetch with no-cors mode
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(service.healthEndpoint, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return true; // If no error thrown, assume service is up
        } catch (error) {
            return false;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OgTheJoeHomepage();
});

// Handle service card clicks
document.addEventListener('click', (e) => {
    const serviceCard = e.target.closest('.service-card');
    if (serviceCard) {
        const serviceName = serviceCard.dataset.service;
        console.log(`Navigating to service: ${serviceName}`);
    }
});
