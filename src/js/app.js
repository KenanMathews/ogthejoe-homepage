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
            },
            {
                name: 'nocodb',
                url: 'https://nocodb.ogthejoe.com',
                healthEndpoint: 'https://nocodb.ogthejoe.com/',
                displayName: 'NocoDB'
            }
        ];
        
        this.init();
        this.quickLinks = [];
        this.NOCODB_PUBLIC_API = 'https://nocodb.ogthejoe.com/api/v1/db/public/shared-view/361b5c1b-2ca6-4d76-83ab-e753e50e6df8/rows';
        this.loadQuickLinks();
    }

    init() {
        this.setupSearch();
        this.checkServiceStatus();
        // Check status every 30 seconds
        setInterval(() => this.checkServiceStatus(), 30000);
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                
                // Search services
                const servicesGrid = document.getElementById('servicesGrid');
                const serviceCards = servicesGrid.querySelectorAll('.service-card');
                serviceCards.forEach(card => {
                    const serviceName = card.querySelector('p').textContent.toLowerCase();
                    const serviceDesc = card.querySelector('.text-\\[\\#a093c8\\]').textContent.toLowerCase();
                    card.style.display = (serviceName.includes(query) || serviceDesc.includes(query)) ? 'flex' : 'none';
                });
                
                // Search quick links
                const quickLinksGrid = document.getElementById('quickLinksGrid');
                const quickLinkCards = quickLinksGrid.querySelectorAll('.service-card');
                quickLinkCards.forEach(card => {
                    const linkName = card.querySelector('p').textContent.toLowerCase();
                    const linkDesc = card.querySelector('.text-\\[\\#a093c8\\]').textContent.toLowerCase();
                    card.style.display = (linkName.includes(query) || linkDesc.includes(query)) ? 'flex' : 'none';
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

    async loadQuickLinks() {
        try {
            const response = await fetch(this.NOCODB_PUBLIC_API, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            this.quickLinks = data.list
                .filter(link => link.active === 1)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                
            this.renderQuickLinks();
            
        } catch (error) {
            console.warn('Could not load quick links from NocoDB:', error);
        }
    }

    renderQuickLinks() {
        const grid = document.getElementById('quickLinksGrid');
        if (!grid) return;

        const iconsMap = {
            database: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
            
            gallery: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21,15 16,10 5,21"></polyline>',
            
            link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
            
            document: '<path d="M14,2 L6,2 C4.9,2 4,2.9 4,4 L4,20 C4,21.1 4.89,22 5.99,22 L18,22 C19.1,22 20,21.1 20,20 L20,8 L14,2 Z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline>',
            
            tool: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
            
            external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15,3 21,3 21,9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',            

            chart: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
            
            music: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
            
            code: '<polyline points="16,18 22,12 16,6"></polyline><polyline points="8,6 2,12 8,18"></polyline>',
            
            default: '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12,5 19,12 12,19"></polyline>'
        };

        grid.innerHTML = this.quickLinks.map(link => `
            <a href="${link.url}" target="_blank" class="service-card flex flex-col gap-3 pb-3 cursor-pointer">
                <div class="w-full aspect-square bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center">
                    <svg class="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        ${iconsMap[link.icon] || iconsMap.default}
                    </svg>
                </div>
                <div>
                    <p class="text-white text-base font-medium leading-normal">${link.name}</p>
                    <p class="text-[#a093c8] text-sm font-normal leading-normal">${link.description}</p>
                </div>
            </a>
        `).join('');
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
