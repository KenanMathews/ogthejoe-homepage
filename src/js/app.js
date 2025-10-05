// Hybrid Loading Homepage - Priority services load instantly, then update from n8n
class OgTheJoeHomepage {
    constructor() {
        // n8n webhook endpoint
        this.n8nEndpoint = 'https://n8n.ogthejoe.com/webhook/coolify-services';

        // Priority services - Load instantly (0ms perceived load)
        this.priorityServices = [
            {
                displayName: 'File Sharing',
                icon: 'description',
                description: 'Self-hosted file sharing with uploads and transfers.',
                url: 'https://copyparty.ogthejoe.com',
                gradient: 'from-blue-500 to-purple-600',
                status: 'checking'
            },
            {
                displayName: 'Element Chat',
                icon: 'chat',
                description: 'Secure Matrix chat with end-to-end encryption.',
                url: 'http://chat.ogthejoe.com',
                gradient: 'from-cyan-500 to-blue-600',
                status: 'checking'
            },
            {
                displayName: 'Matrix Chat',
                icon: 'chat',
                description: 'Decentralized secure messaging server.',
                url: 'http://matrix.ogthejoe.com',
                gradient: 'from-cyan-500 to-blue-600',
                status: 'checking'
            },
            {
                displayName: 'Home Assistant',
                icon: 'home',
                description: 'Smart home automation and device control.',
                url: 'https://homeassistant.ogthejoe.com',
                gradient: 'from-teal-500 to-cyan-600',
                status: 'checking'
            },
            {
                displayName: 'Coolify',
                icon: 'dns',
                description: 'Self-hosted server management platform.',
                url: 'https://coolify.ogthejoe.com',
                gradient: 'from-purple-500 to-pink-600',
                status: 'checking'
            }
        ];

        // Icon mapping for dynamic services
        this.iconMap = {
            'ai': 'smart_toy',
            'files': 'description',
            'editor': 'edit',
            'compiler': 'settings',
            'server': 'dns',
            'chat': 'chat',
            'media': 'photo_library',
            'git': 'code',
            'analytics': 'bar_chart',
            'database': 'storage',
            'game': 'sports_esports',
            'default': 'cloud'
        };

        this.gradientMap = {
            'ai': 'from-pink-500 to-purple-600',
            'files': 'from-blue-500 to-purple-600',
            'editor': 'from-green-500 to-teal-600',
            'compiler': 'from-orange-500 to-red-600',
            'server': 'from-purple-500 to-pink-600',
            'chat': 'from-cyan-500 to-blue-600',
            'media': 'from-rose-500 to-pink-600',
            'git': 'from-teal-500 to-cyan-600',
            'analytics': 'from-amber-500 to-orange-600',
            'database': 'from-indigo-500 to-purple-600',
            'game': 'from-yellow-500 to-amber-600',
            'default': 'from-gray-600 to-gray-800'
        };

        this.services = this.priorityServices; // Start with priority services
        this.init();
    }

    async init() {
        // Phase 1: Render priority services immediately (0ms)
        this.renderServices(this.priorityServices);
        this.setupSearch();
        this.setupSmoothScrolling();

        // Phase 2: Load dynamic services in background (non-blocking)
        await this.loadDynamicServices();
    }

    async loadDynamicServices() {
        try {
            const response = await fetch(this.n8nEndpoint);

            if (response.ok) {
                const liveServices = await response.json();

                // Transform n8n data to our format
                const transformedServices = liveServices.map(service => this.transformService(service));

                // Seamlessly update with live data
                this.updateServices(transformedServices);

                console.log(`✅ Loaded ${transformedServices.length} services from n8n`);
            } else {
                console.warn('❌ n8n webhook failed, using priority services');
            }
        } catch (error) {
            console.warn('❌ Failed to load dynamic services, using priority services:', error);
        }
    }

    transformService(service) {
        const icon = this.iconMap[service.icon] || this.iconMap['default'];
        const gradient = this.gradientMap[service.icon] || this.gradientMap['default'];

        // Parse status
        const [state, health] = service.status.split(':');
        let statusBadge = '';

        if (state === 'running' && health === 'healthy') {
            statusBadge = '<span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"><span class="material-symbols-outlined text-xs">check_circle</span>Healthy</span>';
        } else if (state === 'running' && health === 'unhealthy') {
            statusBadge = '<span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/50"><span class="material-symbols-outlined text-xs">warning</span>Unhealthy</span>';
        } else if (state === 'stopped') {
            statusBadge = '<span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 border border-red-500/50"><span class="material-symbols-outlined text-xs">stop_circle</span>Stopped</span>';
        }

        return {
            displayName: service.displayName || service.name,
            icon: icon,
            description: service.description || 'No description',
            url: service.url,
            gradient: gradient,
            statusBadge: statusBadge
        };
    }

    updateServices(newServices) {
        this.services = newServices;

        // Fade out old cards
        const grid = document.getElementById('servicesGrid');
        const cards = grid.querySelectorAll('.service-card-wrapper');

        cards.forEach(card => card.classList.add('fade-out'));

        // Wait for fade animation
        setTimeout(() => {
            // Render new services
            this.renderServices(newServices);

            // Fade in new cards
            requestAnimationFrame(() => {
                const newCards = grid.querySelectorAll('.service-card-wrapper');
                newCards.forEach(card => card.classList.add('fade-in'));
            });

            // Update last checked timestamp
            this.updateLastChecked();
        }, 300);
    }

    renderServices(services) {
        const servicesGrid = document.getElementById('servicesGrid');
        if (!servicesGrid) return;

        servicesGrid.innerHTML = '';

        services.forEach(service => {
            // Create wrapper for transition
            const wrapper = document.createElement('div');
            wrapper.className = 'service-card-wrapper';

            const serviceCard = document.createElement('a');
            serviceCard.href = service.url;
            serviceCard.target = '_blank';
            serviceCard.className = 'service-card flex flex-col p-6 rounded-xl group';

            serviceCard.innerHTML = `
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-3xl text-white">${service.icon}</span>
                    </div>
                    <div class="flex-grow min-w-0">
                        <h3 class="text-lg font-bold mb-2 truncate">${service.displayName}</h3>
                        ${service.statusBadge || ''}
                    </div>
                </div>
                <p class="text-[#a093c8] text-sm line-clamp-2">${service.description}</p>
            `;

            wrapper.appendChild(serviceCard);
            servicesGrid.appendChild(wrapper);
        });
    }

    updateLastChecked() {
        const lastCheckedElement = document.getElementById('lastChecked');
        if (lastCheckedElement) {
            const now = new Date().toLocaleString();
            lastCheckedElement.textContent = `Last updated: ${now} • ${this.services.length} services loaded`;
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const servicesGrid = document.getElementById('servicesGrid');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const wrappers = servicesGrid.querySelectorAll('.service-card-wrapper');

                wrappers.forEach(wrapper => {
                    const card = wrapper.querySelector('.service-card');
                    const serviceName = card.querySelector('h3').textContent.toLowerCase();
                    const serviceDesc = card.querySelector('p').textContent.toLowerCase();

                    if (serviceName.includes(query) || serviceDesc.includes(query)) {
                        wrapper.style.display = 'block';
                    } else {
                        wrapper.style.display = 'none';
                    }
                });
            });
        }
    }

    setupSmoothScrolling() {
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ogTheJoeHomepage = new OgTheJoeHomepage();
    console.log('🚀 OgTheJoe Homepage initialized with hybrid loading');
});

// Handle service card clicks
document.addEventListener('click', (e) => {
    const serviceCard = e.target.closest('.service-card');
    if (serviceCard) {
        const serviceName = serviceCard.querySelector('h3')?.textContent?.trim();
        if (serviceName) {
            console.log(`Service accessed: ${serviceName}`);
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
