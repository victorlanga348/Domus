import React, { useState, useEffect, useCallback } from 'react';
import { statisticsApi, type HouseStatisticsData, type MemberContribution, type HarmonyScoreDetails } from '../api/statisticsApi.js';
import { FamilyMember, HouseTask, ActivityLog } from '../../../types';
import { AnimatedCounter } from './AnimatedCounter.js';
import { StatisticsSkeleton } from '../../../components/index.js';

interface StatisticsViewProps {
  currentHouseId?: string;
  currentUserId?: string;
  familyMembers?: FamilyMember[];
  tasks?: HouseTask[];
  activityLogs?: ActivityLog[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  currentHouseId = 'house-1',
  currentUserId = 'user-1',
  familyMembers = [],
  tasks = [],
  activityLogs = [],
}) => {
  const [stats, setStats] = useState<HouseStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCountComplete, setIsCountComplete] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Motor dinâmico de cálculo de estatísticas a partir do estado local
  const computeLocalStatistics = useCallback((): HouseStatisticsData => {
    const now = new Date();
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const blockedTasks = tasks.filter((t) => t.status === 'alert');
    const totalCompleted = completedTasks.length;

    // Contagem de conclusões por membro
    const completedPerMember = new Map<string, number>();
    familyMembers.forEach((m) => {
      completedPerMember.set(m.id, 0);
      completedPerMember.set(m.name, 0);
    });

    completedTasks.forEach((t) => {
      let matched = false;
      if (t.completedById && completedPerMember.has(t.completedById)) {
        completedPerMember.set(t.completedById, (completedPerMember.get(t.completedById) || 0) + 1);
        matched = true;
      } else if (t.completedBy && completedPerMember.has(t.completedBy)) {
        completedPerMember.set(t.completedBy, (completedPerMember.get(t.completedBy) || 0) + 1);
        matched = true;
      } else if (t.nextMember && completedPerMember.has(t.nextMember)) {
        completedPerMember.set(t.nextMember, (completedPerMember.get(t.nextMember) || 0) + 1);
        matched = true;
      }

      if (!matched && familyMembers.length > 0) {
        const fallbackId = currentUserId || familyMembers[0].id;
        completedPerMember.set(fallbackId, (completedPerMember.get(fallbackId) || 0) + 1);
      }
    });

    const contributions: MemberContribution[] = familyMembers.map((member) => {
      const userCompleted = (completedPerMember.get(member.id) || 0) + (completedPerMember.get(member.name) || 0);
      const percentage = totalCompleted > 0 ? Math.round((userCompleted / totalCompleted) * 100) : 0;
      return {
        user_id: member.id,
        name: member.name,
        avatar: member.avatar,
        completed_count: userCompleted,
        percentage,
      };
    }).sort((a, b) => b.completed_count - a.completed_count);

    const topContributor = contributions.length > 0 && contributions[0].completed_count > 0
      ? contributions[0]
      : null;

    const totalBlocked = blockedTasks.length;
    const totalInteractions = totalCompleted + totalBlocked;
    let completionRate = 1.0;
    let harmonyScore = 100;

    if (totalInteractions > 0) {
      completionRate = totalCompleted / totalInteractions;
      const penalty = (totalBlocked * 10) / totalInteractions;
      harmonyScore = Math.max(0, Math.min(100, Math.round(completionRate * 100 - penalty)));
    }

    let levelLabel = 'Excelente';
    if (harmonyScore < 50) levelLabel = 'Crítica';
    else if (harmonyScore < 75) levelLabel = 'Atenção';
    else if (harmonyScore < 90) levelLabel = 'Boa';

    const harmony: HarmonyScoreDetails = {
      score: harmonyScore,
      total_completed: totalCompleted,
      total_failed: 0,
      total_blocked: totalBlocked,
      completion_rate: Math.round(completionRate * 100) / 100,
      level_label: levelLabel,
    };

    const shiftDistribution = {
      MORNING: tasks.filter((t) => t.period === 'morning').length,
      AFTERNOON: tasks.filter((t) => t.period === 'afternoon').length,
      NIGHT: tasks.filter((t) => t.period === 'night').length,
    };

    return {
      house: {
        id: currentHouseId,
        name: 'Minha Residência',
      },
      period: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      harmony,
      top_contributor: topContributor,
      contributions,
      shift_distribution: shiftDistribution,
    };
  }, [tasks, familyMembers, currentHouseId, currentUserId]);

  const fetchStats = useCallback(async () => {
    const local = computeLocalStatistics();
    try {
      setIsRefreshing(true);
      setIsCountComplete(false);
      const data = await statisticsApi.getStatistics(currentHouseId, currentUserId);
      if (data) {
        const enrichedContributions = (data.contributions || []).map((c) => {
          const member = familyMembers.find((m) => m.id === c.user_id || m.name === c.name);
          return {
            ...c,
            avatar: c.avatar || member?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`,
          };
        });

        const enrichedTop = data.top_contributor
          ? {
              ...data.top_contributor,
              avatar:
                data.top_contributor.avatar ||
                familyMembers.find((m) => m.id === data.top_contributor?.user_id)?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.top_contributor.name)}`,
            }
          : null;

        setStats({
          ...data,
          contributions: enrichedContributions,
          top_contributor: enrichedTop,
        });
      } else {
        setStats(local);
      }
    } catch {
      setStats(local);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setAnimKey((prev) => prev + 1);
    }
  }, [currentHouseId, currentUserId, familyMembers, computeLocalStatistics]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Atualiza reativamente se tarefas mudarem e não houver dados ainda
  useEffect(() => {
    const local = computeLocalStatistics();
    setStats((prev) => {
      if (!prev) return local;
      return prev;
    });
  }, [computeLocalStatistics]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentMonthName = stats ? monthNames[stats.period.month - 1] : 'Mês Atual';

  if (loading && !stats) {
    return <StatisticsSkeleton />;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#d9e5e3] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffca5e] text-[#755400] flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-2xl">monitoring</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#16302e]">
              Estatísticas & Índice de Harmonia
            </h1>
            <p className="text-xs text-[#727877] mt-0.5">
              Métricas de colaboração e divisão justa de tarefas • {currentMonthName} de {stats?.period.year || 2026}
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={isRefreshing}
          className="self-start sm:self-auto px-4 py-2 bg-[#f0fcfa] hover:bg-[#e0f5f2] active:scale-[0.97] text-[#16302e] border border-[#c1c8c6] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <span className={`material-symbols-outlined text-base ${isRefreshing ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Índice de Harmonia */}
          <div className="bg-white p-6 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#727877]">
                  Saúde da Convivência
                </span>
                <span
                  className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-all duration-500 ease-out transform ${
                    isCountComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  } ${
                    (stats?.harmony.score ?? 100) >= 80
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : (stats?.harmony.score ?? 100) >= 60
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {stats?.harmony.level_label || 'Excelente'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black text-[#16302e] tabular-nums">
                  <AnimatedCounter
                    value={stats?.harmony.score ?? 100}
                    duration={1200}
                    animKey={animKey}
                    onComplete={() => setIsCountComplete(true)}
                  />
                </span>
                <span className="text-sm font-bold text-[#727877]">/ 100 pts</span>
              </div>

              <p className="text-xs text-[#727877] mt-2 leading-relaxed">
                Pontuação calculada com base na taxa de conclusão ({Math.round((stats?.harmony.completion_rate ?? 1) * 100)}%), sem bloqueios ou atrasos acumulados.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#f0f4f3] text-center">
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Concluídas</p>
                <p className="text-base font-black text-emerald-900 mt-0.5 tabular-nums">
                  <AnimatedCounter
                    value={stats?.harmony.total_completed ?? 0}
                    duration={1000}
                    delay={100}
                    animKey={animKey}
                  />
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-bold text-amber-700 uppercase">Bloqueios</p>
                <p className="text-base font-black text-amber-900 mt-0.5 tabular-nums">
                  <AnimatedCounter
                    value={stats?.harmony.total_blocked ?? 0}
                    duration={1000}
                    delay={100}
                    animKey={animKey}
                  />
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200">
                <p className="text-[10px] font-bold text-rose-700 uppercase">Falhas</p>
                <p className="text-base font-black text-rose-900 mt-0.5 tabular-nums">
                  <AnimatedCounter
                    value={stats?.harmony.total_failed ?? 0}
                    duration={1000}
                    delay={100}
                    animKey={animKey}
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Maior Contribuidor & Turnos */}
          <div className="space-y-6">
            {/* Destaque do Mês */}
            <div className="bg-white p-6 rounded-3xl border border-[#d9e5e3] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff8e6] border border-[#ffca5e] text-[#7b5800] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">trophy</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#727877] uppercase tracking-wider">
                    Maior Contribuidor do Mês
                  </h3>
                  <p className="text-base font-black text-[#16302e] mt-0.5">
                    {stats?.top_contributor?.name || 'Aguardando conclusões'}
                  </p>
                </div>
              </div>
              {stats?.top_contributor && (
                <div className="mt-3 pt-3 border-t border-[#f0f4f3] flex items-center justify-between text-xs text-[#727877]">
                  <span>Total de tarefas concluídas:</span>
                  <span className="font-black text-[#7b5800]">
                    {stats.top_contributor.completed_count} tarefas ({stats.top_contributor.percentage}%)
                  </span>
                </div>
              )}
            </div>

            {/* Distribuição por Turno */}
            <div className="bg-white p-6 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#727877] uppercase tracking-wider">
                Distribuição de Tarefas por Turno
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-[#f0fcfa] border border-[#d0dddb] text-center">
                  <span className="material-symbols-outlined text-amber-600 text-lg">light_mode</span>
                  <p className="text-[10px] font-bold text-[#727877] mt-1">Manhã</p>
                  <p className="text-sm font-black text-[#16302e]">{stats?.shift_distribution.MORNING ?? 0}</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#f0fcfa] border border-[#d0dddb] text-center">
                  <span className="material-symbols-outlined text-orange-600 text-lg">wb_sunny</span>
                  <p className="text-[10px] font-bold text-[#727877] mt-1">Tarde</p>
                  <p className="text-sm font-black text-[#16302e]">{stats?.shift_distribution.AFTERNOON ?? 0}</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#f0fcfa] border border-[#d0dddb] text-center">
                  <span className="material-symbols-outlined text-indigo-600 text-lg">bedtime</span>
                  <p className="text-[10px] font-bold text-[#727877] mt-1">Noite</p>
                  <p className="text-sm font-black text-[#16302e]">{stats?.shift_distribution.NIGHT ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Ranking de Contribuição por Morador */}
          <div className="bg-white p-6 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#16302e]">
              Quadro de Contribuição dos Moradores
            </h3>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {(stats?.contributions || []).length === 0 ? (
                <p className="text-xs text-[#727877] text-center py-6">
                  Nenhum registro de tarefa concluída este mês.
                </p>
              ) : (
                stats?.contributions.map((member, idx) => {
                  const matchingAvatar = familyMembers.find((m) => m.name === member.name)?.avatar;

                  return (
                    <div key={member.user_id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-[#16302e]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-[11px] font-black text-[#727877]">#{idx + 1}</span>
                          {matchingAvatar ? (
                            <img src={matchingAvatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#e4f0ee] text-[#16302e] flex items-center justify-center text-[10px] font-black">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <span>{member.name}</span>
                        </div>
                        <span className="text-[#7b5800]">
                          {member.percentage}% ({member.completed_count} {member.completed_count === 1 ? 'tarefa' : 'tarefas'})
                        </span>
                      </div>

                      <div className="w-full bg-[#e4f0ee] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#7b5800] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(member.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
