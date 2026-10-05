import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export interface ContactPageProps {
  onNavigateHome: () => void;
  onNavigate?: (page: string) => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Customer Support',
    question: 'How quickly does your customer support team respond?',
    answer:
      'We are here to help you 7 days a week and respond within 24 hours. Urgent inquiries via direct phone or WhatsApp (+252613295050) are typically attended to even faster during working hours.',
  },
  {
    category: 'Office & Visiting',
    question: 'Where is your corporate headquarters located?',
    answer:
      'Our main office is located along Maka Al Mukarama Road in Mogadishu, Somalia. We offer dedicated visitor parking and walk-in consultation desks from Saturday through Thursday, 8:00 AM – 6:00 PM.',
  },
  {
    category: 'Consultation & Appointments',
    question: 'How can I schedule a personal property tour or business consultation?',
    answer:
      'You can schedule a consultation directly through the contact form on this page, email us at info@awalicompany.com, or call our direct hotline at +252613295050. Our representative will coordinate a convenient time for you.',
  },
  {
    category: 'Services & Advisory',
    question: 'What core sectors does AW Ali Company operate in?',
    answer:
      'AW Ali Company provides premium services across Real Estate & Property Investments, Business & Strategic Consulting, Professional Education & Capacity Building, and Cross Border Trade & Logistics.',
  },
  {
    category: 'Diaspora & International Clients',
    question: 'Can diaspora and international clients reach out remotely?',
    answer:
      'Absolutely. A substantial portion of our investors and clients are based overseas. We provide remote video consultations, verified digital documentation, and instant communication over WhatsApp and email.',
  },
];

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateHome, onNavigate }) => {
  const { showToast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'General Inquiries',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill in your name, email, and message.', 'error', 'Missing Information');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Thank you! Your message has been dispatched. We will respond within 24 hours.', 'success', 'Message Sent');
    }, 700);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'General Inquiries',
      subject: '',
      message: '',
    });
    setIsSubmitted(false);
  };

  return (
    <div className="w-full bg-[#F8FAFD] dark:bg-[#070B24] text-[#171A2B] dark:text-white transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO HEADER & QUICK CHANNELS
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFBFD] via-[#F2F5FB] to-[#E9EFF8] dark:from-[#111638] dark:via-[#141A42] dark:to-[#182052] text-[#171A2B] dark:text-white pt-12 pb-20 px-6 sm:px-10 lg:px-16 border-b border-[#D8DFEE] dark:border-[#232B66] transition-colors">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF7817]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 space-y-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#5F667A] dark:text-[#A1A9C7]">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-[#5F667A] dark:text-[#A1A9C7] hover:text-[#FF7817] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#FF7817] font-semibold">Contact Us</span>
          </nav>

          {/* Hero Typography strictly matching user's copy */}
          <div className="max-w-3xl space-y-4">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FF7817]">
              We&apos;d love to hear from you
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171A2B] dark:text-white tracking-tight leading-tight">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg text-[#5F667A] dark:text-[#C8CFE6] font-normal leading-relaxed">
              We are here to help you 7 days a week and respond within 24 hours. Plus, you can find
              most answers to your questions right on FAQ page.
            </p>
          </div>

          {/* 3 Luxury Quick Channel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Channel 1: Phone / WhatsApp */}
            <div className="group bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md border border-[#D8DFEE] dark:border-white/10 hover:border-[#FF7817]/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF7817]/15 border border-[#FF7817]/30 flex items-center justify-center text-[#FF7817] group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-[#5F667A] dark:text-[#A1A9C7]">
                    Direct Hotline & WhatsApp
                  </div>
                  <a
                    href="tel:+252613295050"
                    className="font-heading text-lg sm:text-xl font-bold text-[#171A2B] dark:text-white hover:text-[#FF7817] transition-colors block mt-1 tracking-tight"
                  >
                    +252613295050
                  </a>
                  <p className="text-xs text-[#5F667A] dark:text-[#9FA8C7] mt-1.5 leading-relaxed">
                    Available 7 days a week for immediate assistance & consultations.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#D8DFEE] dark:border-white/10 flex items-center gap-3">
                <a
                  href="tel:+252613295050"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7817] hover:underline"
                >
                  <span>Call Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[#5F667A]/30 dark:text-white/20">•</span>
                <a
                  href="https://wa.me/252613295050"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7817] hover:underline"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Channel 2: Official Email */}
            <div className="group bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md border border-[#D8DFEE] dark:border-white/10 hover:border-[#FF7817]/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-[#5F667A] dark:text-[#A1A9C7]">
                    Official Inquiries & Email
                  </div>
                  <a
                    href="mailto:info@awalicompany.com"
                    className="font-heading text-lg sm:text-xl font-bold text-[#171A2B] dark:text-white hover:text-[#FF7817] transition-colors block mt-1 tracking-tight break-all"
                  >
                    info@awalicompany.com
                  </a>
                  <p className="text-xs text-[#5F667A] dark:text-[#9FA8C7] mt-1.5 leading-relaxed">
                    Send formal requests, partnership proposals, or investment queries.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#D8DFEE] dark:border-white/10 flex items-center gap-2">
                <a
                  href="mailto:info@awalicompany.com"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7817] hover:underline"
                >
                  <span>Send an Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[#5F667A]/30 dark:text-white/20">•</span>
                <span className="text-xs text-[#5F667A] dark:text-[#9FA8C7]">SLA: 24 Hours</span>
              </div>
            </div>

            {/* Channel 3: Headquarters Address */}
            <div className="group bg-white dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md border border-[#D8DFEE] dark:border-white/10 hover:border-[#FF7817]/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-[#5F667A] dark:text-[#A1A9C7]">
                    Headquarters Office
                  </div>
                  <div className="font-heading text-base sm:text-lg font-bold text-[#171A2B] dark:text-white mt-1 tracking-tight">
                    Maka Al Mukarama Road, Mogadishu, Somalia
                  </div>
                  <p className="text-xs text-[#5F667A] dark:text-[#9FA8C7] mt-1.5 leading-relaxed">
                    Central business corridor with direct access to commercial centers.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#D8DFEE] dark:border-white/10 flex items-center gap-2">
                <a
                  href="#headquarters-map"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7817] hover:underline"
                >
                  <span>View on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[#5F667A]/30 dark:text-white/20">•</span>
                <span className="text-xs text-[#5F667A] dark:text-[#9FA8C7]">Visitor Parking Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: SUPPORT TEAM DISPATCH & INTERACTIVE FORM
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Support Team Profile & Commitments */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7817]">
                Dedicated Assistance
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#151A46] dark:text-white leading-tight">
                Get in touch with our support team
              </h2>
              <p className="text-sm sm:text-base text-[#565E7A] dark:text-[#A6B0CB] leading-relaxed">
                Our dedicated support team is here to answer your questions, resolve issues, and
                guide you through every step. We’re committed to providing quick, helpful, and
                professional assistance whenever you need it.
              </p>
            </div>

            {/* Core Commitments List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#12183F] border border-[#E1E6F0] dark:border-[#1E2554] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#151A46]/10 dark:bg-[#151A46] text-[#151A46] dark:text-[#FF7817] flex items-center justify-center shrink-0 border border-[#151A46]/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    7 Days a Week Availability
                  </h4>
                  <p className="text-xs text-[#707895] dark:text-[#95A0C0] mt-0.5 leading-relaxed">
                    Our team is active daily from 8:00 AM to 8:00 PM EAT, ensuring prompt replies
                    within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#12183F] border border-[#E1E6F0] dark:border-[#1E2554] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    Verified Advisory & Confidentiality
                  </h4>
                  <p className="text-xs text-[#707895] dark:text-[#95A0C0] mt-0.5 leading-relaxed">
                    All investment queries, title deed verifications, and corporate discussions are
                    handled with strict confidentiality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#12183F] border border-[#E1E6F0] dark:border-[#1E2554] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF7817] flex items-center justify-center shrink-0 border border-[#FF7817]/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                    Maka Al Mukarama Headquarters
                  </h4>
                  <p className="text-xs text-[#707895] dark:text-[#95A0C0] mt-0.5 leading-relaxed">
                    Walk in anytime to meet our senior property brokers, educational advisors, and
                    corporate management staff in Mogadishu.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contacts Bar */}
            <div className="p-5 rounded-2xl bg-[#F0F4FA] dark:bg-[#101538] border border-[#DFE5F2] dark:border-[#1B2350] space-y-2">
              <div className="text-xs font-bold text-[#151A46] dark:text-white uppercase tracking-wider">
                Direct Contact Desk
              </div>
              <div className="text-xs text-[#67708C] dark:text-[#98A3C4] flex flex-col gap-1.5">
                <div>
                  <strong className="text-[#151A46] dark:text-slate-200">Phone: </strong>
                  +252613295050
                </div>
                <div>
                  <strong className="text-[#151A46] dark:text-slate-200">Email: </strong>
                  info@awalicompany.com
                </div>
                <div>
                  <strong className="text-[#151A46] dark:text-slate-200">Location: </strong>
                  Maka Al Mukarama Road, Mogadishu, Somalia
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Interactive Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#12183F] rounded-3xl border border-[#DFE4EE] dark:border-[#1E2554] p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7817]/5 rounded-full blur-2xl pointer-events-none" />

            {isSubmitted ? (
              <div className="py-12 px-4 text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FF7817]/10 dark:bg-[#FF7817]/20 border border-[#FF7817]/40 text-[#FF7817] flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="font-heading text-2xl font-bold text-[#151A46] dark:text-white">
                    Message Dispatched Successfully!
                  </h3>
                  <p className="text-sm text-[#666F8D] dark:text-[#A4ADC8] leading-relaxed">
                    Thank you for reaching out to AW Ali Company. Our support team has received your
                    inquiry and will respond to{' '}
                    <span className="font-semibold text-[#151A46] dark:text-white">
                      {formData.email}
                    </span>{' '}
                    within 24 hours.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-6 py-3 rounded-xl bg-[#151A46] hover:bg-[#1c235a] text-white text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="border-b border-[#EDF1F7] dark:border-[#1E2554] pb-5">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#151A46] dark:text-white">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-[#707996] dark:text-[#95A0C2] mt-1">
                    Fill out the form below and our team will get in touch promptly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151A46] dark:text-white">
                      Your Full Name <span className="text-[#FF7817]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohamed Hassan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8FAFD] dark:bg-[#0B1030] text-sm text-[#151A46] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all placeholder-[#9098B0]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151A46] dark:text-white">
                      Email Address <span className="text-[#FF7817]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8FAFD] dark:bg-[#0B1030] text-sm text-[#151A46] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all placeholder-[#9098B0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151A46] dark:text-white">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +252 61 3295050"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8FAFD] dark:bg-[#0B1030] text-sm text-[#151A46] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all placeholder-[#9098B0]"
                    />
                  </div>

                  {/* Department / Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151A46] dark:text-white">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8FAFD] dark:bg-[#0B1030] text-sm text-[#151A46] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all"
                    >
                      <option value="Real Estate & Properties">Real Estate & Properties</option>
                      <option value="Consulting & Advisory">Consulting & Corporate Advisory</option>
                      <option value="Education & Training">Education & Academy</option>
                      <option value="Import & Export Services">Import & Export Services</option>
                      <option value="General Inquiries">General Inquiries</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#151A46] dark:text-white">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inquiry regarding property purchase or consultation"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8FAFD] dark:bg-[#0B1030] text-sm text-[#151A46] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all placeholder-[#9098B0]"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#151A46] dark:text-white">
                    Your Message <span className="text-[#FF7817]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your inquiry or requirement in detail. Our team will prepare all details prior to reaching out..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8FAFD] dark:bg-[#0B1030] text-sm text-[#151A46] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all resize-y placeholder-[#9098B0]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF7817] to-[#FF8C38] hover:from-[#e56810] hover:to-[#e87b29] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: HEADQUARTERS MAP & LOCATION SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section
        id="headquarters-map"
        className="py-16 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF7817]">
              Visit Us in Person
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#151A46] dark:text-white">
              Headquarters Location & Map
            </h2>
            <p className="text-sm text-[#666F8D] dark:text-[#A4ADC8] max-w-xl">
              Conveniently located on Maka Al Mukarama Road, Mogadishu, Somalia. Find us easily with
              frontage access and visitor parking.
            </p>
          </div>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Maka+Al+Mukarama+Road+Mogadishu+Somalia"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#12183F] border border-[#DFE4EE] dark:border-[#1E2554] text-xs font-bold text-[#151A46] dark:text-white hover:border-[#FF7817] transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FF7817]" />
          </a>
        </div>

        {/* Interactive Google Map Embed Card */}
        <div className="relative rounded-3xl overflow-hidden border border-[#DFE4EE] dark:border-[#1E2554] shadow-xl bg-slate-100 dark:bg-[#111638] h-[450px] sm:h-[500px]">
          <iframe
            title="AW Ali Company Headquarters, Maka Al Mukarama, Mogadishu, Somalia"
            src="https://maps.google.com/maps?q=Maka+Al+Mukarama+Road,+Mogadishu,+Somalia&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 filter saturate-105 contrast-105"
            loading="lazy"
            allowFullScreen
          />

          {/* Floating Luxury Location Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-xs sm:max-w-sm bg-white/95 dark:bg-[#12183F]/95 backdrop-blur-md p-5 rounded-2xl border border-[#DFE4EE] dark:border-[#20295B] shadow-2xl space-y-3 pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF7817]/10 text-[#FF7817] flex items-center justify-center shrink-0 border border-[#FF7817]/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-[#151A46] dark:text-white">
                  AW Ali Company HQ
                </h4>
                <p className="text-xs text-[#6F7794] dark:text-[#A1AAC6]">Central Corporate Office</p>
              </div>
            </div>

            <div className="text-xs text-[#4F5774] dark:text-[#CBD5E1] space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
              <p className="font-semibold text-[#151A46] dark:text-white">
                Maka Al Mukarama Road, Mogadishu, Somalia
              </p>
              <p className="text-[11px] text-[#7882A0] dark:text-slate-400">
                Hotline: +252613295050 · Email: info@awalicompany.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: FAQ (FREQUENTLY ASKED QUESTIONS) SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto border-t border-[#DFE4EE] dark:border-[#1E2554]">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7817]/10 text-[#FF7817] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Answers at Your Fingertips</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#151A46] dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#666F8D] dark:text-[#A4ADC8] leading-relaxed">
            Plus, you can find most answers to your questions right on FAQ page. If you need any
            further clarification, our team is always ready to assist.
          </p>
        </div>

        {/* FAQ Accordions Grid */}
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#12183F] rounded-2xl border border-[#DFE4EE] dark:border-[#1E2554] overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7817]"
                >
                  <span className="font-heading text-base font-bold text-[#151A46] dark:text-white">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#FF7817] text-white rotate-180'
                        : 'bg-[#F2F5FB] dark:bg-white/5 text-[#5F6783] dark:text-slate-300'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#5B6380] dark:text-[#A8B2CE] leading-relaxed border-t border-slate-100 dark:border-white/5 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA for Further Assistance */}
        <div className="mt-14 max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-[#111638] to-[#1a2152] text-white text-center space-y-4 shadow-xl">
          <h3 className="font-heading text-xl font-bold">Still have questions?</h3>
          <p className="text-xs sm:text-sm text-[#B4BDD6] max-w-md mx-auto">
            Our support desk is accessible 7 days a week. Speak to an advisor right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="tel:+252613295050"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7817] hover:bg-[#e56810] text-white text-xs font-bold transition-all shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call +252613295050</span>
            </a>
            <a
              href="mailto:info@awalicompany.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
