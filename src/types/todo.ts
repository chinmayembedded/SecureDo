export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
  details?: string;
  imageUri?: string;
  checklist?: ChecklistItem[];
}

export type TodoFilter = 'all' | 'completed' | 'pending';
export type TodoSort = 'newest' | 'oldest'; 