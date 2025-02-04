import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@custom_recommended_tasks';

export const DEFAULT_TASKS = [
  '🏃‍♂️ Exercise',
  '📚 Read books',
  '🧘‍♂️ Meditate',
  '📝 Plan meals',
  '🪴 Water plants',
  '📔 Journal',
  '🤸‍♂️ Stretch',
  '🎯 Review goals',
  '✅ Review daily goals',
  '🧘‍♀️ Yoga',
  '🛒 Grocery shopping',
  '💪 Go to the gym',
];

export async function loadRecommendedTasks(): Promise<string[]> {
  try {
    const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
        return [...DEFAULT_TASKS, ...parsedTasks];
      }
    }
    return DEFAULT_TASKS;
  } catch (error) {
    console.error('Error loading recommended tasks:', error);
    return DEFAULT_TASKS;
  }
}

export async function saveCustomTask(newTask: string): Promise<string[]> {
  try {
    const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    const customTasks = savedTasks ? JSON.parse(savedTasks) : [];
    const updatedCustomTasks = [...customTasks, newTask.trim()];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomTasks));
    return [...DEFAULT_TASKS, ...updatedCustomTasks];
  } catch (error) {
    console.error('Error saving custom task:', error);
    throw error;
  }
} 