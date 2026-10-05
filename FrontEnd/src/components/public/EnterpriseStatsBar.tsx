import React from 'react';
import {
  GraduationCap,
  Ship,
  Building2,
  Award,
  Globe2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const EnterpriseStatsBar: React.FC = () => {
  const stats = [
    {
      icon: GraduationCap,
      value: '1,500+',
      label: 'Students Placed Globally',
      detail: 'Across premier accredited universities in 12+ nations',
    },
    {
      icon: Ship,
      value: '$25M+',
      label: 'Facilitated Trade & Cargo',
      detail: 'Secure cross border logistics & commercial goods clearance',
    },
    {
      icon: Building2,
      value: '120+',
      label: 'Prime Real Estate Assets',
      detail: 'High yield commercial hubs, luxury villas & development plots',
    },
    {
      icon: Award,
      value: '15+ Years',
      label: 'Institutional Track Record',
      detail: 'Uncompromising corporate governance & strategic advisory',
    },
  ];

  return (
    <section className="relative w-full bg-white dark:bg-[#0B1033] border-y border-[#E2E6EF] dark:border-[#1E2554] transition-colors py-12 px-4 sm:px-8 lg:px-16">
      <div className="max-w-[1360px] mx-auto space-y-10">
        {/* Top Trust Line */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#EDF1F7] dark:border-[#1A2250] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF7817]/10 dark:bg-[#FF7817]/15 flex items-center justify-center text-[#FF7817]">
              <Globe2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#151A46] dark:text-white">
                Global Enterprise Ecosystem
              </p>
              <p className="text-[11px] text-[#6E7792] dark:text-[#A0ABC6]">
                Operating across East Africa, Middle East, Europe & South Asia
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#5D657E] dark:text-[#BAC3DC] font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF7817]" />
              <span>100% Regulatory Compliance</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#FF7817]" />
              <span>Multi Sector Portfolio</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF7817] animate-pulse" />
              <span>Active Strategic Operations</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Quantitative Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col justify-between p-6 rounded-2xl bg-[#F8FAFD] dark:bg-white/[0.03] border border-[#E5EAF3] dark:border-white/10 hover:border-[#FF7817]/40 dark:hover:border-[#FF7817]/40 transition-all duration-300 group"
              >
                {/* Accent Top hairline */}
                <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#FF7817]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-[#E2E6EF] dark:border-white/10 flex items-center justify-center text-[#FF7817] shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-3xl sm:text-4xl font-black text-[#151A46] dark:text-white tracking-tight group-hover:text-[#FF7817] transition-colors">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-bold text-[#2A3258] dark:text-[#E0E5F5] mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#6A738F] dark:text-[#9EA8C4] leading-relaxed mt-4 pt-3 border-t border-[#E8EDF5] dark:border-white/5 font-normal">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
