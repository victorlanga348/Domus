import { DayOfWeek, MealType, MealItem, HouseMealPlan, FamilyMember } from '../../types.js';

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
  onUpdateMeal: (meal: MealItem) => void;
  onDeleteMeal: (mealId: string) => void;
  onToggleLock: () => void;
}

export function createDefaultMealPlan(houseId: string, members: FamilyMember[] = []): HouseMealPlan {
  const getChef = (idx: number) => {
    const member = members[idx % Math.max(members.length, 1)];
    return member
      ? { chefId: member.id, chefName: member.name, chefAvatar: member.avatar }
      : { chefName: 'Morador da Casa' };
  };

  const defaultMeals: MealItem[] = [
    // Segunda
    {
      id: 'meal_mon_b',
      dayOfWeek: 'monday',
      mealType: 'breakfast',
      title: 'Ovos Mexidos com Torradas Integrais e Frutas',
      description: 'Acompanha suco de laranja natural e café recém-passado.',
      tags: ['Vegetariano', 'Rápido (<20min)'],
      ...getChef(0),
    },
    {
      id: 'meal_mon_l',
      dayOfWeek: 'monday',
      mealType: 'lunch',
      title: 'Peito de Frango Grelhado com Legumes e Arroz Integral',
      description: 'Legumes no vapor (brócolis, cenoura e abobrinha) temperados com azeite e ervas.',
      tags: ['Sem Glúten', 'Sem Lactose'],
      ...getChef(1),
    },
    {
      id: 'meal_mon_s',
      dayOfWeek: 'monday',
      mealType: 'snack',
      title: 'Vitamina de Banana e Morango com Aveia',
      description: 'Opção refrescante e nutritiva para o meio da tarde.',
      tags: ['Vegetariano', 'Rápido (<20min)'],
      ...getChef(2),
    },
    {
      id: 'meal_mon_d',
      dayOfWeek: 'monday',
      mealType: 'dinner',
      title: 'Creme de Mandioquinha com Croutons Crocantes',
      description: 'Sopa leve e reconfortante finalizada com noz-moscada.',
      tags: ['Vegetariano'],
      ...getChef(0),
    },
    // Terça
    {
      id: 'meal_tue_b',
      dayOfWeek: 'tuesday',
      mealType: 'breakfast',
      title: 'Iogurte Natural com Granola Caseira e Mel',
      tags: ['Vegetariano', 'Rápido (<20min)'],
      ...getChef(1),
    },
    {
      id: 'meal_tue_l',
      dayOfWeek: 'tuesday',
      mealType: 'lunch',
      title: 'Strogonoff de Cogumelos com Batata Rústica ao Forno',
      description: 'Molho cremoso com champignon e shimeji frescos, arroz branco e batatas com alecrim.',
      tags: ['Vegetariano', 'Especial da Casa'],
      ...getChef(2),
    },
    {
      id: 'meal_tue_s',
      dayOfWeek: 'tuesday',
      mealType: 'snack',
      title: 'Tapioca com Queijo Branco e Orégano',
      tags: ['Sem Glúten', 'Vegetariano', 'Rápido (<20min)'],
      ...getChef(0),
    },
    {
      id: 'meal_tue_d',
      dayOfWeek: 'tuesday',
      mealType: 'dinner',
      title: 'Salada Caesar Completa com Iscas Grelhadas',
      description: 'Alface romana, croutons, molho caesar e lascas de parmesão.',
      tags: ['Low Carb'],
      ...getChef(1),
    },
    // Quarta
    {
      id: 'meal_wed_b',
      dayOfWeek: 'wednesday',
      mealType: 'breakfast',
      title: 'Pão Francês na Chapa com Requeijão e Frutas',
      tags: ['Vegetariano', 'Rápido (<20min)'],
      ...getChef(2),
    },
    {
      id: 'meal_wed_l',
      dayOfWeek: 'wednesday',
      mealType: 'lunch',
      title: 'Salmão Grelhado com Purê de Mandioca e Brócolis',
      description: 'Salmão temperado com limão siciliano e ervas finas.',
      tags: ['Sem Glúten', 'Especial da Casa'],
      ...getChef(0),
    },
    {
      id: 'meal_wed_s',
      dayOfWeek: 'wednesday',
      mealType: 'snack',
      title: 'Bolo de Cenoura Integral com Cobertura de Cacau',
      tags: ['Vegetariano'],
      ...getChef(1),
    },
    {
      id: 'meal_wed_d',
      dayOfWeek: 'wednesday',
      mealType: 'dinner',
      title: 'Wrap de Atum com Ricota e Folhas Verdes',
      tags: ['Rápido (<20min)', 'Low Carb'],
      ...getChef(2),
    },
    // Quinta
    {
      id: 'meal_thu_b',
      dayOfWeek: 'thursday',
      mealType: 'breakfast',
      title: 'Panquecas Americanas Fofinhas com Frutas Vermelhas',
      tags: ['Vegetariano', 'Especial da Casa'],
      ...getChef(0),
    },
    {
      id: 'meal_thu_l',
      dayOfWeek: 'thursday',
      mealType: 'lunch',
      title: 'Macarrão ao Molho Pesto Genovês com Tomate Confit',
      description: 'Manjericão fresco colhido na horta da casa, azeite e nozes.',
      tags: ['Vegetariano', 'Rápido (<20min)'],
      ...getChef(1),
    },
    {
      id: 'meal_thu_s',
      dayOfWeek: 'thursday',
      mealType: 'snack',
      title: 'Mix de Castanhas Nobres e Frutas Secas',
      tags: ['Vegano', 'Sem Glúten', 'Sem Lactose'],
      ...getChef(2),
    },
    {
      id: 'meal_thu_d',
      dayOfWeek: 'thursday',
      mealType: 'dinner',
      title: 'Sopa Reconfortante de Lentilha com Legumes',
      tags: ['Vegano', 'Sem Glúten'],
      ...getChef(0),
    },
    // Sexta
    {
      id: 'meal_fri_b',
      dayOfWeek: 'friday',
      mealType: 'breakfast',
      title: 'Sanduíche Natural de Queijo Minas e Peito de Peru',
      tags: ['Rápido (<20min)'],
      ...getChef(1),
    },
    {
      id: 'meal_fri_l',
      dayOfWeek: 'friday',
      mealType: 'lunch',
      title: 'Feijoada Completa com Couve Refogada, Arroz e Farofa',
      description: 'Almoço especial de sexta-feira para celebrar a semana.',
      tags: ['Especial da Casa'],
      ...getChef(2),
    },
    {
      id: 'meal_fri_s',
      dayOfWeek: 'friday',
      mealType: 'snack',
      title: 'Salada de Frutas com Laranja, Melancia e Melão',
      tags: ['Vegano', 'Sem Glúten', 'Sem Lactose'],
      ...getChef(0),
    },
    {
      id: 'meal_fri_d',
      dayOfWeek: 'friday',
      mealType: 'dinner',
      title: 'Noite da Pizza Artesanal da Residência',
      description: 'Montagem de pizzas pelos moradores com sabores variados.',
      tags: ['Especial da Casa'],
      ...getChef(1),
    },
    // Sábado
    {
      id: 'meal_sat_b',
      dayOfWeek: 'saturday',
      mealType: 'breakfast',
      title: 'Brunch da Casa: Waffles, Frutas, Ovos e Café',
      tags: ['Especial da Casa'],
      ...getChef(2),
    },
    {
      id: 'meal_sat_l',
      dayOfWeek: 'saturday',
      mealType: 'lunch',
      title: 'Risoto de Alho-Poró com Parmesão e Limão Siciliano',
      tags: ['Vegetariano', 'Especial da Casa'],
      ...getChef(0),
    },
    {
      id: 'meal_sat_s',
      dayOfWeek: 'saturday',
      mealType: 'snack',
      title: 'Smoothie de Açaí com Banana e Granola',
      tags: ['Vegano'],
      ...getChef(1),
    },
    {
      id: 'meal_sat_d',
      dayOfWeek: 'saturday',
      mealType: 'dinner',
      title: 'Hambúrguer Artesanal com Batatas Rústicas Assadas',
      tags: ['Especial da Casa'],
      ...getChef(2),
    },
    // Domingo
    {
      id: 'meal_sun_b',
      dayOfWeek: 'sunday',
      mealType: 'breakfast',
      title: 'Café Colonial da Manhã Compartilhado',
      tags: ['Especial da Casa'],
      ...getChef(0),
    },
    {
      id: 'meal_sun_l',
      dayOfWeek: 'sunday',
      mealType: 'lunch',
      title: 'Lasanha Especial de Berinjela e Abobrinha com Queijo',
      tags: ['Vegetariano', 'Especial da Casa'],
      ...getChef(1),
    },
    {
      id: 'meal_sun_s',
      dayOfWeek: 'sunday',
      mealType: 'snack',
      title: 'Torta de Maçã Quentinha com Canela',
      tags: ['Vegetariano'],
      ...getChef(2),
    },
    {
      id: 'meal_sun_d',
      dayOfWeek: 'sunday',
      mealType: 'dinner',
      title: 'Omelete de Ervas Finas com Queijo e Salada Verde',
      tags: ['Low Carb', 'Sem Glúten', 'Rápido (<20min)'],
      ...getChef(0),
    },
  ];

  return {
    houseId,
    isLocked: false,
    meals: defaultMeals,
  };
}

