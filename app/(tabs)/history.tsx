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