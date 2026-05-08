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