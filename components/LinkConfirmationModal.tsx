import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';

const ACCENT = '#E85A3C';
const SURFACE = '#16161A';
const SURFACE_LIGHT = '#1E1E24';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9A9AA0';

interface LinkConfirmationModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  onOpenAndAddScan?: (url: string) => void;
}

export function LinkConfirmationModal({
  visible,
  url,
  onClose,
  onOpenAndAddScan,
}: LinkConfirmationModalProps) {
  const handleOpen = async () => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        if (onOpenAndAddScan) {
          onOpenAndAddScan(url);
        }
        await Linking.openURL(url);
        onClose();
      } else {
        console.warn('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ fontSize: 18, color: TEXT_SECONDARY }}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Text style={{ fontSize: 28, color: ACCENT }}>🌐</Text>
          </View>
          
          <Text style={styles.title}>Open Link?</Text>
          <Text style={styles.domain}>{getDomain(url)}</Text>
          
          <View style={styles.urlContainer}>
            <Text style={styles.urlText} numberOfLines={2}>
              {url}
            </Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.openButton}
              onPress={handleOpen}
            >
              <Text style={{ fontSize: 18, color: TEXT_PRIMARY }}>↗</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: SURFACE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(232, 90, 60, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
    textAlign: 'center',
  },
  domain: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  urlContainer: {
    backgroundColor: SURFACE_LIGHT,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 24,
  },
  urlText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: SURFACE_LIGHT,
  },
  openButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ACCENT,
  },
  cancelText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
  openText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
});