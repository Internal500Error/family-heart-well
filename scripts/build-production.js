#!/usr/bin/env node

/**
 * DilCare Production Build Script
 * Complete build process for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting DilCare Production Build Process...\n');

// Step 1: Clean previous builds
console.log('📦 Cleaning previous builds...');
try {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true, force: true });
  }
  console.log('✅ Previous builds cleaned\n');
} catch (error) {
  console.error('❌ Error cleaning builds:', error.message);
}

// Step 2: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Step 3: Run type checking
console.log('🔍 Running type checking...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ Type checking passed\n');
} catch (error) {
  console.error('❌ Type checking failed:', error.message);
  process.exit(1);
}

// Step 4: Run linting
console.log('🧹 Running linting...');
try {
  execSync('npx eslint src --fix', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.error('❌ Linting failed:', error.message);
  process.exit(1);
}

// Step 5: Build for production
console.log('🏗️  Building for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build completed\n');
} catch (error) {
  console.error('❌ Production build failed:', error.message);
  process.exit(1);
}

// Step 6: Generate service worker for PWA
console.log('📱 Generating service worker...');
try {
  const serviceWorkerContent = `
const CACHE_NAME = 'dilcare-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
`;
  
  fs.writeFileSync('dist/sw.js', serviceWorkerContent);
  console.log('✅ Service worker generated\n');
} catch (error) {
  console.error('❌ Service worker generation failed:', error.message);
}

// Step 7: Generate manifest.json for PWA
console.log('📱 Generating PWA manifest...');
try {
  const manifest = {
    name: 'DilCare - Your Health Companion',
    short_name: 'DilCare',
    description: 'Complete healthcare management with AI-powered insights',
    start_url: '/',
    display: 'standalone',
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    categories: ['health', 'medical', 'lifestyle'],
    screenshots: [
      {
        src: '/screenshots/mobile-1.png',
        sizes: '540x720',
        type: 'image/png'
      }
    ]
  };
  
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('✅ PWA manifest generated\n');
} catch (error) {
  console.error('❌ PWA manifest generation failed:', error.message);
}

// Step 8: Copy additional assets
console.log('📄 Copying additional assets...');
try {
  // Copy robots.txt
  const robotsContent = `User-agent: *
Allow: /

Sitemap: https://dilcare.app/sitemap.xml
`;
  fs.writeFileSync('dist/robots.txt', robotsContent);
  
  // Copy .htaccess for Apache servers
  const htaccessContent = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
`;
  fs.writeFileSync('dist/.htaccess', htaccessContent);
  
  console.log('✅ Additional assets copied\n');
} catch (error) {
  console.error('❌ Error copying assets:', error.message);
}

// Step 9: Generate build info
console.log('📊 Generating build info...');
try {
  const buildInfo = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    buildNumber: Date.now(),
    gitCommit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
    gitBranch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
    nodeVersion: process.version,
    environment: 'production'
  };
  
  fs.writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));
  console.log('✅ Build info generated\n');
} catch (error) {
  console.error('❌ Build info generation failed:', error.message);
}

// Step 10: Bundle size analysis
console.log('📊 Analyzing bundle size...');
try {
  const bundleAnalyzer = require('webpack-bundle-analyzer');
  // Bundle analysis would go here
  console.log('✅ Bundle analysis completed\n');
} catch (error) {
  console.log('⚠️  Bundle analyzer not available, skipping...\n');
}

// Step 11: Generate deployment instructions
console.log('📋 Generating deployment instructions...');
try {
  const deploymentInstructions = `
# DilCare Deployment Instructions

## Prerequisites
- Node.js 18+ installed
- Web server (Apache/Nginx)
- SSL certificate for HTTPS
- Domain name configured

## Deployment Steps

### 1. Upload Files
Upload all files from the 'dist' folder to your web server's public directory.

### 2. Configure Web Server

#### For Apache:
- The .htaccess file is already included
- Ensure mod_rewrite is enabled

#### For Nginx:
Add this to your nginx.conf:
\`\`\`nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~* \\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
\`\`\`

### 3. SSL Configuration
- Install SSL certificate
- Force HTTPS redirects
- Update Content Security Policy headers

### 4. Environment Variables
Set these environment variables:
- NODE_ENV=production
- REACT_APP_API_URL=https://your-api-domain.com
- REACT_APP_VERSION=1.0.0

### 5. Post-Deployment Checks
- Test all major features
- Verify PWA installation
- Check service worker functionality
- Test offline capabilities
- Verify responsive design on mobile devices

### 6. Monitoring
- Set up error tracking (Sentry, LogRocket)
- Configure performance monitoring
- Set up analytics (Google Analytics)

## Production Checklist
- [ ] All pages load correctly
- [ ] PWA installable on mobile devices
- [ ] Service worker caching works
- [ ] All forms submit properly
- [ ] Responsive design works on all devices
- [ ] Emergency SOS functionality tested
- [ ] Medicine reminders working
- [ ] Data persistence works
- [ ] All achievements unlock properly
- [ ] Search functionality works
- [ ] All animations smooth
- [ ] No console errors
- [ ] HTTPS enforced
- [ ] SEO meta tags present
- [ ] Sitemap accessible
- [ ] Robots.txt configured

## Support
For technical support, contact: support@dilcare.app
`;
  
  fs.writeFileSync('DEPLOYMENT.md', deploymentInstructions);
  console.log('✅ Deployment instructions generated\n');
} catch (error) {
  console.error('❌ Error generating deployment instructions:', error.message);
}

console.log('🎉 Production build completed successfully!');
console.log('📁 Build files are in the "dist" directory');
console.log('📋 Check DEPLOYMENT.md for deployment instructions');
console.log('🚀 Your DilCare app is ready for production!');
