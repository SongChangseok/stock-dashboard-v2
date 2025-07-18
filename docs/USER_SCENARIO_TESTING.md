# User Scenario Testing Guide

This document outlines the comprehensive user scenario testing implementation for the Stock Dashboard v2 application, covering complete user journeys, error scenarios, performance testing, and accessibility validation.

## Overview

User scenario testing validates real-world usage patterns and ensures the application works reliably across different user contexts, technical conditions, and accessibility requirements.

## Test Categories

### 1. Complete User Journeys (`e2e/user-journey.spec.ts`)

Tests end-to-end workflows that represent typical user interactions:

#### Primary User Journey
**Authentication → Portfolio Creation → Target Portfolio → Rebalancing**

1. **User Authentication**
   - Sign up with new account
   - Login with existing credentials
   - Redirect to dashboard after successful auth

2. **Portfolio Creation**
   - Add multiple stocks with different data
   - Verify portfolio summary calculations
   - Test real-time value updates

3. **Target Portfolio Management**
   - Navigate to target portfolio page
   - Create target portfolio with allocations
   - Verify weight distribution validation

4. **Portfolio Analysis**
   - Compare current vs target portfolios
   - Use rebalancing calculator
   - Review trading recommendations

#### Alternative User Journeys
- **Portfolio Editing**: Modify existing stocks and target portfolios
- **Quick Onboarding**: Minimal viable user journey for new users
- **Portfolio Duplication**: Clone and modify existing target portfolios

### 2. Error Scenarios (`e2e/error-scenarios.spec.ts`)

Tests application resilience under various failure conditions:

#### Network Failure Scenarios
- **Complete Network Failure**: Handle offline state gracefully
- **Slow Network Connections**: Show appropriate loading states
- **API Timeouts**: Display timeout messages and retry options
- **Intermittent Failures**: Handle unreliable network conditions

#### Invalid Input Scenarios
- **Form Validation**: Test empty, invalid, and edge case inputs
- **Special Characters**: Handle XSS attempts and international text
- **Target Portfolio Validation**: Ensure allocation weights sum to 100%

#### Edge Case Scenarios
- **Empty Portfolio States**: Handle users with no stocks
- **Large Portfolios**: Test performance with many stocks
- **Concurrent Actions**: Handle multiple simultaneous user actions
- **Browser Navigation**: Test back/forward and refresh scenarios
- **Storage Failures**: Handle localStorage/sessionStorage issues

#### Authentication Errors
- **Invalid Credentials**: Show appropriate login error messages
- **Session Expiration**: Handle expired authentication gracefully

#### Data Consistency Edge Cases
- **Corrupted Local Data**: Handle malformed localStorage data
- **Decimal Precision**: Test financial calculations with edge values

### 3. Performance Scenarios (`e2e/performance-scenarios.spec.ts`)

Tests application performance under load and various conditions:

#### Large Portfolio Performance
- **50+ Stocks**: Test rendering and calculation performance
- **Scroll Performance**: Ensure smooth scrolling with large lists
- **Large Target Portfolios**: Handle complex allocation scenarios

#### Slow Connection Simulation
- **3G Connection**: Test functionality on slower networks (1.6Mbps down)
- **2G Connection**: Verify graceful degradation (256kbps down)
- **Intermittent Slow Connections**: Handle variable network speeds

#### Memory and CPU Performance
- **Memory Leak Testing**: Monitor extended usage patterns
- **Rapid Interactions**: Test performance under fast user actions
- **Complex Chart Rendering**: Measure chart performance with many data points

#### Real-world Performance
- **Peak Usage Simulation**: Test concurrent operations
- **Extended Sessions**: Validate performance during long usage

### 4. Accessibility Scenarios (`e2e/accessibility-scenarios.spec.ts`)

Tests compliance with accessibility standards and inclusive design:

#### Keyboard-Only Navigation
- **Complete App Navigation**: Navigate entire app using only keyboard
- **Button and Form Activation**: Use Enter/Space keys for interactions
- **Page Navigation**: Test keyboard-based link navigation
- **Modal Dialog Handling**: Test focus trapping and escape key

#### Screen Reader Compatibility
- **Heading Structure**: Verify proper H1-H6 hierarchy
- **ARIA Labels and Roles**: Test semantic markup and landmarks
- **Error Messages**: Ensure meaningful, announced error messages
- **Dynamic Content**: Test live regions for content changes

#### Visual Accessibility
- **High Contrast Mode**: Test Windows high contrast mode compatibility
- **Reduced Motion**: Respect prefers-reduced-motion settings
- **Color Contrast**: Verify sufficient text/background contrast

#### Alternative Input Methods
- **Touch Devices**: Test touch targets and mobile interactions
- **Voice Control**: Ensure accessible names for voice commands

## Running Tests

### Individual Test Suites
```bash
# Complete user journeys
npm run test:user-journey

# Error scenarios
npm run test:error-scenarios

# Performance testing
npm run test:performance

# Accessibility testing
npm run test:accessibility
```

### Combined Scenario Testing
```bash
# Run all user scenario tests
npm run test:scenarios

# All E2E tests including scenarios
npm run test:e2e
```

### Debug and Development
```bash
# Interactive UI for debugging
npm run test:e2e:ui

# Headed mode for visual testing
npm run test:e2e:headed

# Step-by-step debugging
npm run test:e2e:debug
```

## Test Data and Setup

### Test User Credentials
- **Email**: test@example.com
- **Password**: TestPassword123!

### Sample Stock Data
- **Apple Inc. (AAPL)**: 10 shares, $150 → $180
- **Microsoft Corp. (MSFT)**: 5 shares, $300 → $350
- **Google Inc. (GOOGL)**: 3 shares, $2500 → $2800

### Target Portfolio Example
- **Name**: Conservative Growth
- **Allocations**: Apple 40%, Microsoft 35%, Google 25%

## Performance Benchmarks

### Loading Time Targets
- **Initial Page Load**: < 3 seconds on 3G
- **Chart Rendering**: < 5 seconds with 20+ stocks
- **Form Submission**: < 2 seconds response time
- **Navigation**: < 1 second between pages

### Accessibility Compliance
- **WCAG 2.1 AA**: All tests designed to validate AA compliance
- **Touch Targets**: Minimum 44px touch target size
- **Color Contrast**: 4.5:1 ratio for normal text
- **Keyboard Navigation**: 100% keyboard accessible

## Error Handling Standards

### Network Errors
- Show user-friendly error messages
- Provide retry mechanisms
- Maintain app state during failures
- Display offline indicators when appropriate

### Input Validation
- Real-time validation feedback
- Clear error messages
- Prevent form submission with invalid data
- Preserve user input during validation

### Graceful Degradation
- Core functionality works without JavaScript enhancements
- Progressive enhancement for advanced features
- Fallbacks for missing browser features
- Accessible alternatives for interactive elements

## Continuous Integration

### GitHub Actions Integration
```yaml
- name: Run User Scenario Tests
  run: npm run test:scenarios

- name: Upload Test Results
  uses: actions/upload-artifact@v4
  with:
    name: scenario-test-results
    path: playwright-report/
```

### Test Reporting
- **HTML Reports**: Visual test execution reports
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed scenarios
- **Performance Metrics**: Logged timing data

## Maintenance and Updates

### Regular Testing Schedule
- **Pre-release**: Full scenario test suite
- **Weekly**: Critical user journey tests
- **Monthly**: Performance regression testing
- **Quarterly**: Accessibility compliance review

### Test Data Management
- Use consistent test data across scenarios
- Clean up test data after test runs
- Mock external dependencies appropriately
- Maintain test environment parity with production

### Scenario Updates
- Add new scenarios for new features
- Update existing scenarios for UI changes
- Remove obsolete test cases
- Maintain test documentation

## Troubleshooting

### Common Issues
1. **Test Timeouts**: Increase timeout values for slow operations
2. **Flaky Tests**: Add appropriate waits for dynamic content
3. **Element Not Found**: Use more robust selectors
4. **Authentication Issues**: Verify test user credentials

### Performance Issues
1. **Slow Test Execution**: Reduce concurrent operations
2. **Memory Issues**: Clear test data between runs
3. **Network Simulation**: Adjust connection parameters
4. **Chart Rendering**: Wait for animation completion

### Accessibility Issues
1. **Focus Issues**: Verify focus management in modals
2. **Screen Reader**: Test with actual assistive technology
3. **Color Contrast**: Use automated contrast checking tools
4. **Keyboard Navigation**: Test all interactive elements

## Best Practices

### Test Design
- Write tests from user perspective
- Use realistic test data
- Test both happy path and edge cases
- Include error recovery scenarios

### Performance Testing
- Monitor resource usage
- Test on various device specifications
- Simulate real network conditions
- Measure user-perceived performance

### Accessibility Testing
- Include users with disabilities in testing
- Test with actual assistive technologies
- Follow WCAG guidelines strictly
- Consider cognitive accessibility

### Maintenance
- Keep tests up to date with UI changes
- Regularly review test effectiveness
- Update test data and scenarios
- Monitor test execution metrics