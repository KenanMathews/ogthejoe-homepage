# OgTheJoe Homepage

Modern, responsive homepage for showcasing self-hosted services on Raspberry Pi.

## Features

- **Service Status Monitoring**: Real-time health checks for all services
- **Modern Design**: Dark theme with glassmorphism effects  
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Search Functionality**: Filter services by name or description
- **Docker Ready**: Containerized with nginx for fast serving

## Services

- **File Sharing** (`copyparty.ogthejoe.com`) - Secure file sharing with bandwidth management
- **VN Story Editor** (`story-editor.ogthejoe.com`) - Visual novel script editor
- **VN Compiler API** (`vn-compiler.ogthejoe.com`) - Remote compilation API
- **Server Management** (`coolify.ogthejoe.com`) - Docker container management

## Development

```bash
# Serve locally for development
python -m http.server 8000 -d src/

# Or with live reload
npx live-server src/
```

## Deployment

```bash
# Build Docker image
docker build -t ogthejoe-homepage .

# Run container
docker run -d -p 3000:80 --name homepage ogthejoe-homepage
```

## Structure

```
├── src/
│   ├── index.html          # Main homepage
│   └── js/
│       └── app.js          # JavaScript functionality
├── nginx.conf              # Nginx configuration
├── Dockerfile              # Container definition
└── README.md
```

## Deployment with Coolify

1. Connect repository to Coolify
2. Set deployment branch to `main`
3. Configure port `3000` → `80`
4. Domain: `ogthejoe.com`
5. Deploy!

## Customization

- Edit `src/index.html` for layout changes
- Modify `src/js/app.js` for functionality
- Update service URLs in the JavaScript services array
- Add new services by adding cards to the grid
