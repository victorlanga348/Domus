export interface CreateTaskDTO {
  title: string;
  description?: string;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONCE';
  creator_id: string;
  house_id: string;
  participant_ids: string[];
}

export interface LockTaskDTO {
  user_id: string;
}

export interface BlockTaskDTO {
  user_id: string;
  reason: string;
}

export interface CompleteTaskDTO {
  user_id: string;
}
