import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { HomeScreen } from '../src/components/HomeScreen';
import { TodoList } from '../src/components/TodoList';
import { Analytics } from '../src/components/Analytics';
import { theme } from '../src/theme';
import { Todo } from '../src/types/todo';
import { storage } from '../src/utils/storage';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings } from '../src/components/Settings';
import { NotificationSettings } from '../src/components/NotificationSettings';
import { AppInfo } from '../src/components/AppInfo';

export default function DailyHabits() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<'Tasks' | 'Analytics' | 'Settings' | 'Notifications' | 'Info'>('Tasks');
  const [todos, setTodos] = useState<Todo[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const loadedTodos = await storage.loadTodos();
      console.log('Initial load todos:', loadedTodos);
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const handleAddTodos = async (newTodos: Todo[]) => {
    try {
      const updatedTodos = [...todos, ...newTodos];
      await storage.saveTodos(updatedTodos);
      setTodos(updatedTodos);
      console.log('Updated todos after adding:', updatedTodos);
    } catch (error) {
      console.error('Error adding todos:', error);
    }
  };

  if (!hasOnboarded) {
    return (
      <HomeScreen 
        onGetStarted={() => setHasOnboarded(true)} 
        onAddTodos={handleAddTodos}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {activeTab === 'Tasks' ? (
            <TodoList todos={todos} setTodos={setTodos} />
          ) : activeTab === 'Analytics' ? (
            <Analytics todos={todos} />
          ) : activeTab === 'Notifications' ? (
            <NotificationSettings />
          ) : activeTab === 'Info' ? (
            <AppInfo />
          ) : (
            <Settings todos={todos} setTodos={setTodos} />
          )}
        </View>

        <MotiView 
          style={[
            styles.tabBar,
            { paddingBottom: Math.max(insets.bottom, 16) }
          ]}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Tasks')}
          >
            <MotiView
              animate={{ 
                opacity: activeTab === 'Tasks' ? 1 : 0.6,
              }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <View style={styles.tabButton}>
                <Feather
                  name="check-square"
                  size={24}
                  color={activeTab === 'Tasks' ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </MotiView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Analytics')}
          >
            <MotiView
              animate={{ 
                opacity: activeTab === 'Analytics' ? 1 : 0.6,
              }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <View style={styles.tabButton}>
                <Feather
                  name="bar-chart-2"
                  size={24}
                  color={activeTab === 'Analytics' ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </MotiView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Notifications')}
          >
            <MotiView
              animate={{ 
                opacity: activeTab === 'Notifications' ? 1 : 0.6,
              }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <View style={styles.tabButton}>
                <Feather
                  name="bell"
                  size={24}
                  color={activeTab === 'Notifications' ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </MotiView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Info')}
          >
            <MotiView
              animate={{ 
                opacity: activeTab === 'Info' ? 1 : 0.6,
              }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <View style={styles.tabButton}>
                <Feather
                  name="info"
                  size={24}
                  color={activeTab === 'Info' ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </MotiView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Settings')}
          >
            <MotiView
              animate={{ 
                opacity: activeTab === 'Settings' ? 1 : 0.6,
              }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <View style={styles.tabButton}>
                <Feather
                  name="settings"
                  size={24}
                  color={activeTab === 'Settings' ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </MotiView>
          </TouchableOpacity>
        </MotiView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    backgroundColor: theme.colors.cardBg,
  },
  tab: {
    alignItems: 'center',
  },
  tabButton: {
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 