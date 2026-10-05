import React, { useState } from 'react';
import {
  Calendar,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Clock,
  ShieldCheck,
  User,
  Mail,
  Phone,
  FileText,
  X,
  Send,
} from 'lucide-react';

export interface CTASectionProps {
  onNavigate: (page: string) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'consulting' | 'goals'>('consulting');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('University & Education');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Education & University',
    notes: '',
  });

  const handleOpenBooking = (mode: 'consulting' | 'goals') => {
    setModalMode(mode);
    setIsSubmitted(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      topic: 'Education & University',
      notes: '',
    });
  };

  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden bg-[#FAFBFD] dark:bg-[#080C26] transition-colors border-b border-[#E2E6EF] dark:border-[#1E2554]">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#FF7817]/10 dark:bg-[#FF7817]/15 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600/8 dark:bg-blue-600/15 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        {/* Main CTA Card */}
        <div className="relative rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#11173E] dark:via-[#141C4A] dark:to-[#0C1033] border border-[#E2E6EF] dark:border-[#202754] p-8 sm:p-14 lg:p-16 shadow-[0_15px_50px_rgba(21,26,70,0.07)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-[#FF7817] to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Zone: "Let’s Talk About" Headline & Description */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7817]/10 dark:bg-[#FF7817]/15 border border-[#FF7817]/25 text-xs font-bold text-[#D95F06] dark:text-[#FF7817] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct Advisory & Strategy</span>
              </div>

              {/* Exact Requested Title: "Let’s Talk About" */}
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-[#151A46] dark:text-white tracking-tight leading-[1.08]">
                Let’s Talk About
              </h2>

              <p className="text-base sm:text-lg text-[#4E566E] dark:text-[#BAC3DC] leading-relaxed max-w-xl font-normal">
                Whether you are planning your university future, scaling your business, or importing
                goods globally, our seasoned team is ready to guide you step by step.
              </p>

              {/* Quick Trust Highlights */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs font-semibold text-[#5B637B] dark:text-[#C5CCE0]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#FF7817] shrink-0" />
                  <span>30 Minute Strategy Consultation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF7817] shrink-0" />
                  <span>Free Initial Consultation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF7817] shrink-0" />
                  <span>Confidential Advisory</span>
                </div>
              </div>
            </div>

            {/* Right Zone: The Requested Buttons (Your Goals & Book Free Consulting) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-4">
              {/* Button 1: Your Goals */}
              <button
                type="button"
                onClick={() => handleOpenBooking('goals')}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-[#151A46] dark:text-white bg-[#F2F5FB] dark:bg-white/10 hover:bg-[#E6ECF7] dark:hover:bg-white/15 border border-[#D5DCEB] dark:border-white/20 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer text-center active:scale-98"
              >
                <Target className="w-5 h-5 text-[#FF7817] group-hover:scale-110 transition-transform" />
                <span>Your Goals</span>
                <ArrowRight className="w-4 h-4 text-[#8A90A2] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Button 2: Book Free Consulting */}
              <button
                type="button"
                onClick={() => handleOpenBooking('consulting')}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#FF7817] via-[#FF852E] to-[#E66606] hover:from-[#E66606] hover:to-[#D15500] rounded-2xl shadow-[0_8px_30px_rgba(255,120,23,0.35)] hover:shadow-[0_12px_35px_rgba(255,120,23,0.5)] active:scale-98 transition-all cursor-pointer text-center"
              >
                <Calendar className="w-5 h-5 stroke-[2.2]" />
                <span>Book Free Consulting</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Direct Telephone Shortcut */}
              <div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-[#6F7790] dark:text-[#9DA7C3] pt-1">
                <PhoneCall className="w-3.5 h-3.5 text-[#FF7817]" />
                <span>Direct Line:</span>
                <a
                  href="tel:+252613295050"
                  className="font-bold text-[#151A46] dark:text-white hover:text-[#FF7817] transition-colors"
                >
                  +252 61 329 5050
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal for "Your Goals" or "Book Free Consulting" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111638] text-[#171A2B] dark:text-white rounded-3xl border border-[#E2E6EF] dark:border-[#202754] shadow-2xl p-6 sm:p-8 overflow-hidden">
            {/* Modal Ambient Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7817]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Close Button */}
            <button
              type="button"
              onClick={resetModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#F2F5FB] dark:bg-white/5 hover:bg-[#E5EAF5] dark:hover:bg-white/10 text-[#6F7790] dark:text-white/70 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-[#FF7817]/15 border border-[#FF7817]/40 flex items-center justify-center mx-auto text-[#FF7817]">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
                  Consultation Request Received!
                </h3>
                <p className="text-sm text-[#5F667A] dark:text-[#BAC3DC] max-w-sm mx-auto leading-relaxed">
                  Thank you <strong>{formData.name || 'Valued Client'}</strong>. Our advisory team will reach out to you via <strong>{formData.phone || formData.email || 'your contact details'}</strong> within 24 hours to arrange your personalized <strong>{modalMode === 'goals' ? 'Goals Strategy Session' : 'Free Consultation'}</strong>.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#151A46] dark:bg-white/10 hover:bg-[#FF7817] dark:hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7817] uppercase tracking-wider">
                    {modalMode === 'goals' ? (
                      <>
                        <Target className="w-3.5 h-3.5" />
                        <span>Define Your Goals</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Free Consulting</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-heading text-2xl font-black text-[#151A46] dark:text-white">
                    {modalMode === 'goals' ? 'Tell Us About Your Goals' : 'Schedule Free Consulting'}
                  </h3>
                  <p className="text-xs text-[#6F7790] dark:text-[#A0ABC6]">
                    Connect with our advisory specialists to map out the next confident step for your career, education, or business.
                  </p>
                </div>

                {/* Goals Quick Selector when modalMode is 'goals' */}
                {modalMode === 'goals' && (
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-[#485068] dark:text-[#D2D8EA] mb-2">
                      Select Your Primary Objective:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'University Admission',
                        'Import / Export Trade',
                        'Strategic Business',
                        'Real Estate Investment',
                      ].map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setSelectedGoal(goal)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                            selectedGoal === goal
                              ? 'bg-[#FFF4EC] dark:bg-[#FF7817]/20 border-[#FF7817] text-[#D95F06] dark:text-[#FF9240]'
                              : 'bg-[#F8F9FC] dark:bg-white/5 border-[#E2E6EF] dark:border-white/10 text-[#555E77] dark:text-[#AAB2CA] hover:border-[#FF7817]/40'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#485068] dark:text-[#D2D8EA] mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A2]" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alexander Vance"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-white/5 border border-[#D5DCEB] dark:border-white/15 text-sm text-[#171A2B] dark:text-white placeholder:text-[#8A90A2] focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#485068] dark:text-[#D2D8EA] mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A2]" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="client@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-white/5 border border-[#D5DCEB] dark:border-white/15 text-sm text-[#171A2B] dark:text-white placeholder:text-[#8A90A2] focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#485068] dark:text-[#D2D8EA] mb-1">
                        Phone (Mobile / WhatsApp) *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A90A2]" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-white/5 border border-[#D5DCEB] dark:border-white/15 text-sm text-[#171A2B] dark:text-white placeholder:text-[#8A90A2] focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#485068] dark:text-[#D2D8EA] mb-1">
                      Brief Overview (Your Goals / Questions)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-[#8A90A2]" />
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Tell us about your objectives and how our specialists can best assist you..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-white/5 border border-[#D5DCEB] dark:border-white/15 text-sm text-[#171A2B] dark:text-white placeholder:text-[#8A90A2] focus:outline-none focus:border-[#FF7817] focus:ring-1 focus:ring-[#FF7817]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#FF7817] to-[#E66606] hover:from-[#E66606] hover:to-[#D15500] rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {modalMode === 'goals'
                        ? 'Submit My Goals'
                        : 'Confirm Free Consultation'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
