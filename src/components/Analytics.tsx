import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Todo } from '../types/todo';
import { theme } from '../theme';

interface AnalyticsProps {
  todos: Todo[];
  onBack?: () => void;
}

export function Analytics({ todos }: AnalyticsProps) {
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.isCompleted).length;
    const pending = total - completed;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    // Get tasks completed per day for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const dailyCompletion = last7Days.map(date => {
      const dayTodos = todos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        return todoDate.getDate() === date.getDate() &&
               todoDate.getMonth() === date.getMonth() &&
               todoDate.getFullYear() === date.getFullYear();
      });
      const completed = dayTodos.filter(todo => todo.isCompleted).length;
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed
      };
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      dailyCompletion
    };
  }, [todos]);

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
}); 