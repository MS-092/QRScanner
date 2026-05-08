import React, { useState, useRef } from 'react';
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

const ACCENT = '#E85A3C';
const SURFACE = '#16161A';
const SURFACE_LIGHT = '#1E1E24';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9A9AA0';

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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const addScan = useScanStore((state) => state.addScan);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    const data = result.data;

    // Input length validation - prevent memory issues from oversized QR data
    if (data.length > 4296) {
      console.warn('QR data exceeds maximum length');
      return;
    }

    setScanned(true);
    setLastResult(data);

    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
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
        <View style={styles.webContainer}>
          <View style={styles.webIcon}>
            <Text style={{ fontSize: 40, color: ACCENT }}>⌘</Text>
          </View>
          <Text style={styles.webTitle}>QR Scanner</Text>
          <Text style={styles.webMessage}>
            This app requires a mobile device with a camera to scan QR codes.
          </Text>
          <Text style={styles.webHint}>Open on your iPhone or Android with Expo Go</Text>
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Text style={{ fontSize: 24, color: ACCENT }}>⌘</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            We need your camera permission to scan QR codes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
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
          <View style={styles.topOverlay}>
            {!scanned && (
              <View style={styles.instructionBadge}>
                <Text style={styles.instructionBadgeText}>Position QR code in frame</Text>
              </View>
            )}
          </View>
          
          <Animated.View style={[styles.middleRow, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={styles.scanCornerTopLeft} />
              <View style={styles.scanCornerTopRight} />
              <View style={styles.scanCornerBottomLeft} />
              <View style={styles.scanCornerBottomRight} />
              {scanned && (
                <View style={styles.scanSuccessIndicator}>
                  <View style={styles.successDot} />
                </View>
              )}
            </View>
            <View style={styles.sideOverlay} />
          </Animated.View>

          <View style={styles.bottomOverlay}>
            {scanned && lastResult ? (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  {isUrl(lastResult) ? (
                    <Text style={{ fontSize: 16, color: ACCENT }}>🔗</Text>
                  ) : null}
                  <Text style={styles.resultLabel} numberOfLines={1}>
                    {lastResult}
                  </Text>
                </View>
                <View style={styles.resultActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                    <Text style={{ fontSize: 18, color: TEXT_SECONDARY }}>⎘</Text>
                    <Text style={styles.actionBtnText}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnPrimary]} 
                    onPress={handleRescan}
                  >
                    <Text style={{ fontSize: 18, color: TEXT_PRIMARY }}>↻</Text>
                    <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Scan Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.scanHint}>
                <View style={styles.scanHintDot} />
                <Text style={styles.scanHintText}>Align QR code within frame</Text>
              </View>
            )}
          </View>
        </View>
      </CameraView>

      <LinkConfirmationModal
        visible={showLinkModal}
        url={lastResult || ''}
        onClose={() => setShowLinkModal(false)}
        onOpenAndAddScan={(url) => addScan(url, 'url')}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  instructionBadge: {
    backgroundColor: 'rgba(232, 90, 60, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 90, 60, 0.3)',
  },
  instructionBadgeText: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '500',
  },
  middleRow: {
    flexDirection: 'row',
    height: 260,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scanArea: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  scanCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: ACCENT,
    borderTopLeftRadius: 12,
  },
  scanCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: ACCENT,
    borderTopRightRadius: 12,
  },
  scanCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: ACCENT,
    borderBottomLeftRadius: 12,
  },
  scanCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: ACCENT,
    borderBottomRightRadius: 12,
  },
  scanSuccessIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  successDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  resultCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultLabel: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 10,
  },
  actionBtnPrimary: {
    backgroundColor: ACCENT,
  },
  actionBtnText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnTextPrimary: {
    color: TEXT_PRIMARY,
  },
  scanHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  scanHintText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  webTitle: {
    color: TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  webMessage: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  webHint: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '500',
  },
});