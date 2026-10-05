import React from 'react';
import {
  Sparkles,
  ChevronRight,
  Target,
  Compass,
  CheckCircle2,
  Award,
  Globe2,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Phone,
  MessageCircle,
} from 'lucide-react';

export interface OurStoryPageProps {
  onNavigateHome: () => void;
  onNavigate: (page: string) => void;
}

export const OurStoryPage: React.FC<OurStoryPageProps> = ({
  onNavigateHome,
  onNavigate,
}) => {
  return (
    <div className="w-full bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full bg-gradient-to-b from-[#FAFBFD] via-[#F2F5FB] to-[#E9EFF8] dark:from-[#111638] dark:via-[#141A44] dark:to-[#0D1233] text-[#171A2B] dark:text-white py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden border-b border-[#D8DFEE] dark:border-[#202754] transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF7817]/20 via-transparent to-[#FF7817]/5 opacity-40 dark:opacity-80 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF7817]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2]">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-[#5F667A] dark:text-[#D9DDE8] hover:text-[#FF7817] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A90A2]" />
            <span className="text-[#5F667A] dark:text-[#D9DDE8]">About Us</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A90A2]" />
            <span className="text-[#FF7817]">Our Story</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7817]/15 dark:bg-[#FF7817]/20 border border-[#FF7817]/30 dark:border-[#FF7817]/40 text-xs font-bold text-[#FF7817] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Who We Are • About Us</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[#171A2B] dark:text-white tracking-tight leading-tight">
              AW Ali Company
            </h1>

            <p className="text-base sm:text-lg text-[#5F667A] dark:text-[#D9DDE8] leading-relaxed max-w-2xl font-normal">
              An innovative and reliable organization providing services in various fields such as consultancy, Education, training, foreign trade, import and export, and product sales.
            </p>
          </div>
        </div>
      </section>

      {/* Main Narrative Section: Who We Are & About Us */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-16 sm:py-20 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Who We Are Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7817]/10 dark:bg-[#FF7817]/20 text-xs font-bold text-[#D95F06] dark:text-[#FF7817] uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>About Us</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#151A46] dark:text-white leading-tight">
              A Solution Partner Adding Sustainable Value Across Sectors
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              <p>
                <strong className="text-[#151A46] dark:text-white font-semibold">
                  AW Ali Company
                </strong>{' '}
                is an innovative and reliable organization providing services in various fields such as consultancy, Education, training, foreign trade, import and export, and product sales. In all sectors in which it operates, our company adopts quality, honesty, and sustainability as core principles, working with the goal of adding value to individuals and institutions.
              </p>

              <p>
                With its experience gained from different sectors, AW Ali not only offers services to its clients but also aims to be a solution partner. Through our training programs, professional consultancy services, and domestic and international trade network, we create a strong sphere of influence.
              </p>
            </div>

            {/* Core Pillars Bullet Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817]">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                  Quality & Honesty
                </h4>
                <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA]">
                  Uncompromising ethical standards and execution precision.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                  Sustainability
                </h4>
                <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA]">
                  Long term client partnerships and durable commercial growth.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817]">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                  Global Influence
                </h4>
                <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA]">
                  Strategic presence bridging East Africa, Turkey, and international markets.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#E2E6EF] dark:border-[#202754] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80"
                alt="AW Ali Headquarters & Corporate Centers"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151A46]/90 via-[#151A46]/30 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider">
                  Established Excellence
                </span>
                <h3 className="font-heading text-xl font-bold text-white">
                  AW Ali Company Hub
                </h3>
                <p className="text-xs text-white/80">
                  Empowering corporate growth, global student placements, and transparent cross border trade operations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Cards (User Required Exact Verbiage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {/* OUR VISION */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#111638] border-2 border-[#FF7817]/30 shadow-md relative overflow-hidden space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817]">
              <Compass className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#FF7817] uppercase tracking-wider block">
                Guiding Direction
              </span>
              <h3 className="font-heading text-2xl font-black text-[#151A46] dark:text-white uppercase tracking-tight">
                OUR VISION
              </h3>
            </div>

            <p className="text-base text-[#5F667A] dark:text-[#D9DDE8] leading-relaxed font-medium">
              To become one of the leading brands in consultancy, education, and foreign trade by being a globally recognized, trusted, and multifunctional service provider.
            </p>
          </div>

          {/* OUR MISSION */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#111638] border-2 border-blue-500/30 shadow-md relative overflow-hidden space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Target className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-blue-500 uppercase tracking-wider block">
                Core Purpose
              </span>
              <h3 className="font-heading text-2xl font-black text-[#151A46] dark:text-white uppercase tracking-tight">
                OUR MISSION
              </h3>
            </div>

            <ul className="space-y-3 text-base text-[#5F667A] dark:text-[#D9DDE8] font-medium">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF7817] shrink-0 mt-0.5" />
                <span>
                  To offer our clients high-quality, transparent, and sustainable services.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  To contribute to the development of individuals and institutions in the fields of education and consultancy.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sectors of Operation Navigation Hub */}
        <div className="space-y-6 pt-10 border-t border-[#E2E6EF] dark:border-[#202754]">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider">
              Diverse Operational Spectrum
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#151A46] dark:text-white">
              Sectors in Which We Operate
            </h3>
            <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA]">
              Adopting quality, honesty, and sustainability across every touchpoint.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Sector 1: Consultancy */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-2xs hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
                Consultancy & Advisory
              </h4>
              <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
                Strategic corporate management, institutional structuring, regulatory audits, and emerging market feasibility.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('consulting')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Consulting</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sector 2: Education */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-2xs hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#151A46]/10 dark:bg-[#151A46]/40 flex items-center justify-center text-[#151A46] dark:text-[#FF7817]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
                Education & Training
              </h4>
              <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
                International student placement, overseas university admissions, scholarships, and professional capability training.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('education')}
                className="text-xs font-bold text-[#FF7817] hover:text-[#e6690f] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Education</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sector 3: Foreign Trade (Import-Export) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-2xs hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817]">
                <Globe2 className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
                Foreign Trade, Import and Export
              </h4>
              <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
                Global supply chains, customs clearance, freight forwarding, tariff optimization, and cross border logistics.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('health')}
                className="text-xs font-bold text-[#FF7817] hover:text-[#D95F06] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Health & Medical</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sector 4: Real Estate & Sales */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-2xs hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
                Real Estate & Product Sales
              </h4>
              <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
                Turnkey residential villas, commercial complexes, asset acquisitions, and premium verified property sales.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('real-estate')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Properties</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-[#151A46] text-white p-8 sm:p-12 border border-[#202754] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-heading text-2xl font-black text-white">
              Connect Directly with AW Ali Company
            </h3>
            <p className="text-xs sm:text-sm text-[#D9DDE8]">
              Ready to partner with us or explore tailored training and foreign trade options? Our team is available 24/7.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://wa.me/252613295050"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#151A46] hover:bg-[#1C235A] border border-white/20 text-white text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4 text-[#FF7817]" />
              <span>WhatsApp: +252613295050</span>
            </a>

            <button
              type="button"
              onClick={() => onNavigate('consulting')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7817] hover:bg-[#E66606] text-white text-xs font-bold transition-all cursor-pointer"
            >
              <span>Explore Consulting</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
