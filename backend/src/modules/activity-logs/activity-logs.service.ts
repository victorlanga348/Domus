import { ActivityLogRepository, type CreateActivityLogInput } from './activity-logs.repository.js';
import type { ActivityLog } from '@prisma/client';

export class ActivityLogService {
  constructor(private logRepo = new ActivityLogRepository()) {}

  async createLog(data: CreateActivityLogInput): Promise<ActivityLog> {
    return this.logRepo.create(data);
  }

  async getHouseLogs(houseId: string, limit?: number): Promise<ActivityLog[]> {
    return this.logRepo.findByHouseId(houseId, limit);
  }
}
