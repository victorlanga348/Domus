import { APP_CONFIG } from '../../../config/constants.js';

export interface MemberContribution {
  user_id: string;
  name: string;
  avatar?: string;
  completed_count: number;
  percentage: number;
}

export interface HarmonyScoreDetails {
  score: number;
  total_completed: number;
  total_failed: number;
  total_blocked: number;
  completion_rate: number;
  level_label: string;
}

export interface HouseStatisticsData {
  house: {
    id: string;
    name: string;
  };
  period: {
    month: number;
    year: number;
  };
  harmony: HarmonyScoreDetails;
  top_contributor: MemberContribution | null;
  contributions: MemberContribution[];
  shift_distribution: {
    MORNING: number;
    AFTERNOON: number;
    NIGHT: number;
  };
}

export const statisticsApi = {
  async getStatistics(houseId: string, userId?: string): Promise<HouseStatisticsData | null> {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/v1/statistics`, {
        headers: {
          'x-house-id': houseId,
          ...(userId ? { 'x-user-id': userId } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas');
      }

      const json = await response.json();
      return json.data;
    } catch (error) {
      console.warn('[StatisticsApi] Usando fallback local:', error);
      return null;
    }
  },
};
