import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Feather } from '@expo/vector-icons';
import { Todo } from '../types/todo';
import { storage } from '../utils/storage';
import { theme } from '../theme';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Celebration } from './Celebration';
import { TaskDetail } from './TaskDetail';
import { ChecklistItem } from '../types/checklist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
const STORAGE_KEY = '@custom_recommended_tasks';

interface TodoListProps {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}

export function TodoList({ todos, setTodos }: TodoListProps) {
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
  const [userName, setUserName] = useState('');

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
      todoDate.setHours(0, 0, 0, 0);
      
      return todoDate.getTime() === selectedDate.getTime();
    });
  };

  // For debugging
  useEffect(() => {
    console.log('Current todos:', todos);
    console.log('Selected date:', selectedDate.toISOString());
    const filtered = getFilteredTodos();
    console.log('Filtered todos:', filtered);
  }, [todos, selectedDate]);

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('@user_name');
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric' 
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
      todo.id === id ? { 
        ...todo, 
        isCompleted: !todo.isCompleted,
        completedAt: !todo.isCompleted ? Date.now() : undefined
      } : todo
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
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const handleTodoPress = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailView(true);
  };

  const handleBack = () => {
    setIsDetailView(false);
    setSelectedTodo(null);
  };

  const handleSaveDetails = async (id: string, details: string, imageUri?: string, checklist?: ChecklistItem[]) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, details, imageUri, checklist } : todo
    );
    setTodos(updatedTodos);
    await storage.saveTodos(updatedTodos);
  };

  const renderHeader = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 100 }}
      style={styles.headerContainer}
    >
      {/* <Image
        source={require('../../assets/logo_bg_removed.png')}
        style={styles.logo}
      /> */}
    </MotiView>
  );

  const renderCalendar = () => (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 800 }}
      style={styles.calendarContainer}
    >
      {userName ? (
        <>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>TASK CALENDAR</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </>
      )}
      
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => navigateWeek('prev')}>
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{getHeaderDate()}</Text>
        <TouchableOpacity onPress={() => navigateWeek('next')}>
          <Feather name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendar}>
        {getDaysArray().map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          return (
            <MotiView
              key={index}
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                style={[
                  styles.dateItem,
                  isSelected && styles.selectedDate,
                  isToday && styles.todayDate
                ]}
                onPress={() => selectDate(date)}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedDateText,
                  isToday && styles.todayText
                ]}>
                  {DAYS[date.getDay()]}
                </Text>
                <Text style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText,
                  isToday && styles.todayText
                ]}>
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
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{
              type: 'spring',
              delay: index * 50,
              damping: 15
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
                <View style={[
                  styles.todoItem,
                  todo.isCompleted && styles.completedTodoItem
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      todo.isCompleted && styles.checkboxCompleted
                    ]}
                    onPress={() => toggleTodo(todo.id)}
                  >
                    {todo.isCompleted && (
                      <MotiView
                        from={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Feather name="check" size={16} color={theme.colors.background} />
                      </MotiView>
                    )}
                  </TouchableOpacity>
                  <Text style={[
                    styles.todoTitle,
                    todo.isCompleted && styles.completedTodo
                  ]}>
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
                  <View style={styles.todoActions}>
                    {todo.checklist && todo.checklist.length > 0 && (
                      <View style={styles.checklistIndicator}>
                        <Text style={styles.checklistCount}>
                          {todo.checklist.filter(item => item.isCompleted).length}/{todo.checklist.length}
                        </Text>
                        <Feather name="check-square" size={14} color={theme.colors.textSecondary} />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.detailsIcon}
                      onPress={() => handleTodoPress(todo)}
                    >
                      <Feather name="more-vertical" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.container}>
          {renderHeader()}
          {renderCalendar()}
          
          <View style={styles.content}>
            <ScrollView 
              style={styles.todoList}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {renderTodos()}
              {/* Add extra padding at bottom for keyboard */}
              <View style={{ height: 100 }} />
            </ScrollView>

            <MotiView
              from={{ translateY: 100 }}
              animate={{ translateY: 0 }}
              transition={{ type: 'spring', delay: 500 }}
              style={[
                styles.inputContainer,
                Platform.OS === 'ios' && { paddingBottom: theme.spacing.xl }
              ]}
            >
              <TextInput
                style={styles.input}
                value={newTodoTitle}
                onChangeText={setNewTodoTitle}
                placeholder="Add a new task..."
                placeholderTextColor={theme.colors.textSecondary}
                onSubmitEditing={addTodo}
              />
              <TouchableOpacity 
                style={[styles.addButton, !newTodoTitle.trim() && styles.addButtonDisabled]}
                onPress={addTodo}
                disabled={!newTodoTitle.trim()}
              >
                <View style={styles.addButtonGradient}>
                  <Feather name="plus" size={24} color={theme.colors.background} />
                </View>
              </TouchableOpacity>
            </MotiView>
          </View>
        </View>
      </KeyboardAvoidingView>

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
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  calendarContainer: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  calendar: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  dateItem: {
    width: 54,
    height: 74,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    paddingTop: 12,
  },
  selectedDate: {
    backgroundColor: theme.colors.surfaceHighlight,
  },
  todayDate: {
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dayText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  selectedDateText: {
    color: '#000000',
  },
  todayText: {
    color: '#000000',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  todoList: {
    flex: 1,
    paddingHorizontal: 4,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 5,
    width: '95%',
    alignSelf: 'center',
  },
  completedTodoItem: {
    backgroundColor: theme.colors.surface,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
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
    paddingBottom: theme.spacing.sm,
    // backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.accent,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingHorizontal: theme.spacing.md,
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
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '90%',
    backgroundColor: 'transparent',
    marginVertical: 4,
    marginTop: 2,
    borderRadius: theme.borderRadius.lg,
  },
  detailsIcon: {
    marginLeft: theme.spacing.sm,
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  checklistCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
}); 