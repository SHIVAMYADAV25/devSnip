import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from './src/constants/theme';
import { initFileSystem } from './src/services/FileService';
import { getDb } from './src/database/SQLiteService';
import { useAppStore } from './src/store/useAppStore';
import { seedDemoData } from './src/utils/seedData';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SnippetsScreen from './src/screens/SnippetsScreen';
import FilesScreen from './src/screens/FilesScreen';
import ExplainScreen from './src/screens/ExplainScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CreateSnippetScreen from './src/screens/CreateSnippetScreen';
import SnippetDetailScreen from './src/screens/SnippetDetailScreen';
import EditSnippetScreen from './src/screens/EditSnippetScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import FolderBrowserScreen from './src/screens/FolderBrowserScreen';
import AIResultScreen from './src/screens/AIResultScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
            Home:     ['home',       'home-outline'],
            Snippets: ['code-slash', 'code-slash-outline'],
            Files:    ['folder',     'folder-outline'],
            Explain:  ['sparkles',   'sparkles-outline'],
            Settings: ['settings',   'settings-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Snippets" component={SnippetsScreen} />
      <Tab.Screen name="Files" component={FilesScreen} />
      <Tab.Screen name="Explain" component={ExplainScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const { loadSettings, loadAiProvider } = useAppStore();

  useEffect(() => {
    async function init() {
      try {
        await getDb();
        await initFileSystem();
        await loadSettings();
        await loadAiProvider();
        await seedDemoData();
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen
            name="CreateSnippet"
            component={CreateSnippetScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="SnippetDetail" component={SnippetDetailScreen} />
          <Stack.Screen
            name="EditSnippet"
            component={EditSnippetScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="FolderBrowser" component={FolderBrowserScreen} />
          <Stack.Screen name="AIResult" component={AIResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
