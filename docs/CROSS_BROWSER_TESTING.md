# Cross-Browser Testing Guide

This document outlines the cross-browser testing setup and procedures for the Stock Dashboard v2 application.

## Supported Browsers

### Desktop Browsers
- **Chrome** 90+ (Chromium-based)
- **Firefox** 88+
- **Safari** 14+ (WebKit-based)
- **Microsoft Edge** 90+ (Chromium-based)

### Mobile Browsers
- **Mobile Chrome** (Android)
- **Mobile Safari** (iOS)

### Screen Sizes Tested
- **Mobile Small**: 375x667px (iPhone SE)
- **Mobile Large**: 414x896px (iPhone 11 Pro)
- **Tablet Portrait**: 768x1024px (iPad)
- **Tablet Landscape**: 1024x768px (iPad Landscape)
- **Desktop Small**: 1280x720px
- **Desktop Large**: 1920x1080px

## Testing Infrastructure

### Playwright Configuration
- **Framework**: Playwright Test Runner
- **Configuration**: `playwright.config.ts`
- **Test Directory**: `e2e/`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Devices**: Pixel 5, iPhone 12

### Test Suites

#### 1. Cross-Browser Compatibility (`e2e/cross-browser-compatibility.spec.ts`)
Tests core functionality across different browsers:
- Application loading and initialization
- Authentication form display
- Responsive layout adaptation
- Keyboard navigation support
- Browser-specific functionality

#### 2. Responsive Design (`e2e/responsive-design.spec.ts`)
Validates responsive behavior across viewports:
- Multiple viewport sizes (375px to 1920px)
- Touch target size validation (minimum 44px)
- Content overflow prevention
- Orientation change handling
- Zoom level support (up to 200%)

#### 3. Feature Detection (`e2e/feature-detection.spec.ts`)
Tests progressive enhancement and feature detection:
- Modern JavaScript feature support
- CSS feature detection (Flexbox, Grid, Custom Properties)
- Accessibility feature support
- Network condition handling
- Graceful degradation for missing features

## Running Tests

### All E2E Tests
```bash
npm run test:e2e
```

### Cross-Browser Tests (Chrome, Firefox, Safari)
```bash
npm run test:cross-browser
```

### Mobile Device Tests
```bash
npm run test:mobile
```

### Specific Test Suites
```bash
# Responsive design only
npm run test:responsive

# Feature detection only
npm run test:features

# Compatibility tests only
npm run test:compatibility
```

### Debug Mode
```bash
# Interactive UI
npm run test:e2e:ui

# Step-by-step debugging
npm run test:e2e:debug

# Headed mode (visible browser)
npm run test:e2e:headed
```

## Browser Feature Support

### Essential Features (Must Support)
- **DOM**: querySelector, classList, dataset
- **JavaScript**: Promises, Fetch API, Arrow functions
- **CSS**: Flexbox, Basic transitions
- **Storage**: localStorage (with fallback)

### Enhanced Features (Progressive Enhancement)
- **CSS**: Grid layout, Custom properties, backdrop-filter
- **JavaScript**: Async/await, Service Workers
- **Interaction**: Touch events, Pointer events
- **Media**: WebP images, High DPI displays

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and roles
- **High Contrast**: Windows high contrast mode
- **Reduced Motion**: Respects prefers-reduced-motion
- **Touch Targets**: Minimum 44px touch targets

## Progressive Enhancement Strategy

### 1. Base Layer (All Browsers)
- Semantic HTML structure
- Basic CSS layout with Flexbox
- Form submission functionality
- Essential JavaScript functionality

### 2. Enhanced Layer (Modern Browsers)
- CSS Grid layouts where supported
- Advanced animations and transitions
- Modern JavaScript features (async/await)
- Enhanced user interactions

### 3. Premium Layer (Latest Browsers)
- Advanced CSS features (backdrop-filter)
- Service Worker functionality
- Progressive Web App features
- Latest ECMAScript features

## Common Issues and Solutions

### Safari-Specific
- **Issue**: Backdrop-filter support
- **Solution**: Provide fallback with reduced opacity

### Firefox-Specific
- **Issue**: Some CSS custom property edge cases
- **Solution**: Use PostCSS for better compatibility

### Mobile Safari
- **Issue**: Viewport height on mobile
- **Solution**: Use `vh` units with JavaScript fallback

### Internet Explorer (Legacy)
- **Status**: Not officially supported
- **Fallback**: Basic functionality only with polyfills

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

### Local Testing Commands
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm run test:all
```

## Performance Considerations

### Cross-Browser Performance
- Monitor bundle size across browsers
- Test loading times on different devices
- Validate memory usage patterns
- Check for browser-specific performance issues

### Responsive Performance
- Test scroll performance on mobile
- Validate touch response times
- Monitor reflow/repaint operations
- Check animation frame rates

## Debugging Tools

### Playwright Tools
- **Playwright Inspector**: Step-by-step debugging
- **Trace Viewer**: Visual test execution traces
- **Test Generator**: Record user interactions

### Browser DevTools
- **Chrome DevTools**: Performance, network, lighthouse
- **Firefox DevTools**: Responsive design mode
- **Safari Web Inspector**: iOS device testing

## Maintenance

### Regular Testing Schedule
- **Pre-release**: Full cross-browser test suite
- **Weekly**: Mobile responsiveness checks
- **Monthly**: Performance regression testing
- **Quarterly**: Browser compatibility updates

### Browser Version Updates
- Monitor browser release schedules
- Update supported browser versions annually
- Test new browser features for adoption
- Deprecate legacy browser support as needed

## Reporting Issues

When reporting cross-browser issues, include:
1. Browser name and version
2. Operating system
3. Screen resolution
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots or videos if applicable