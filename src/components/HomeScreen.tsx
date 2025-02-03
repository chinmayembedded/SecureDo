import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { theme } from '../theme';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Todo } from '../types/todo';
import { storage } from '../utils/storage';

const { width } = Dimensions.get('window');

export function HomeScreen({ onGetStarted }: { onGetStarted: () => void }) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const addSelectedTasksToTodo = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate unique IDs with timestamps
    const newTodos: Todo[] = selectedTasks.map(task => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: task,
      isCompleted: false,
      createdAt: today.getTime()
    }));

    try {
      const existingTodos = await storage.loadTodos();
      const updatedTodos = [...existingTodos, ...newTodos];
      await storage.saveTodos(updatedTodos);
      
      // Log for debugging
      console.log('Added todos:', newTodos);
      console.log('Total todos:', updatedTodos.length);
    } catch (error) {
      console.error('Error adding todos:', error);
    }
  };

  const toggleTaskSelection = (task: string) => {
    setSelectedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MotiView style={styles.logoContainer}>
          {/* <Text style={styles.appTitle}>SecureDo</Text> */}
          <Image
            source={require('../../assets/logo_bg_removed.png')}
            style={styles.logo}
          />
        </MotiView>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Your to-dos!{'\n'}Safe and secure</Text>
        </View>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 1000, delay: 500 }}
        style={styles.content}
      >
        <Text style={styles.sectionTitle}>RECOMMENDED</Text>
        
        <View style={styles.habitsContainer}>
          <View style={styles.habitsRow}>
            {[
              '🏃‍♂️ Exercise',
              '📚 Read books',
              '🧘‍♂️ Meditate',
              '📝 Plan meals',
              '🪴 Water plants',
              '📔 Journal',
              '🤸‍♂️ Stretch',
              '🎯 Review goals',
              // '🏃‍♀️ Run',
              '✅ Review daily goals',
              '🧘‍♀️ Yoga',
              '🛒 Grocery shopping',
              '💪 Go to the gym',
            ].map((habit, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleTaskSelection(habit)}
                style={[
                  styles.habitPill,
                  selectedTasks.includes(habit) && styles.selectedHabitPill
                ]}
              >
                <Text style={[
                  styles.habitText,
                  selectedTasks.includes(habit) && styles.selectedHabitText
                ]}>
                  {habit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <MotiView>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={async () => {
              if (selectedTasks.length > 0) {
                await addSelectedTasksToTodo();
              }
              onGetStarted();
            }}
          >
            <LinearGradient
              colors={theme.colors.gradient}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>
                {selectedTasks.length > 0 
                  ? `Add ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}`
                  : 'Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    height: 350,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 20,
  },
  headerContainer: {
    marginTop: theme.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 36,
  },
  content: {
    flex: 1,
    marginTop: -40,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.accent,
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
    fontWeight: '500',
  },
  habitsContainer: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  habitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  habitPill: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 8,
  },
  habitText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  buttonGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  continueButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  selectedHabitPill: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectedHabitText: {
    color: theme.colors.background,
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 