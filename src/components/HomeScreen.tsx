import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { theme } from '../theme';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Todo } from '../types/todo';
import { storage } from '../utils/storage';
import { DEFAULT_TASKS } from '../utils/recommendedTasks';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onGetStarted: () => void;
  onAddTodos: (todos: Todo[]) => Promise<void>;
}

export function HomeScreen({ onGetStarted, onAddTodos }: HomeScreenProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [recommendedTasks] = useState(DEFAULT_TASKS);

  const addSelectedTasksToTodo = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newTodos: Todo[] = selectedTasks.map(task => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: task,
      isCompleted: false,
      createdAt: today.getTime(),
      details: '',
    }));

    try {
      await onAddTodos(newTodos);
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
          <ScrollView style={styles.habitsScroll}>
            <View style={styles.habitsRow}>
              {recommendedTasks.map((habit, index) => (
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
          </ScrollView>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 350,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.lg,
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    maxHeight: '60%',
  },
  habitsScroll: {
    flex: 1,
  },
  habitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: theme.spacing.lg,
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