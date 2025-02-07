import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { theme } from '../theme';
import { storage } from '../utils/storage';
import { Todo } from '../types/todo';
import { ProgressBar } from './ProgressBar';

interface SettingsProps {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}

export function Settings({ todos, setTodos }: SettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const renderHeader = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 100 }}
      style={styles.headerContainer}
    >
      <Image
        source={require('../../assets/logo_bg_removed.png')}
        style={styles.logo}
      />
    </MotiView>
  );

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your tasks? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Simulate deletion progress
              for (let i = 0; i <= 100; i += 10) {
                setDeleteProgress(i);
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              await storage.clearTodos();
              setTodos([]);
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsDeleting(false);
              setDeleteProgress(0);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = {
        todos,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      const fileName = `securedo_backup_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export SecureDo Data',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.type === 'success') {
        const content = await FileSystem.readAsStringAsync(result.uri);
        const importedData = JSON.parse(content);

        if (!importedData.todos || !Array.isArray(importedData.todos)) {
          throw new Error('Invalid file format');
        }

        const existingIds = new Set(todos.map(todo => todo.id));
        const duplicates = importedData.todos.filter(todo => existingIds.has(todo.id));

        if (duplicates.length > 0) {
          Alert.alert(
            'Duplicate Tasks Found',
            'Some tasks already exist. Do you want to replace them?',
            [
              {
                text: 'Skip',
                onPress: () => {
                  const newTodos = [
                    ...todos,
                    ...importedData.todos.filter(todo => !existingIds.has(todo.id)),
                  ];
                  setTodos(newTodos);
                  storage.saveTodos(newTodos);
                },
              },
              {
                text: 'Replace',
                onPress: () => {
                  const newTodos = [
                    ...todos.filter(todo => !duplicates.find(d => d.id === todo.id)),
                    ...importedData.todos,
                  ];
                  setTodos(newTodos);
                  storage.saveTodos(newTodos);
                },
              },
            ],
          );
        } else {
          const newTodos = [...todos, ...importedData.todos];
          setTodos(newTodos);
          await storage.saveTodos(newTodos);
        }

        Alert.alert('Success', 'Data imported successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import data. Please ensure the file is valid.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>

        {isDeleting && (
          <MotiView 
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.progressContainer}
          >
            <ProgressBar progress={deleteProgress} />
            <Text style={styles.progressText}>Clearing data... {deleteProgress}%</Text>
          </MotiView>
        )}

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearData}
          disabled={isDeleting}
        >
          <Feather name="trash-2" size={24} color={theme.colors.error} />
          <Text style={[styles.buttonText, styles.dangerText]}>Clear All Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleExportData}
          disabled={isExporting}
        >
          <Feather name="download" size={24} color={theme.colors.text} />
          <Text style={styles.buttonText}>
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleImportData}
          disabled={isImporting}
        >
          <Feather name="upload" size={24} color={theme.colors.text} />
          <Text style={styles.buttonText}>
            {isImporting ? 'Importing...' : 'Import Data'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  content: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
  },
  dangerText: {
    color: theme.colors.error,
  },
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
}); 