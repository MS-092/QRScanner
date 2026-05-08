# QR Scanner Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance QR scanner with URL detection, confirmation dialogs, in-memory history, and visual feedback

**Architecture:** Zustand store for scan history, regex-based URL detection, Linking API for browser navigation, @phosphor-icons/react for icons

**Tech Stack:** expo-camera, zustand, @phosphor-icons/react, react-native Linking

---

## File Structure

- Create: `stores/scanStore.ts` - Zustand store for scan history
- Create: `components/LinkConfirmationModal.tsx` - URL confirmation dialog
- Modify: `app/(tabs)/index.tsx` - Scanner with URL detection + modal
- Modify: `app/(tabs)/history.tsx` - Pulls from Zustand store

---

## Tasks

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install zustand and @phosphor-icons/react**

Run: `npx expo install zustand @phosphor-icons/react`
Expected: Package versions resolved

---

### Task 2: Create Zustand Store

**Files:**
- Create: `stores/scanStore.ts`

- [ ] **Step 1: Create scanStore.ts**

```typescript
import { create } from 'zustand';

export interface ScanResult {
  id: string;
  data: string;
  type: 'url' | 'text';
  timestamp: number;
}

interface ScanStore {
  scans: ScanResult[];
  addScan: (data: string, type: 'url' | 'text') => void;
  removeScan: (id: string) => void;
  clearScans: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  scans: [],
  addScan: (data, type) =>
    set((state) => ({
      scans: [
        { id: Date.now().toString(), data, type, timestamp: Date.now() },
        ...state.scans,
      ],
    })),
  removeScan: (id) =>
    set((state) => ({
      scans: state.scans.filter((scan) => scan.id !== id),
    })),
  clearScans: () => set({ scans: [] }),
}));
```

- [ ] **Step 2: Commit**

Run: `git add stores/scanStore.ts && git commit -m "feat: add Zustand scan history store"`

---

### Task 3: Create LinkConfirmationModal Component

**Files:**
- Create: `components/LinkConfirmationModal.tsx`

- [ ] **Step 1: Create LinkConfirmationModal.tsx**

```typescript
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';

interface LinkConfirmationModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
}

export function LinkConfirmationModal({
  visible,
  url,
  onClose,
}: LinkConfirmationModalProps) {
  const handleOpen = async () => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
    onClose();
  };

  const getDomain = (urlString: string): string => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.hostname;
    } catch {
      return urlString;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Open Link?</Text>
          <Text style={styles.domain}>{getDomain(url)}</Text>
          <Text style={styles.url} numberOfLines={2}>
            {url}
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.openButton]}
              onPress={handleOpen}
            >
              <Text style={styles.openText}>Open Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  domain: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  url: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  openButton: {
    backgroundColor: '#007AFF',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  openText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: Commit**

Run: `git add components/LinkConfirmationModal.tsx && git commit -m "feat: add LinkConfirmationModal component"`

---

### Task 4: Update Scanner Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Write new index.tsx with URL detection and modal**

```typescript
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import { LinkConfirmationModal } from '../../components/LinkConfirmationModal';
import { useScanStore } from '../../stores/scanStore';

const isWeb = Platform.OS === 'web';

const isUrl = (text: string): boolean => {
  const urlRegex = /^https?:\/\/.+/i;
  return urlRegex.test(text.trim());
};

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const addScan = useScanStore((state) => state.addScan);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    const data = result.data;
    setLastResult(data);

    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (isUrl(data)) {
      setShowLinkModal(true);
    } else {
      addScan(data, 'text');
    }
  };

  const handleRescan = () => {
    setScanned(false);
    setLastResult(null);
  };

  const handleCopy = async () => {
    if (lastResult) {
      await Clipboard.setStringAsync(lastResult);
    }
  };

  if (isWeb) {
    return (
      <View style={styles.container}>
        <View style={styles.webMessageContainer}>
          <Text style={styles.webTitle}>QR Scanner</Text>
          <Text style={styles.webMessage}>
            This app requires a mobile device with a camera to scan QR codes.
          </Text>
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your camera permission to scan QR codes</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <Animated.View
            style={[
              styles.middleRow,
              scanned ? { transform: [{ scale: pulseAnim }] } : {},
            ]}
          >
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </Animated.View>
          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              {scanned ? 'QR Code detected!' : 'Align QR code within the frame'}
            </Text>
            {scanned && lastResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText} numberOfLines={3}>
                  {lastResult}
                </Text>
                <View style={styles.resultButtons}>
                  <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                    <Text style={styles.actionButtonText}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleRescan}
                  >
                    <Text style={styles.actionButtonText}>Scan Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </CameraView>

      <LinkConfirmationModal
        visible={showLinkModal}
        url={lastResult || ''}
        onClose={() => {
          setShowLinkModal(false);
          if (lastResult && isUrl(lastResult)) {
            addScan(lastResult, 'url');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 280,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    paddingTop: 30,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 320,
  },
  resultText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webMessageContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1a1a2e',
    margin: 20,
    borderRadius: 16,
  },
  webTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  webMessage: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Commit**

Run: `git add app/(tabs)/index.tsx && git commit -m "feat: enhance scanner with URL detection and modal"`

---

### Task 5: Update History Screen

**Files:**
- Modify: `app/(tabs)/history.tsx`

- [ ] **Step 1: Write new history.tsx**

```typescript
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useScanStore } from '../../stores/scanStore';

export default function HistoryScreen() {
  const { scans, removeScan, clearScans } = useScanStore();

  const handleCopy = async (data: string) => {
    await Clipboard.setStringAsync(data);
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: { id: string; data: string; type: 'url' | 'text'; timestamp: number } }) => (
    <View style={styles.scanItem}>
      <View style={styles.scanContent}>
        <Text style={styles.scanText} numberOfLines={2}>
          {item.data}
        </Text>
        <View style={styles.scanMeta}>
          <Text style={styles.scanType}>
            {item.type === 'url' ? 'Link' : 'Text'}
          </Text>
          <Text style={styles.scanTime}>
            {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
      <View style={styles.scanActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleCopy(item.data)}
        >
          <Text style={styles.iconText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => removeScan(item.id)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {scans.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearScans}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={scans.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Scans Yet</Text>
            <Text style={styles.emptySubtitle}>
              Scanned QR codes will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
  },
  clearButton: {
    alignSelf: 'flex-end',
    padding: 12,
  },
  clearText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  scanItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scanContent: {
    marginBottom: 12,
  },
  scanText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  scanMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  scanType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  scanTime: {
    fontSize: 12,
    color: '#888',
  },
  scanActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  iconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: Install expo-clipboard if needed**

Run: `npx expo install expo-clipboard`

- [ ] **Step 3: Commit**

Run: `git add app/(tabs)/history.tsx && git commit -m "feat: update history screen with scan list from store"`

---

### Task 6: Verify and Test

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Test in Expo Go**

Run: `npm start` and scan QR code with Expo Go
- Test URL detection and confirmation modal
- Test plain text display
- Test history persistence (in-memory)
- Test copy and delete functions

---

## Spec Coverage Check

- ✅ QR only scanning
- ✅ URL detection with confirmation dialog
- ✅ Safe browser navigation via Linking
- ✅ In-memory scan history with Zustand
- ✅ Visual success feedback (pulse animation)
- ✅ Copy and scan-again buttons
- ✅ History screen with tap-to-copy, delete
- ✅ Dark mode default