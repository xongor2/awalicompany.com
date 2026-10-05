import React from 'react';
import {
  Compass,
  FileCheck2,
  Workflow,
  CheckCircle,
  Shield,
} from 'lucide-react';

export interface MethodologySectionProps {
  onNavigate: (page: string) => void;
}

export const MethodologySection: React.FC<MethodologySectionProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Strategic Audit & Goal Alignment',
      description:
        'We conduct a thorough needs assessment across education criteria, commercial shipping requirements, or investment horizons to eliminate blind spots.',
      points: [
        'Institutional profile evaluation',
        'Feasibility & risk mapping',
        'Direct consultation with senior leadership',
      ],
      icon: Compass,
    },
    {
      step: '02',
      title: 'Compliance & Cross Border Structuring',
      description:
        'Navigating complex international jurisdictions, university admission standards, and customs clearance protocols with rigorous legal compliance.',
      points: [
        'Document verification & attestation',
        'Customs & tariffs optimization',
        'Accreditation alignment',
      ],
      icon: FileCheck2,
    },
    {
      step: '03',
      title: 'Precision Execution & Logistics',
      description:
        'Mobilizing our global logistics network, institutional admissions pipelines, and property brokerage teams for rapid and dependable delivery.',
      points: [
        'Milestone based progress monitoring',
        'Direct port & campus coordination',
        'Transparent transaction records',
      ],
      icon: Workflow,
    },
    {
      step: '04',
      title: 'Sustained Value & Post Delivery Support',
      description:
        'Our engagement extends beyond initial delivery with student welfare tracking, trade expansion consulting, and asset tenancy management.',
      points: [
        'Continuous advisory access',
        'Secondary market liquidation support',
        'Long term client partnership',
      ],
      icon: CheckCircle,
    },
  ];

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-white dark:bg-[#0B1033] transition-colors border-b border-[#E2E6EF] dark:border-[#1E2554]">
      <div className="max-w-[1360px] mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7817]">
            <Shield className="w-3.5 h-3.5" />
            <span>The Enterprise Advantage</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#151A46] dark:text-white tracking-tight leading-tight">
            How We Deliver Predictable, Institutional-Grade Outcomes
          </h2>
          <p className="text-base sm:text-lg text-[#555E78] dark:text-[#BAC3DC] leading-relaxed">
            From cross-continental cargo to prestigious degree enrollments, AW Ali Company operates
            under a disciplined four-stage execution methodology.
          </p>
        </div>

        {/* 4-Step Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col justify-between p-7 rounded-2xl bg-[#F8FAFD] dark:bg-white/[0.02] border border-[#E5EAF3] dark:border-white/10 hover:border-[#FF7817]/40 dark:hover:border-[#FF7817]/40 transition-all duration-300 group"
              >
                {/* Number Watermark */}
                <span className="font-heading text-5xl font-black text-[#E1E7F2] dark:text-white/5 select-none absolute top-4 right-5 group-hover:text-[#FF7817]/20 transition-colors">
                  {item.step}
                </span>

                <div className="space-y-4 relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/10 border border-[#E2E6EF] dark:border-white/10 flex items-center justify-center text-[#FF7817] shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white leading-snug group-hover:text-[#FF7817] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#5D657E] dark:text-[#AAB2CA] leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E8EDF5] dark:border-white/5 space-y-2 relative z-10">
                  {item.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-[#3E4560] dark:text-[#C5CCE0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF7817] mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
