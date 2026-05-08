import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ClockCounterClockwise, Copy, Trash, Link as LinkIcon, TextT } from '@phosphor-icons/react';
import { useScanStore } from '../../stores/scanStore';

const ACCENT = '#E85A3C';
const SURFACE = '#16161A';
const SURFACE_LIGHT = '#1E1E24';
const BORDER = '#2A2A30';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9A9AA0';

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

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }: { item: { id: string; data: string; type: 'url' | 'text'; timestamp: number } }) => (
    <Pressable
      style={({ pressed }) => [
        styles.scanItem,
        pressed && styles.scanItemPressed,
      ]}
    >
      <View style={styles.scanIconContainer}>
        {item.type === 'url' ? (
          <LinkIcon size={20} color={ACCENT} weight="duotone" />
        ) : (
          <TextT size={20} color={TEXT_SECONDARY} weight="duotone" />
        )}
      </View>
      <View style={styles.scanContent}>
        <Text style={styles.scanText} numberOfLines={2}>
          {item.data}
        </Text>
        <View style={styles.scanMeta}>
          <View style={styles.scanTypeBadge}>
            <Text style={styles.scanTypeText}>
              {item.type === 'url' ? 'Link' : 'Text'}
            </Text>
          </View>
          <Text style={styles.scanTime}>
            {formatDate(item.timestamp)} · {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
      <View style={styles.scanActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCopy(item.data)}
        >
          <Copy size={16} color={TEXT_SECONDARY} weight="duotone" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDelete]}
          onPress={() => removeScan(item.id)}
        >
          <Trash size={16} color={ACCENT} weight="duotone" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {scans.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={styles.countText}>
            {scans.length} {scans.length === 1 ? 'scan' : 'scans'}
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearScans}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={scans.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <ClockCounterClockwise size={40} color={BORDER} weight="duotone" />
            </View>
            <Text style={styles.emptyTitle}>No Scans Yet</Text>
            <Text style={styles.emptySubtitle}>
              Scanned QR codes will appear here
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '500',
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: 8,
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  scanItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  scanIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: SURFACE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scanContent: {
    flex: 1,
    marginRight: 12,
  },
  scanText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
    marginBottom: 8,
  },
  scanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanTypeBadge: {
    backgroundColor: 'rgba(232, 90, 60, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scanTypeText: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '600',
  },
  scanTime: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  scanActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: SURFACE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDelete: {
    backgroundColor: 'rgba(232, 90, 60, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
});