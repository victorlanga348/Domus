import { DayOfWeek, MealType, MealItem, HouseMealPlan, FamilyMember, MealChef } from '../../types.js';

export interface CookingScheduleConfig {
  weekdayPool: MealChef[];
  weekdayMeals: MealType[];
  weekendMode: 'fixed' | 'free';
  weekendChefs?: MealChef[];
  weekendMeals?: MealType[];
  updatedAt?: string;
}

export interface MealPeriodMeta {
  type: MealType;
  label: string;
  timeRange: string;
  icon: string;
  badgeColor: string;
}

export const MEAL_PERIODS: MealPeriodMeta[] = [
  {
    type: 'breakfast',
    label: 'Café da Manhã',
    timeRange: '06:00 - 10:00',
    icon: 'wb_twilight',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    type: 'lunch',
    label: 'Almoço',
    timeRange: '11:30 - 14:30',
    icon: 'sunny',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    type: 'snack',
    label: 'Lanche / Sobremesa',
    timeRange: '15:30 - 18:00',
    icon: 'bakery_dining',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    type: 'dinner',
    label: 'Jantar',
    timeRange: '19:00 - 22:30',
    icon: 'dark_mode',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
];

export interface DayMeta {
  key: DayOfWeek;
  shortLabel: string;
  fullLabel: string;
  dayNumber: number; // 1 = Seg, 7 = Dom
}

export const DAYS_OF_WEEK: DayMeta[] = [
  { key: 'monday', shortLabel: 'Seg', fullLabel: 'Segunda-feira', dayNumber: 1 },
  { key: 'tuesday', shortLabel: 'Ter', fullLabel: 'Terça-feira', dayNumber: 2 },
  { key: 'wednesday', shortLabel: 'Qua', fullLabel: 'Quarta-feira', dayNumber: 3 },
  { key: 'thursday', shortLabel: 'Qui', fullLabel: 'Quinta-feira', dayNumber: 4 },
  { key: 'friday', shortLabel: 'Sex', fullLabel: 'Sexta-feira', dayNumber: 5 },
  { key: 'saturday', shortLabel: 'Sáb', fullLabel: 'Sábado', dayNumber: 6 },
  { key: 'sunday', shortLabel: 'Dom', fullLabel: 'Domingo', dayNumber: 7 },
];

export const AVAILABLE_DIET_TAGS = [
  { label: 'Vegetariano', icon: 'eco', color: 'bg-green-100 text-green-800 border-green-200' },
  { label: 'Vegano', icon: 'psychiatry', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Sem Lactose', icon: 'water_drop', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'Sem Glúten', icon: 'grain', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Low Carb', icon: 'egg_alt', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { label: 'Rápido (<20min)', icon: 'schedule', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { label: 'Especial da Casa', icon: 'star', color: 'bg-rose-100 text-rose-800 border-rose-200' },
];

export interface MealsViewProps {
  mealPlan: HouseMealPlan;
  familyMembers: FamilyMember[];
  currentUserRole: string;
  currentUserId?: string;
  currentUserName?: string;
  savedCookingSchedule?: CookingScheduleConfig | null;
  onUpdateMeal: (meal: MealItem) => void;
  onDeleteMeal: (mealId: string) => void;
  onToggleLock: () => void;
  onClearMeals?: () => void;
  onGenerateSchedule?: (config: CookingScheduleConfig) => void;
}

export function createDefaultMealPlan(houseId: string): HouseMealPlan {
  return {
    houseId,
    isLocked: false,
    meals: [],
  };
}


