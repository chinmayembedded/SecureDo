import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { theme } from '../theme';

interface TabBarProps {
  activeTab: 'tasks' | 'analytics';
  onTabPress: (tab: 'tasks' | 'analytics') => void;
}

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('tasks')}
      >
        <Feather 
          name="check-square" 
          size={24} 
          color={activeTab === 'tasks' ? theme.colors.text : theme.colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'tasks' && styles.activeTabText
        ]}>Tasks</Text>
        {activeTab === 'tasks' && (
          <MotiView
            from={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.activeIndicator}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('analytics')}
      >
        <Feather 
          name="bar-chart-2" 
          size={24} 
          color={activeTab === 'analytics' ? theme.colors.text : theme.colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          activeTab === 'analytics' && styles.activeTabText
        ]}>Analytics</Text>
        {activeTab === 'analytics' && (
          <MotiView
            from={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.activeIndicator}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    position: 'relative',
  },
  tabText: {
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
}); 