# PWA Cache Clear Guide

## Issue: "Coming Soon" Error in Edit Herbs & Routes

### Root Cause
The Progressive Web App (PWA) was caching an old version of the application files. The Service Worker cache version was not updated, causing browsers to serve stale JavaScript files.

### Fix Applied
Updated Service Worker cache version from `v1` to `v2.1.0` in `/public/static/sw.js`

## How to Clear PWA Cache in Browser

### Method 1: Hard Refresh (Recommended)
1. Open the PWA app in your browser
2. **Chrome/Edge**: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. **Firefox**: Press `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
4. This forces the browser to reload without cache

### Method 2: Clear Service Worker Cache Manually
1. Open Developer Tools (`F12` or `Right-click > Inspect`)
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Find **Service Workers** in the left sidebar
4. Click **Unregister** next to the service worker
5. Go to **Cache Storage** in the left sidebar
6. Right-click on `ayurveda-clinic-v1` and select **Delete**
7. Refresh the page (`F5`)

### Method 3: Clear All Browser Data
1. **Chrome/Edge**: 
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Select "All time"
   - Click "Clear data"

2. **Firefox**:
   - Press `Ctrl+Shift+Delete`
   - Select "Cache"
   - Select "Everything"
   - Click "Clear Now"

### Method 4: Reinstall PWA (If Installed)
1. Open browser settings
2. Find "Apps" or "Installed Apps"
3. Find "TPS DHANVANTARI AYURVEDA"
4. Click "Uninstall"
5. Visit the app URL again
6. Click "Install" when prompted

## Verification
After clearing cache:
1. Open the app
2. Go to **Herbs & Routes**
3. Click the **Edit** button (pencil icon)
4. You should see the edit form open correctly
5. No "Coming Soon" message should appear

## Service Worker Cache Versioning
The app now uses version `v2.1.0` for the cache. Future updates will increment this version automatically to prevent cache issues.

## Current App URLs
- **Sandbox Development**: https://3000-ickijva4njj2u5hky0gzf-b9b802c4.sandbox.novita.ai
- **Production**: https://tpsdhanvantariayurveda.com

## Notes
- The Service Worker caches files for offline use
- When code is updated, the cache version must be incremented
- Users need to hard refresh or clear cache to see updates
- The new Service Worker will automatically update in the background after 24 hours
