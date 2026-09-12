import { prisma } from '../../database/prisma.js';

export class MealsRepository {
  async findByHouseId(houseId: string) {
    return prisma.mealPlan.findUnique({
      where: { house_id: houseId },
      include: {
        meals: {
          orderBy: { created_at: 'asc' },
        },
        locked_by: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async ensureMealPlan(houseId: string) {
    return prisma.mealPlan.upsert({
      where: { house_id: houseId },
      create: {
        house_id: houseId,
        is_locked: false,
      },
      update: {},
      include: {
        meals: true,
        locked_by: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async saveMealItem(
    mealPlanId: string,
    data: {
      id?: string;
      dayOfWeek: string;
      mealType: string;
      title: string;
      description?: string;
      tags?: string[];
      updatedBy?: string;
    }
  ) {
    if (data.id) {
      const existing = await prisma.mealItem.findUnique({ where: { id: data.id } });
      if (existing) {
        return prisma.mealItem.update({
          where: { id: data.id },
          data: {
            day_of_week: data.dayOfWeek,
            meal_type: data.mealType,
            title: data.title,
            description: data.description,
            tags_json: data.tags ? JSON.stringify(data.tags) : null,
            updated_by: data.updatedBy,
          },
        });
      }
    }

    return prisma.mealItem.create({
      data: {
        meal_plan_id: mealPlanId,
        day_of_week: data.dayOfWeek,
        meal_type: data.mealType,
        title: data.title,
        description: data.description,
        tags_json: data.tags ? JSON.stringify(data.tags) : null,
        updated_by: data.updatedBy,
      },
    });
  }

  async deleteMealItem(id: string) {
    return prisma.mealItem.delete({
      where: { id },
    });
  }

  async clearAllMeals(mealPlanId: string) {
    return prisma.mealItem.deleteMany({
      where: { meal_plan_id: mealPlanId },
    });
  }

  async setLock(mealPlanId: string, isLocked: boolean, lockedById?: string) {
    return prisma.mealPlan.update({
      where: { id: mealPlanId },
      data: {
        is_locked: isLocked,
        locked_by_id: isLocked ? lockedById : null,
        locked_at: isLocked ? new Date() : null,
      },
      include: {
        meals: true,
        locked_by: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async updateSchedules(mealPlanId: string, schedulesJson: string) {
    return prisma.mealPlan.update({
      where: { id: mealPlanId },
      data: {
        schedules_json: schedulesJson,
      },
      include: {
        meals: true,
        locked_by: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });
  }
}
