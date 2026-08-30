import type { ActionType } from '@prisma/client';

export interface CreateActivityLogDTO {
  house_id: string;
  user_id: string;
  action_type: ActionType;
  task_id?: string | null;
  comment?: string | null;
}
