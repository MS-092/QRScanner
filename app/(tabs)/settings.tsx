import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

const ACCENT = '#E85A3C';
const SURFACE = '#16161A';
const SURFACE_LIGHT = '#1E1E24';
const BORDER = '#2A2A30';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#9A9AA0';

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = React.useState(systemColorScheme === 'dark');

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIconContainer}>
              {darkMode ? (
                <Text style={{ fontSize: 20, color: ACCENT }}>☾</Text>
              ) : (
                <Text style={{ fontSize: 20, color: ACCENT }}>☀</Text>
              )}
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: BORDER, true: ACCENT }}
            thumbColor={TEXT_PRIMARY}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>QR</Text>
            </View>
            <View style={styles.aboutInfo}>
              <Text style={styles.appName}>QR Scanner</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutDescription}>
            A smart QR code scanner with URL detection and scan history.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontSize: 16, color: TEXT_SECONDARY }}>ℹ</Text>
        <Text style={styles.footerText}>Made with care</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SURFACE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '800',
  },
  aboutInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  aboutDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
    marginBottom: 40,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
});