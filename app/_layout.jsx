import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../constants/theme';

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? COLORS.primaryDark : COLORS.textLight, fontWeight: focused ? '700' : '400' }}>
        {label}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            height: 64,
            paddingBottom: 8,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen
          name="home"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
        />
        <Tabs.Screen
          name="cart"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" label="Cart" focused={focused} /> }}
        />
        <Tabs.Screen
          name="orders"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Orders" focused={focused} /> }}
        />
        <Tabs.Screen name="account"  options={{ href: null }} />
        <Tabs.Screen name="loaction" options={{ href: null }} />
        <Tabs.Screen name="preorder" options={{ href: null }} />
        <Tabs.Screen name="payment"  options={{ href: null }} />
        <Tabs.Screen name="success"  options={{ href: null }} />
        <Tabs.Screen name="order"    options={{ href: null }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}