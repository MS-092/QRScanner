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
        }}
        onOpenAndAddScan={(url) => {
          addScan(url, 'url');
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