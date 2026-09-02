import {
  FamilyMember,
  HouseTask,
  TaskRotation,
  ExpenseItem,
  HouseRule,
  ActivityLog,
  SystemPreferences,
  MuralNote,
  MemberStatus,
} from './types';

export const INITIAL_MURAL_NOTES: MuralNote[] = [];

export const INITIAL_MEMBER_STATUSES: MemberStatus[] = [];

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [];

export const INITIAL_TASKS: HouseTask[] = [];

export const INITIAL_ROTATIONS: TaskRotation[] = [];

export const INITIAL_EXPENSES: ExpenseItem[] = [];

export const INITIAL_HOUSE_RULES: HouseRule[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

export const INITIAL_PREFERENCES: SystemPreferences = {
  nightMode: {
    enabled: true,
    startTime: '23:00',
    endTime: '07:00',
  },
};
