import React from 'react';
import { FamilyMember } from '../../../types';

interface StatisticsViewProps {
  familyMembers: FamilyMember[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ familyMembers }) => {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#16302e]">House Performance Statistics</h2>
        <p className="text-xs text-[#727877] mt-1">Chore distribution and member activity scoreboards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-[#d9e5e3] shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#16302e]">Task Completion Leaderboard</h3>
          <div className="space-y-4">
            {familyMembers.map((member, idx) => {
              const score = [98, 88, 76, 50][idx] || 60;
              return (
                <div key={member.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold text-[#131e1d]">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                      <span>{member.name}</span>
                    </div>
                    <span className="text-[#7b5800] font-bold">{score}% ({score / 2} tasks)</span>
                  </div>
                  <div className="w-full bg-[#e4f0ee] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#16302e] h-full rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#d9e5e3] shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#16302e]">Environmental Impact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#eaf6f4] rounded-xl border border-[#d0dddb]">
              <span className="material-symbols-outlined text-2xl text-emerald-700">eco</span>
              <p className="text-xs font-bold text-[#727877] mt-2 uppercase">CO2 Reduction</p>
              <p className="text-2xl font-black text-[#16302e] mt-1">18.4 kg</p>
            </div>
            <div className="p-4 bg-[#eaf6f4] rounded-xl border border-[#d0dddb]">
              <span className="material-symbols-outlined text-2xl text-blue-700">water_drop</span>
              <p className="text-xs font-bold text-[#727877] mt-2 uppercase">Water Saved</p>
              <p className="text-2xl font-black text-[#16302e] mt-1">140 L</p>
            </div>
          </div>
          <p className="text-xs text-[#414847] leading-relaxed pt-2">
            Automated eco-mode thermostat adjustments and water heater suspensions during Vacation Mode saved an estimated $42 this billing cycle.
          </p>
        </div>
      </div>
    </div>
  );
};
