# QR Scanner Enhancement Design

**Date:** 2026-05-08
**Status:** Approved

## 1. Overview

Enhance the existing Expo Router tabs-based QR scanner app with:
- Smart URL detection with confirmation dialog
- Safe browser navigation
- In-memory scan history
- Visual success feedback

## 2. Constraints

- QR codes only (no EAN, UPC, etc.)
- Confirmation dialog for URL links
- In-memory history (no persistence)
- Zustand for state management
- @phosphor-icons/react for icons
- Dark mode default, light mode supported

## 3. Architecture

### State Management
```typescript
// stores/scanStore.ts
interface ScanResult {
  id: string;
  data: string;
  type: 'url' | 'text';
  timestamp: number;
}
```

### URL Detection
```typescript
const isUrl = (text: string): boolean => {
  const urlRegex = /^https?:\/\/.+/i;
  return urlRegex.test(text.trim());
};
```

## 4. Component Changes

### Scanner Screen (index.tsx)
- Camera preview with scan frame overlay
- `handleBarCodeScanned` checks URL, shows appropriate UI
- Success feedback: green pulse animation
- Result overlay with copy + scan again buttons
- Link confirmation modal for URLs

### History Screen (history.tsx)
- Pulls from Zustand scanStore
- Empty state when no scans
- Tap to copy, swipe to delete

### Settings Screen (settings.tsx)
- Dark mode toggle (existing)

## 5. Implementation Order

1. Install dependencies (zustand, @phosphor-icons/react)
2. Create Zustand store for scan history
3. Create LinkConfirmationModal component
4. Update Scanner screen with URL detection + modal
5. Update History screen to use store
6. Add success feedback animation
7. Test and verify