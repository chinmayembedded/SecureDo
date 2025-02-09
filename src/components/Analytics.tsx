import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Todo } from '../types/todo';
import { theme } from '../theme';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AnalyticsProps {
  todos: Todo[];
  onBack?: () => void;
}

type DateRange = '7days' | '30days' | '90days';

export function Analytics({ todos }: AnalyticsProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const calculateAverageCompletionTime = (filteredTodos: Todo[]) => {
    const completedTodos = filteredTodos.filter(todo => todo.isCompleted);
    if (completedTodos.length === 0) return 0;
    
    const totalTime = completedTodos.reduce((sum, todo) => {
      const createdDate = new Date(todo.createdAt).getTime();
      const completedDate = new Date(todo.completedAt || Date.now()).getTime();
      return sum + (completedDate - createdDate);
    }, 0);
    
    return Math.round(totalTime / completedTodos.length / (1000 * 60 * 60)); // Convert to hours
  };

  const stats = useMemo(() => {
    const filteredTodos = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return todoDate >= startDate && todoDate <= endDate;
    });

    const total = filteredTodos.length;
    const completed = filteredTodos.filter(todo => todo.isCompleted).length;
    const pending = total - completed;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    // Get last 7 days data
    const dailyCompletion = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      
      const dayTodos = filteredTodos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        return todoDate.getDate() === date.getDate() &&
               todoDate.getMonth() === date.getMonth() &&
               todoDate.getFullYear() === date.getFullYear();
      });
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayTodos.filter(todo => todo.isCompleted).length
      };
    });

    // Most productive day
    let mostProductiveDay = { date: '', completed: 0 };
    dailyCompletion.forEach((data, index) => {
      if (data.completed > mostProductiveDay.completed) {
        mostProductiveDay = { date: data.day, completed: data.completed };
      }
    });

    // Completion by day of week
    const weekdayStats = new Array(7).fill(0).map(() => ({ total: 0, completed: 0 }));
    filteredTodos.forEach(todo => {
      const date = new Date(todo.createdAt);
      const dayIndex = date.getDay();
      weekdayStats[dayIndex].total++;
      if (todo.isCompleted) weekdayStats[dayIndex].completed++;
    });

    const bestWeekday = weekdayStats.reduce((best, current, index) => {
      const currentRate = current.total ? (current.completed / current.total) : 0;
      const bestRate = best.total ? (best.completed / best.total) : 0;
      return currentRate > bestRate ? { ...current, day: index } : best;
    }, { total: 0, completed: 0, day: 0 });

    return {
      total,
      completed,
      pending,
      completionRate,
      dailyCompletion,
      mostProductiveDay,
      weekdayStats,
      bestWeekday,
      averageCompletionTime: calculateAverageCompletionTime(filteredTodos),
    };
  }, [todos, startDate, endDate]);

  const handleDateRangeChange = (range: DateRange) => {
    const end = new Date();
    let start = new Date();

    switch (range) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '90days':
        start.setDate(end.getDate() - 90);
        break;
    }

    setDateRange(range);
    setStartDate(start);
    setEndDate(end);
  };

  const maxCompleted = Math.max(...stats.dailyCompletion.map(d => d.completed), 1);

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

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      style={styles.container}
    >
      {renderHeader()}
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>TASK ANALYTICS</Text>

          {/* Date Range Selector */}
          <View style={styles.dateRangeContainer}>
            {['7days', '30days', '90days'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.dateRangeButton, dateRange === range && styles.dateRangeButtonActive]}
                onPress={() => handleDateRangeChange(range as DateRange)}
              >
                <Text style={[
                  styles.dateRangeText,
                  dateRange === range && styles.dateRangeTextActive
                ]}>
                  {range === '7days' ? '7 Days' :
                   range === '30days' ? '30 Days' : '90 Days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={styles.statCard}
          >
            <Text style={styles.statTitle}>Completion Rate</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <MotiView 
                  style={[styles.progressFill, { width: `${stats.completionRate}%` }]}
                  from={{ width: '0%' }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ type: 'timing', duration: 1000 }}
                />
              </View>
              <Text style={styles.progressText}>{stats.completionRate}%</Text>
            </View>
          </MotiView>

          <View style={styles.statsRow}>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 200 }}
              style={[styles.statBox, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.statBoxTitle}>Total Tasks</Text>
              <Text style={styles.statBoxValue}>{stats.total}</Text>
            </MotiView>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 300 }}
              style={[styles.statBox, { backgroundColor: theme.colors.success }]}
            >
              <Text style={styles.statBoxTitle}>Completed</Text>
              <Text style={styles.statBoxValue}>{stats.completed}</Text>
            </MotiView>
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.chartCard}
          >
            <Text style={styles.chartTitle}>Last 7 Days Activity</Text>
            <View style={styles.barChart}>
              {stats.dailyCompletion.map((data, index) => (
                <View key={index} style={styles.barContainer}>
                  <MotiView
                    from={{ height: 0 }}
                    animate={{ height: (data.completed / maxCompleted) * 150 }}
                    transition={{ type: 'spring', delay: index * 100 }}
                    style={[styles.bar, { backgroundColor: theme.colors.primary }]}
                  />
                  <Text style={styles.barLabel}>{data.day}</Text>
                  <Text style={styles.barValue}>{data.completed}</Text>
                </View>
              ))}
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.statCard}
          >
            <Text style={styles.statTitle}>Most Productive Day</Text>
            <Text style={styles.statValue}>
              {stats.mostProductiveDay.date ? 
                `${new Date(stats.mostProductiveDay.date).toLocaleDateString()} (${stats.mostProductiveDay.completed} tasks)` :
                'No data available'}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.statCard}
          >
            <Text style={styles.statTitle}>Best Performing Day</Text>
            <Text style={styles.statValue}>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][stats.bestWeekday.day]}
            </Text>
            <Text style={styles.statSubtext}>
              {stats.bestWeekday.total ? 
                `${Math.round((stats.bestWeekday.completed / stats.bestWeekday.total) * 100)}% completion rate` :
                'No data available'}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 600 }}
            style={styles.statCard}
          >
            <Text style={styles.statTitle}>Average Completion Time</Text>
            <Text style={styles.statValue}>
              {stats.averageCompletionTime ? 
                `${stats.averageCompletionTime} hours` :
                'No data available'}
            </Text>
          </MotiView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: theme.spacing.lg,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  progressContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 24,
    backgroundColor: 'rgba(180, 165, 165, 0.04)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statBox: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  statBoxTitle: {
    fontSize: 14,
    color: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.background,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    paddingTop: theme.spacing.lg,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: theme.colors.primary,
  },
  barLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  barValue: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 4,
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
  sectionTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
    fontWeight: '500',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dateRangeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    minWidth: 80,
    alignItems: 'center',
  },
  dateRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  dateRangeText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  dateRangeTextActive: {
    color: theme.colors.background,
  },
  statSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
}); 