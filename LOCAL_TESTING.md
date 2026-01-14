# Local Testing Guide

## Issue Fixed: Chrome CORS Error

The game was crashing in Chrome when opened locally because Chrome blocks `fetch()` requests when loading files via the `file://` protocol (CORS security restriction).

## Solution Implemented

The game engine now includes **embedded configuration files** that work both:
- ✅ **Locally** (file:// protocol) - Uses embedded configs
- ✅ **GitHub Pages** (http:// protocol) - Uses fetch() to load config files

## How to Test Locally

### Option 1: Direct File Opening (Now Works!)
Simply open `index.html` in Chrome:
```
Double-click index.html or drag it into Chrome
```

The game will now work because configs are embedded in the JavaScript file.

### Option 2: Local Web Server (Recommended for Development)

For better development experience, use a local web server:

#### Using Python (if installed):
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open: `http://localhost:8000`

#### Using Node.js (if installed):
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server
```
Then open: `http://localhost:8080`

#### Using PHP (if installed):
```bash
php -S localhost:8000
```
Then open: `http://localhost:8000`

#### Using VS Code:
1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## What Changed

1. **Embedded Configs**: All JSON config files are now embedded in `js/game-engine.js`
2. **Smart Fallback**: The engine tries to fetch configs first (for GitHub Pages), then falls back to embedded configs (for local file://)
3. **Better Error Handling**: Added loading messages and better error reporting

## Troubleshooting

If the game still doesn't load:
1. Open Chrome DevTools (F12)
2. Check the Console tab for errors
3. Check the Network tab to see if files are loading
4. Make sure all files are in the correct directory structure

## File Structure
```
/
├── index.html
├── js/
│   ├── game-engine.js (contains embedded configs)
│   └── game.js
├── config/ (optional - used on GitHub Pages)
│   ├── game-config.json
│   ├── biodiversity-config.json
│   ├── industry-config.json
│   ├── research-config.json
│   └── policy-config.json
└── css/
    └── styles.css
```
