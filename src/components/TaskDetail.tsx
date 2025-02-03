import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';
import { Todo } from '../types/todo';

interface TaskDetailProps {
  todo: Todo;
  onBack: () => void;
  onSave: (id: string, details: string) => void;
}

export function TaskDetail({ todo, onBack, onSave }: TaskDetailProps) {
  const [details, setDetails] = useState(todo.details || '');

  const handleSave = () => {
    onSave(todo.id, details);
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>
          {todo.title}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Task Details</Text>
        <TextInput
          style={styles.detailsInput}
          multiline
          value={details}
          onChangeText={setDetails}
          placeholder="Add details about your task..."
          placeholderTextColor={theme.colors.textSecondary}
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  detailsInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 200,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
}); 