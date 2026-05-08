import Tabs from 'expo-router/tabs';
import { useColorScheme, View, Text } from 'react-native';

const ACCENT = '#E85A3C';
const SURFACE = '#16161A';
const BORDER = '#2A2A30';

function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const iconMap: Record<string, string> = {
    scanner: '⌘',
    history: '◷',
  };
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.6, color }}>{iconMap[name] || '○'}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const backgroundColor = isDark ? '#0A0A0C' : '#F5F5F7';
  const surfaceColor = isDark ? SURFACE : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#1C1C1E';
  const textSecondary = isDark ? '#9A9AA0' : '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: textSecondary,
        tabBarStyle: {
          backgroundColor: surfaceColor,
          borderTopColor: isDark ? BORDER : '#E5E5EA',
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 24,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: surfaceColor,
        },
        headerTintColor: textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon name="scanner" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: 'Scan History',
          tabBarIcon: ({ color }) => (
            <TabIcon name="history" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}