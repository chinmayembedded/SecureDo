import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Feather } from '@expo/vector-icons';
import { Todo } from '../types/todo';
import { storage } from '../utils/storage';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Celebration } from './Celebration';
import { TaskDetail } from './TaskDetail';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    loadTodos();
  }, [selectedDate]);

  const loadTodos = async () => {
    try {
      const loadedTodos = await storage.loadTodos();
      console.log('Loaded todos:', loadedTodos.length);
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const getDaysArray = () => {
    const days = [];
    const startDate = new Date(weekStart);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getFilteredTodos = () => {
    return todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return isSameDay(todoDate, selectedDate);
    });
  };

  const addTodo = async () => {
    if (!newTodoTitle.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle.trim(),
      isCompleted: false,
      createdAt: selectedDate.getTime()
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await storage.saveTodos(updatedTodos);
    setNewTodoTitle('');
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    setTodos(updatedTodos);
    await storage.saveTodos(updatedTodos);
    
    if (!todo?.isCompleted) {
      setShowCelebration(true);
    }
  };

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await storage.saveTodos(updatedTodos);
  };

  const getHeaderDate = () => {
    const month = MONTHS[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${month} ${year}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(weekStart);
    const daysToAdd = direction === 'next' ? 7 : -7;
    newWeekStart.setDate(weekStart.getDate() + daysToAdd);
    
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTodoPress = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailView(true);
  };

  const handleBack = () => {
    setIsDetailView(false);
    setSelectedTodo(null);
  };

  const handleSaveDetails = async (id: string, details: string, imageUri?: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, details, imageUri } : todo
    );
    setTodos(updatedTodos);
    await storage.saveTodos(updatedTodos);
  };

  const renderCalendar = () => (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 800 }}
      style={styles.calendarContainer}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendar}>
        {getDaysArray().map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <MotiView
              key={index}
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                style={[styles.dateItem, isSelected && styles.selectedDate]}
                onPress={() => selectDate(date)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDateText]}>
                  {DAYS[date.getDay()]}
                </Text>
                <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>
    </MotiView>
  );

  const renderRightActions = (todoId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => deleteTodo(todoId)}
      >
        <Feather name="trash-2" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderTodos = () => {
    const filteredTodos = getFilteredTodos();
    
    return (
      <ScrollView style={styles.todoList}>
        {filteredTodos.map((todo, index) => (
          <MotiView
            key={todo.id}
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{
              opacity: 0,
              translateY: -10
            }}
            transition={{
              type: 'timing',
              duration: 300,
              delay: index * 50
            }}
          >
            <Swipeable
              renderRightActions={() => renderRightActions(todo.id)}
              rightThreshold={40}
            >
              <TouchableOpacity
                onPress={() => handleTodoPress(todo)}
                activeOpacity={0.7}
              >
                <View style={styles.todoItem}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleTodo(todo.id)}
                  >
                    {todo.isCompleted && (
                      <MotiView
                        from={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Feather name="check" size={16} color={theme.colors.success} />
                      </MotiView>
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.todoTitle, todo.isCompleted && styles.completedTodo]}>
                    {todo.title}
                  </Text>
                  {todo.details && (
                    <Feather 
                      name="file-text" 
                      size={16} 
                      color={theme.colors.textSecondary}
                      style={styles.detailsIcon}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </Swipeable>
          </MotiView>
        ))}
      </ScrollView>
    );
  };

  if (isDetailView && selectedTodo) {
    return (
      <TaskDetail
        todo={selectedTodo}
        onBack={handleBack}
        onSave={handleSaveDetails}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000 }}
          >
            <Text style={styles.appTitle}>SecureDo</Text>
            <Text style={styles.headerYear}>{getHeaderDate()}</Text>
            <View style={styles.weekNavigation}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateWeek('prev')}
              >
                <Feather name="chevron-left" size={24} color={theme.colors.background} />
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => navigateWeek('next')}
              >
                <Text style={styles.navButtonText}>Next</Text>
                <Feather name="chevron-right" size={24} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>

        {renderCalendar()}
        
        <View style={styles.content}>
          {renderTodos()}
          <MotiView
            from={{ translateY: 100 }}
            animate={{ translateY: 0 }}
            transition={{ type: 'spring', delay: 500 }}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
              placeholder="Write a task..."
              placeholderTextColor={theme.colors.textSecondary}
              onSubmitEditing={addTodo}
            />
            <TouchableOpacity 
              style={[styles.addButton, !newTodoTitle.trim() && styles.addButtonDisabled]}
              onPress={addTodo}
              disabled={!newTodoTitle.trim()}
            >
              <LinearGradient
                colors={[theme.colors.gradient[0], theme.colors.gradient[1]]}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather name="plus" size={24} color={theme.colors.background} />
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        </View>
      </View>
      <Celebration 
        visible={showCelebration} 
        onClose={() => setShowCelebration(false)} 
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
    backgroundColor: theme.colors.primary,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  headerYear: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  navButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    marginHorizontal: theme.spacing.xs,
  },
  calendarContainer: {
    backgroundColor: theme.colors.background,
    marginTop: -20,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  calendar: {
    flexDirection: 'row',
  },
  dateItem: {
    width: 55,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  selectedDate: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedDateText: {
    color: theme.colors.background,
  },
  content: {
    flex: 1,
    marginTop: 0,
  },
  todoList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoTitle: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    backgroundColor: theme.colors.background,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '90%',
    backgroundColor: 'transparent',
    marginVertical: 4,
  },
  detailsIcon: {
    marginLeft: theme.spacing.sm,
  },
}); 