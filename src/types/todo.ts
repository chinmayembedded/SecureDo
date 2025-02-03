export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: number;
  details?: string;
  imageUri?: string;
}

export type TodoFilter = 'all' | 'completed' | 'pending';
export type TodoSort = 'newest' | 'oldest'; 