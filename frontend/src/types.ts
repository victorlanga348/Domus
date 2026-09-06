export type TabType = 'dashboard' | 'tasks' | 'meals' | 'reports' | 'statistics' | 'settings';

export interface TaskAuditItem {
  id: string;
  title: string;
  member: string;
  memberAvatar?: string;
  timestamp: string;
  dateStr: string;
  status: 'completed' | 'justified' | 'failed';
  category?: string;
  comment?: string;
  photoUrl?: string;
  errorMessage?: string;
  audited?: boolean;
  auditedBy?: string;
  auditedAt?: string;
  auditNotes?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin Geral' | 'Admin' | 'Resident' | 'Resident (Restricted)' | 'Guest Access';
  isPrimary?: boolean;
  avatar: string;
  balanceOwed?: number; // positive = gets back, negative = owes, 0 = settled
  statusTag?: string;
  vacation_mode?: boolean;
  temporary?: boolean;
}

export interface HouseTask {
  id: string;
  title: string;
  period: 'morning' | 'afternoon' | 'night';
  nextMember: string;
  nextMemberId?: string;
  nextMemberAvatar?: string;
  status: 'pending' | 'completed' | 'skipped' | 'cancelled' | 'alert';
  timeLabel?: string;
  icon: string;
  frequency?: string; // e.g. "Diária", "Dias Úteis (Seg-Sex)", "Semanal", "Quinzenal", "Mensal", "Única (Um só dia)", "Dia do Mês", "Personalizada"
  days?: string[];
  singleDate?: string;
  monthDay?: number;
  advanceNotice?: string;
  isRotation?: boolean;
  participantIds?: string[];
  participants?: { id: string; name: string; avatar?: string; vacation_mode?: boolean }[];
  completedBy?: string;
  completedById?: string;
  completedAt?: string;
}

export interface TaskRotation {
  id: string;
  taskId?: string;
  title: string;
  schedule: string; // e.g. "Daily • 20:00"
  nextMember: string;
  nextMemberAvatar: string;
  queue: { id?: string; name: string; avatar: string; isNext?: boolean; vacation_mode?: boolean }[];
  frequency: string;
  poolSelection: string;
  icon: string;
  days?: string[];
  period?: 'morning' | 'afternoon' | 'night';
  participantIds?: string[];
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  dateStr: string;
  paidBy: string;
  categoryIcon: string;
  status: 'Unsettled' | 'Settled';
  autoPay?: boolean;
}

export interface HouseRule {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  timeAgo: string;
  author: string;
  likes?: number;
  type?: 'task' | 'security' | 'climate' | 'system';
  created_at?: string;
  timestamp?: number;
}

export interface MuralNoteItem {
  id: string;
  text: string;
  done: boolean;
}

export interface MuralNote {
  id: string;
  title?: string;
  content: string;
  items?: MuralNoteItem[];
  color: 'amber' | 'teal' | 'gray' | 'rose' | 'lavender';
  dateStr: string;
  author: string;
  authorAvatar?: string;
  isPinned?: boolean;
}

export interface MemberStatus {
  id: string;
  name: string;
  avatar?: string;
  location: string; // e.g. "In Home Office", "At Work", "Gym"
  icon: string; // e.g. "laptop_mac", "directions_car", "fitness_center"
}

export interface SystemPreferences {
  nightMode: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface MealItem {
  id: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  title: string;
  description?: string;
  tags?: string[];
  chefId?: string;
  chefName?: string;
  chefAvatar?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HouseMealPlan {
  houseId: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedByName?: string;
  lockedAt?: string;
  meals: MealItem[];
}
