import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';

const TODOS_KEY = '@todos';

export const storage = {
  async saveTodos(todos: Todo[]) {
    try {
      // Ensure dates are properly formatted
      const sanitizedTodos = todos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt).getTime(),
      }));
      
      const jsonValue = JSON.stringify(sanitizedTodos);
      await AsyncStorage.setItem(TODOS_KEY, jsonValue);
      console.log('Saved todos:', sanitizedTodos);
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  },

  async loadTodos(): Promise<Todo[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(TODOS_KEY);
      if (!jsonValue) return [];
      
      const todos = JSON.parse(jsonValue);
      // Ensure dates are properly parsed
      const sanitizedTodos = todos.map((todo: Todo) => ({
        ...todo,
        createdAt: new Date(todo.createdAt).getTime(),
      }));
      
      console.log('Loaded todos:', sanitizedTodos);
      return sanitizedTodos;
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  },

  async clearTodos() {
    try {
      await AsyncStorage.removeItem(TODOS_KEY);
      console.log('Cleared all todos');
    } catch (error) {
      console.error('Error clearing todos:', error);
      throw error;
    }
  },
}; 