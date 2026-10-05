import React, { useState } from 'react';
import { ArrowRight, GraduationCap, HeartPulse, Briefcase, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import heroVisual from '../../assets/images/hero_guidance_education_business_1790222125018.jpg';

export interface HeroSectionProps {
  onNavigate: (page: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [activePathway, setActivePathway] = useState<'education' | 'health' | 'consulting'>('education');

  const pathwayDetails = {
    education: {
      tag: 'University & Online Learning',
      desc: 'Guidance for university admissions, degree programs, and global online learning certifications.',
      actionPage: 'education',
    },
    health: {
      tag: 'Medical Tourism & Hospital Solutions',
      desc: 'Accredited international hospital admissions, specialist second opinions, and patient concierge.',
      actionPage: 'health',
    },
    consulting: {
      tag: 'Custom Business Advisory',
      desc: 'Actionable business strategy, capacity building, and organizational transformation.',
      actionPage: 'consulting',
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAFBFD] via-[#F3F5FA] to-[#EAEFF8] dark:from-[#111638] dark:via-[#141A44] dark:to-[#0D1233] text-[#171A2B] dark:text-white pt-12 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-8 lg:px-16 border-b border-[#D8DFEE] dark:border-[#202754] transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-[#FF7817]/8 dark:bg-[#FF7817]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[500px] h-[500px] bg-[#3B82F6]/6 dark:bg-[#1E266D]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Copy & Messaging (Span 7) */}
          <div className="lg:col-span-7 space-y-7">
            {/* Kicker / Eyebrow from User Brief */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFF4EC] dark:bg-white/5 border border-[#FF7817]/30 dark:border-white/10 text-xs sm:text-sm font-semibold text-[#D95F06] dark:text-[#FF7817] tracking-wide shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#FF7817] shrink-0" />
              <span>From Education & Work, To Spirituality & Citizenry. Decades of experience.</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-1">
              <h1
                className="font-heading text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight leading-[1.08] text-[#151A46] dark:text-white transition-colors"
                style={{ textWrap: 'balance' }}
              >
                Your Goals. Our Guidance.{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF7817] via-[#E86909] to-[#FF9240] dark:from-[#FF7817] dark:via-[#FF9240] dark:to-[#FFB77A]">
                  Real Results. YOUR LIFE.
                </span>
              </h1>
            </div>

            {/* User Narrative Paragraph */}
            <p className="text-base sm:text-lg text-[#4F566B] dark:text-[#C8CFE2] leading-relaxed max-w-2xl font-normal transition-colors">
              Whether you’re starting your university journey, exploring online learning, or planning to import goods for your business we’re here to help. Our expert consulting is tailored to your goals, offering clear guidance and practical solutions every step of the way. Let’s turn your vision into reality.
            </p>

            {/* Primary CTA Button */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#FF7817] to-[#E66606] hover:from-[#E66606] hover:to-[#D15500] rounded-xl shadow-[0_4px_25px_rgba(255,120,23,0.38)] hover:shadow-[0_8px_30px_rgba(255,120,23,0.52)] active:scale-98 transition-all cursor-pointer"
              >
                <span>Start Here Now</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('consulting')}
                className="inline-flex items-center gap-2 px-6 py-4 text-sm font-bold text-[#151A46] dark:text-white bg-white dark:bg-white/5 hover:bg-[#EEF1F8] dark:hover:bg-white/10 border border-[#CBD3E3] dark:border-white/15 rounded-xl hover:border-[#FF7817]/40 dark:hover:border-white/30 shadow-xs transition-all cursor-pointer"
              >
                <span>Explore Consulting</span>
              </button>
            </div>

            {/* Interactive Pathways mentioned in the copy */}
            <div className="pt-4 border-t border-[#DCE2EE] dark:border-white/10 space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6B7388] dark:text-[#8A90A2] block">
                Choose your focus area to begin:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActivePathway('education');
                    onNavigate('education');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    activePathway === 'education'
                      ? 'bg-[#FFF4EC] dark:bg-[#FF7817]/15 border-[#FF7817] dark:border-[#FF7817]/50 text-[#151A46] dark:text-white shadow-xs'
                      : 'bg-white dark:bg-white/5 border-[#DCE2EE] dark:border-white/10 text-[#474F64] dark:text-[#C5CCE0] hover:bg-[#F4F6FC] dark:hover:bg-white/10 hover:border-[#FF7817]/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#FF7817]" />
                    <span className="text-xs font-semibold">University & Learning</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePathway('health');
                    onNavigate('health');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    activePathway === 'health'
                      ? 'bg-[#FFF4EC] dark:bg-[#FF7817]/15 border-[#FF7817] dark:border-[#FF7817]/50 text-[#151A46] dark:text-white shadow-xs'
                      : 'bg-white dark:bg-white/5 border-[#DCE2EE] dark:border-white/10 text-[#474F64] dark:text-[#C5CCE0] hover:bg-[#F4F6FC] dark:hover:bg-white/10 hover:border-[#FF7817]/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-[#FF7817]" />
                    <span className="text-xs font-semibold">Health & Medical</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePathway('consulting');
                    onNavigate('consulting');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    activePathway === 'consulting'
                      ? 'bg-[#FFF4EC] dark:bg-[#FF7817]/15 border-[#FF7817] dark:border-[#FF7817]/50 text-[#151A46] dark:text-white shadow-xs'
                      : 'bg-white dark:bg-white/5 border-[#DCE2EE] dark:border-white/10 text-[#474F64] dark:text-[#C5CCE0] hover:bg-[#F4F6FC] dark:hover:bg-white/10 hover:border-[#FF7817]/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#FF7817]" />
                    <span className="text-xs font-semibold">Expert Consulting</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset (Span 5) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D8DFEE] dark:border-white/15 shadow-[0_20px_50px_rgba(21,26,70,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] aspect-16/11 group">
              <img
                src={heroVisual}
                alt="Your Goals, Our Guidance, Real Results"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111638]/70 via-transparent to-transparent opacity-70 dark:opacity-80" />

              {/* Glassmorphic Trust Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 dark:bg-[#111638]/90 backdrop-blur-md border border-[#E2E6EF] dark:border-white/15 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#151A46] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7817]" />
                    <span>Decades of Experience</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#FF7817]/15 dark:bg-[#FF7817]/20 text-[#D95F06] dark:text-[#FF7817] border border-[#FF7817]/30">
                    Trusted Advisory
                  </span>
                </div>
                <p className="text-[12px] text-[#525B73] dark:text-[#AAB2CA] leading-snug font-normal">
                  Tailored guidance and practical solutions turning your vision into reality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
