import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { MotiView } from 'moti';
import { theme } from '../theme';
import { Todo, ChecklistItem } from '../types/todo';

interface TaskDetailProps {
  todo: Todo;
  onBack: () => void;
  onSave: (id: string, details: string, imageUri?: string, checklist?: ChecklistItem[]) => void;
}

export function TaskDetail({ todo, onBack, onSave }: TaskDetailProps) {
  const [details, setDetails] = useState(todo.details || '');
  const [imageUri, setImageUri] = useState(todo.imageUri || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(todo.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleSave = () => {
    onSave(todo.id, details, imageUri, checklist);
    onBack();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri('');
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        isCompleted: false
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const deleteChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      let imageBase64 = '';
      if (imageUri) {
        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          imageBase64 = `data:image/jpeg;base64,${base64}`;
        } catch (error) {
          console.error('Error converting image:', error);
        }
      }

      const checklistHtml = checklist && checklist.length > 0 ? `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <h2 style="margin-top: 0;">Checklist:</h2>
          <ul style="list-style-type: none; padding: 0;">
            ${checklist.map(item => `
              <li style="margin-bottom: 8px;">
                <span style="margin-right: 10px;">${item.isCompleted ? '✅' : '⬜'}</span>
                <span style="${item.isCompleted ? 'text-decoration: line-through; color: #666;' : ''}">${item.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : '';

      const html = `
        <html>
          <body style="padding: 20px; font-family: Arial;">
            <h1 style="color: #2c3e50;">${todo.title}</h1>
            <div style="background: ${todo.isCompleted ? '#e8f5e9' : '#ffebee'}; padding: 10px; border-radius: 5px; margin: 10px 0;">
              Status: ${todo.isCompleted ? '✅ Completed' : '⏳ Pending'}
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
              <h2 style="margin-top: 0;">Details:</h2>
              <p style="white-space: pre-wrap;">${details || 'No details provided'}</p>
            </div>
            ${checklistHtml}
            ${imageBase64 ? `<img src="${imageBase64}" style="max-width: 100%; border-radius: 5px; margin-top: 10px;" />` : ''}
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Created on: ${new Date(todo.createdAt).toLocaleDateString()}
            </p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share task details');
      console.error(error);
    } finally {
      setIsSharing(false);
    }
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
        <TouchableOpacity 
          onPress={handleShare} 
          style={styles.shareButton}
          disabled={isSharing}
        >
          <Feather 
            name={isSharing ? "loader" : "share-2"} 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
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

        <View style={styles.checklistContainer}>
          <Text style={styles.sectionTitle}>CHECKLIST</Text>
          
          <View style={styles.checklistInputContainer}>
            <TextInput
              style={styles.checklistInput}
              placeholder="Add checklist item..."
              placeholderTextColor={theme.colors.textSecondary}
              value={newChecklistItem}
              onChangeText={setNewChecklistItem}
              onSubmitEditing={addChecklistItem}
            />
            <TouchableOpacity
              style={[styles.addButton, !newChecklistItem.trim() && styles.addButtonDisabled]}
              onPress={addChecklistItem}
              disabled={!newChecklistItem.trim()}
            >
              <Feather name="plus" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {checklist.map(item => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: 20 }}
              style={styles.checklistItem}
            >
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleChecklistItem(item.id)}
              >
                <View style={[
                  styles.checkboxInner,
                  item.isCompleted && styles.checkboxCompleted
                ]}>
                  {item.isCompleted && (
                    <Feather name="check" size={12} color={theme.colors.background} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={[
                styles.checklistText,
                item.isCompleted && styles.checklistTextCompleted
              ]}>
                {item.text}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteChecklistItem(item.id)}
              >
                <Feather name="x" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        <Text style={styles.label}>Image</Text>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={removeImage}
            >
              <Feather name="x-circle" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addImageButton}
            onPress={pickImage}
          >
            <Feather name="image" size={24} color={theme.colors.text} />
            <Text style={styles.addImageText}>Add Image</Text>
          </TouchableOpacity>
        )}
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
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    minHeight: 120,
    color: theme.colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
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
  imageContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderStyle: 'dashed',
  },
  addImageText: {
    color: theme.colors.text,
    fontSize: 16,
    marginLeft: theme.spacing.sm,
  },
  shareButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  checklistContainer: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
    fontWeight: '500',
  },
  checklistInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  checklistInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
  },
  checklistText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
}); 