import * as FileSystem from 'expo-file-system';
import { Todo } from '../types/todo';

const TODO_FILE = `${FileSystem.documentDirectory}todos.json`;

export const storage = {
  async loadTodos(): Promise<Todo[]> {
    try {
      const fileExists = await FileSystem.getInfoAsync(TODO_FILE);
      if (!fileExists.exists) {
        await this.saveTodos([]);
        return [];
      }
      const content = await FileSystem.readAsStringAsync(TODO_FILE);
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  },

  async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(TODO_FILE, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }
}; 