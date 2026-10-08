import React, { useEffect, useState } from 'react';
import {
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Plane,
  Building2,
  FileCheck2,
  Calendar,
  MessageCircle,
  PhoneCall,
  Clock,
  ChevronRight,
  ArrowRight,
  Users,
  Award,
  Globe2,
  Sparkles,
  Check,
  X,
  Send,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../services/api';

export interface HealthPageProps {
  onNavigateHome: () => void;
  onNavigate: (page: string) => void;
  onOpenPortal?: () => void;
}

interface Specialty {
  id: string;
  category: string;
  name: string;
  country?: string;
  city?: string;
  tagline: string;
  description: string;
  keyProcedures: string[];
  destinations: string[];
  iconName?: string;
  image: string;
}

export const HealthPage: React.FC<HealthPageProps> = ({
  onNavigateHome,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isSpecialtiesLoading, setIsSpecialtiesLoading] = useState(true);
  const [activeModalSpecialty, setActiveModalSpecialty] = useState<Specialty | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    specialty: 'Cardiology & Heart Surgery',
    preferredDestination: 'Turkey (Istanbul / Ankara)',
    urgency: 'Normal (Planning ahead)',
    medicalNotes: '',
  });

  useEffect(() => {
    let active = true;
    setIsSpecialtiesLoading(true);
    api.getHealthSpecialties()
      .then(items => {
        if (active) setSpecialties(items.filter(item => item.status === 'Active'));
      })
      .catch(() => {
        if (active) setSpecialties([]);
      })
      .finally(() => {
        if (active) setIsSpecialtiesLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categories = ['All', ...new Set(specialties.map(item => item.category))];

  const legacySpecialties: Specialty[] = [
    {
      id: 'cardio',
      category: 'Cardiology & Heart',
      name: 'Cardiology & Advanced Heart Surgery',
      tagline: 'Minimally invasive cardiac procedures & pediatric heart surgery',
      description:
        'Comprehensive cardiac care covering coronary artery bypass graft (CABG), valve repair and replacement, pediatric cardiology, and interventional angioplasty with top JCI accredited cardiac centers.',
      keyProcedures: [
        'Coronary Artery Bypass (CABG)',
        'Heart Valve Replacement and TAVI',
        'Pediatric Congenital Heart Repair',
        'Electrophysiology and Pacemaker Implantation',
      ],
      destinations: ['Turkey (Istanbul)', 'India (New Delhi)', 'UAE (Dubai)'],
      iconName: 'heart',
      image:
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'onco',
      category: 'Oncology & Cancer Care',
      name: 'Medical & Surgical Oncology',
      tagline: 'Precision radiotherapy, chemotherapy & tumor resection',
      description:
        'Multidisciplinary cancer treatment incorporating robotic surgery, CyberKnife, PET CT precision diagnostics, targeted immunotherapy, and bone marrow transplants for adult and pediatric oncology.',
      keyProcedures: [
        'Robotic Tumor Resection',
        'CyberKnife & TrueBeam Radiotherapy',
        'Targeted Immunotherapy & Chemotherapy',
        'Bone Marrow / Stem Cell Transplant',
      ],
      destinations: ['Turkey (Istanbul / Ankara)', 'India (Mumbai)', 'Germany'],
      iconName: 'shield',
      image:
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'ortho',
      category: 'Orthopedics & Spine',
      name: 'Orthopedics & Complex Spine Surgery',
      tagline: 'Joint replacements, scoliosis correction & trauma recovery',
      description:
        'World class orthopedic solutions including total knee and hip arthroplasty, robotic spine deformity correction, sports medicine reconstructive procedures, and complex pediatric scoliosis management.',
      keyProcedures: [
        'Total Knee & Hip Replacement (Robotic)',
        'Scoliosis & Spinal Fusion Surgery',
        'Arthroscopic ACL & Shoulder Repair',
        'Complex Trauma & Limb Reconstruction',
      ],
      destinations: ['Turkey (Istanbul)', 'India (New Delhi)', 'UAE (Dubai)'],
      iconName: 'activity',
      image:
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'transplant',
      category: 'Organ Transplant',
      name: 'Organ Transplantation Services',
      tagline: 'High success living donor kidney and liver transplantation',
      description:
        'Partnering with world renowned transplant institutes maintaining ethical, strictly regulated living donor renal and hepatic transplants, backed by comprehensive pre transplant workup and lifelong immunosuppressive protocol management.',
      keyProcedures: [
        'Living Donor Kidney Transplantation',
        'Living Donor Adult & Pediatric Liver Transplant',
        'Pre Transplant HLA & Tissue Crossmatch',
        'Comprehensive Post Transplant Monitoring',
      ],
      destinations: ['Turkey (Istanbul)', 'India (Delhi / Hyderabad)'],
      iconName: 'users',
      image:
        'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'neuro',
      category: 'Complex Surgeries',
      name: 'Neurosurgery & Brain Interventions',
      tagline: 'Microsurgical tumor removal & cerebrovascular treatments',
      description:
        'Advanced neurosurgical interventions using intraoperative MRI and neuronavigation systems for brain tumors, aneurysm coiling, cerebral bypass, spinal tumors, and epilepsy surgery.',
      keyProcedures: [
        'Neuronavigation Brain Tumor Surgery',
        'Endovascular Aneurysm Coiling',
        'Deep Brain Stimulation (DBS)',
        'Minimally Invasive Spinal Decompression',
      ],
      destinations: ['Turkey (Istanbul)', 'India (New Delhi)', 'Germany'],
      iconName: 'stethoscope',
      image:
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'ivf',
      category: 'Diagnostic & IVF',
      name: 'Fertility (IVF) & Advanced Diagnostics',
      tagline: 'Advanced reproductive medicine and genetic screening',
      description:
        'Advanced reproductive technology including IVF, ICSI, pre implantation genetic diagnosis (PGD), and whole body executive checkups designed for individuals and couples seeking high success parenthood solutions.',
      keyProcedures: [
        'In Vitro Fertilization (IVF / ICSI)',
        'Pre Implantation Genetic Screening (PGD)',
        'Full Body Executive Health Checkups',
        'Specialized Hormonal & Endocrine Profiling',
      ],
      destinations: ['Turkey (Istanbul)', 'UAE (Dubai)', 'India (New Delhi)'],
      iconName: 'sparkles',
      image:
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const filteredSpecialties = specialties.filter((s) => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setIsInquiryModalOpen(false);
      setInquiryForm({
        patientName: '',
        phone: '',
        email: '',
        specialty: 'Cardiology & Heart Surgery',
        preferredDestination: 'Turkey (Istanbul / Ankara)',
        urgency: 'Normal (Planning ahead)',
        medicalNotes: '',
      });
    }, 3500);
  };

  const openInquiryForSpecialty = (spec: Specialty) => {
    setInquiryForm((prev) => ({
      ...prev,
      specialty: spec.name,
    }));
    setActiveModalSpecialty(null);
    setIsInquiryModalOpen(true);
  };

  const faqs = [
    {
      q: 'How does AW Ali Company assist patients traveling abroad for treatment?',
      a: 'We provide full medical logistics, beginning with initial review of your medical documents by board certified hospital partners, obtaining preliminary treatment plans with transparent pricing, issuing official medical visa invitation letters, airport transfers by medical escort, in hospital translation, and follow up care coordination upon return to Somalia.',
    },
    {
      q: 'How long does it take to obtain a medical visa and hospital appointment?',
      a: 'For urgent medical cases (such as acute cardiac conditions or trauma), hospital acceptance and expedited medical visa facilitation can be completed within 48 to 72 hours. Standard scheduled procedures typically take 5 to 7 business days.',
    },
    {
      q: 'Are translation and family accommodation services included?',
      a: 'Yes. Our dedicated patient liaison team in Istanbul, Ankara, New Delhi, and Dubai provides full language interpretation during all doctor consultations and hospital stays, alongside hotel and serviced apartment bookings for accompanying family members.',
    },
    {
      q: 'Can AW Ali also assist local hospitals and clinics with medical supplies and equipment?',
      a: 'Absolutely. AW Ali Company Health Division acts as a trusted procurement partner importing international standard medical machinery (ultrasound, surgical instruments, patient monitors) and certified consumables for healthcare institutions across Somalia.',
    },
  ];

  return (
    <div className="w-full bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFBFD] via-[#F2F5FB] to-[#E9EFF8] dark:from-[#151A46] dark:via-[#101538] dark:to-[#0B1030] text-[#171A2B] dark:text-white pt-16 pb-24 sm:pt-20 sm:pb-28 border-b border-[#D8DFEE] dark:border-[#202754] transition-colors">
        {/* Subtle decorative brand circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF7817]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF7817] mb-6">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:underline cursor-pointer"
            >
              Home
            </button>
            <span className="text-[#5F667A] dark:text-white/40">/</span>
            <span className="text-[#171A2B] dark:text-white">AW Ali Health Division</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7817]/10 dark:bg-white/10 border border-[#FF7817]/30 dark:border-white/15 text-xs font-semibold backdrop-blur-md">
                <HeartPulse className="w-4 h-4 text-[#FF7817]" />
                <span className="text-[#FF7817]">Premier Healthcare & Medical Tourism</span>
                <span className="text-[#5F667A]/40 dark:text-white/30">|</span>
                <span className="text-[#5F667A] dark:text-white/90">Global Hospital Partners</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[#171A2B] dark:text-white tracking-tight leading-[1.15]">
                World Class Healthcare &{' '}
                <span className="text-[#FF7817] underline decoration-[#FF7817]/40">
                  Global Hospitals
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#5F667A] dark:text-[#BAC3DC] leading-relaxed max-w-2xl font-normal">
                AW Ali Company bridges patients, families, and medical institutions across Somalia
                and East Africa with internationally accredited tertiary hospitals in Turkey,
                India, and the UAE. We manage medical evaluations, priority specialist
                admissions, expedited travel visas, and 24/7 patient concierge.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#FF7817] hover:bg-[#E66606] text-white font-bold text-sm transition-all shadow-xl hover:shadow-[#FF7817]/25 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Request Free Medical Evaluation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="https://wa.me/252613295050?text=Hello%20AW%20Ali%20Health%20Division,%20I%20need%20assistance%20with%20medical%20consultation%20or%20overseas%20treatment."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white dark:bg-white/10 hover:bg-[#EEF2F8] dark:hover:bg-white/15 border border-[#D8DFEE] dark:border-white/20 text-[#171A2B] dark:text-white font-bold text-sm transition-all backdrop-blur-md shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF7817]" />
                  <span>WhatsApp: +252613295050</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#D8DFEE] dark:border-white/10">
                <div>
                  <span className="text-2xl font-black text-[#FF7817] block">50+</span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2]">Partner Hospitals</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#171A2B] dark:text-white block">1,200+</span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2]">Patients Assisted</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#FF7817] block">48 hrs</span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2]">Fast Plan Turnaround</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#171A2B] dark:text-white block">100%</span>
                  <span className="text-xs text-[#5F667A] dark:text-[#8A90A2]">Dedicated Patient Escort</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Feature */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#151A46]">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&auto=format&fit=crop&q=80"
                  alt="Modern Hospital Room and Medical Facility"
                  className="w-full h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1030] via-[#0B1030]/40 to-transparent" />

                {/* Floating highlight card */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white space-y-2 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7817] uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-[#FF7817]" />
                      JCI Accredited Care
                    </span>
                    <span className="text-[10px] bg-[#FF7817] text-white px-2 py-0.5 rounded-full font-bold">
                      Verified
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-white">
                    Direct Liaison with Turkish & Indian Super Specialty Hospitals
                  </h3>
                  <p className="text-xs text-[#D9DDE8] leading-relaxed">
                    Personal medical escort, pre negotiated treatment packages, zero hidden hospital fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 5 CORE HEALTHCARE PILLARS */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7817]/10 text-[#FF7817] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Division Capabilities</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#151A46] dark:text-white">
            Comprehensive Medical & Healthcare Services
          </h2>
          <p className="text-sm sm:text-base text-[#5F667A] dark:text-[#BAC3DC]">
            From patient travel logistics to healthcare infrastructure consulting, discover how AW Ali Company delivers clinical excellence across borders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs hover:border-[#FF7817]/40 hover:shadow-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#151A46] text-[#FF7817] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              Overseas Medical Tourism & Surgery
            </h3>
            <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Full coordination of major surgeries (cardiac, oncology, neurosurgery, organ transplants) with premier hospital networks in Istanbul, Ankara, New Delhi, and Dubai.
            </p>
            <div className="pt-2 border-t border-[#E2E6EF] dark:border-[#202754] text-xs font-semibold text-[#FF7817] flex items-center gap-1">
              <span>Includes visa, hospital admission & translation</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs hover:border-[#FF7817]/40 hover:shadow-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#FF7817] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              Free Second Opinion by Specialists
            </h3>
            <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Submit your MRI, CT scans, and pathology reports. We coordinate review with leading international professors to ensure accurate diagnosis before you make any travel decisions.
            </p>
            <div className="pt-2 border-t border-[#E2E6EF] dark:border-[#202754] text-xs font-semibold text-[#FF7817] flex items-center gap-1">
              <span>Turnaround within 48 business hours</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs hover:border-[#FF7817]/40 hover:shadow-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#151A46] text-[#FF7817] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              Hospital & Clinic Turnkey Advisory
            </h3>
            <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Strategic consultancy for private investors, regional governments, and NGOs establishing modern clinics, diagnostic labs, and specialty wards in Somalia.
            </p>
            <div className="pt-2 border-t border-[#E2E6EF] dark:border-[#202754] text-xs font-semibold text-[#FF7817] flex items-center gap-1">
              <span>Feasibility, licensing, & clinical management</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs hover:border-[#FF7817]/40 hover:shadow-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#FF7817] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              Medical Supplies & Equipment Import
            </h3>
            <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Direct procurement and importation of CE/FDA certified medical devices, diagnostic reagents, ICU monitors, surgical kits, and healthcare consumables from Turkey and Asia.
            </p>
            <div className="pt-2 border-t border-[#E2E6EF] dark:border-[#202754] text-xs font-semibold text-[#FF7817] flex items-center gap-1">
              <span>Bulk shipments with customs clearance</span>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs hover:border-[#FF7817]/40 hover:shadow-lg transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#151A46] text-[#FF7817] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              Patient Concierge & Translation Escort
            </h3>
            <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Dedicated on ground patient coordinators meet patients at Istanbul or New Delhi airports, escort them to hospital rooms, and assist daily during ward rounds.
            </p>
            <div className="pt-2 border-t border-[#E2E6EF] dark:border-[#202754] text-xs font-semibold text-[#FF7817] flex items-center gap-1">
              <span>Full peace of mind for families</span>
            </div>
          </div>

          {/* Pillar 6 - Quick CTA */}
          <div className="p-7 rounded-2xl bg-gradient-to-br from-[#151A46] to-[#1F2662] text-white flex flex-col justify-between space-y-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7817] uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>24/7 Medical Hotline</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-white">
                Urgent Medical Evacuation or Consultation?
              </h3>
              <p className="text-xs text-[#BAC3DC] mt-2 leading-relaxed">
                Connect directly with AW Ali Health Coordinators at our Mogadishu headquarters or Istanbul desk.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="tel:+252613295050"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#FF7817] hover:bg-[#E66606] text-white text-xs font-bold transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call +252613295050</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL SPECIALIZATION CATALOG */}
      <section className="py-16 bg-[#EEF2F8] dark:bg-[#0E1235] border-y border-[#E2E6EF] dark:border-[#202754]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider">
                Clinical Excellence
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#151A46] dark:text-white">
                Partner Specialties & Surgical Programs
              </h2>
              <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] max-w-xl">
                Browse our high-demand medical specialties provided by top accredited healthcare centers abroad.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#FF7817] text-white shadow-xs'
                      : 'bg-white dark:bg-[#151A46] text-[#4B5368] dark:text-[#BAC3DC] hover:bg-[#E2E6EF] dark:hover:bg-[#1E2554]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Specialty Grid */}
          {isSpecialtiesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Loading health specialties">
              {[0, 1, 2].map(index => (
                <div key={index} className="h-[520px] animate-pulse rounded-3xl bg-white dark:bg-[#111638]" />
              ))}
            </div>
          )}
          {!isSpecialtiesLoading && filteredSpecialties.length === 0 && (
            <div className="rounded-3xl border border-[#E2E6EF] bg-white px-6 py-14 text-center dark:border-[#202754] dark:bg-[#111638]">
              <HeartPulse className="mx-auto mb-3 h-9 w-9 text-[#FF7817]" />
              <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">No health specialties available</h3>
              <p className="mt-1 text-sm text-[#5F667A] dark:text-[#AAB2CA]">New clinical programs will appear here when they are published.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSpecialties.map((spec) => (
              <div
                key={spec.id}
                className="group rounded-3xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Visual Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={spec.image}
                      alt={spec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#151A46]/90 text-white backdrop-blur-md border border-white/20">
                        {spec.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-heading text-base font-bold line-clamp-1">{spec.name}</h3>
                      <p className="text-[11px] text-[#D9DDE8] line-clamp-1">
                        {spec.city && spec.country ? `${spec.city}, ${spec.country}` : spec.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed line-clamp-3">
                      {spec.description}
                    </p>

                    {/* Key Procedures */}
                    <div className="space-y-1.5 pt-2 border-t border-[#E2E6EF] dark:border-[#202754]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A90A2] block">
                        Included Clinical Focus:
                      </span>
                      {spec.keyProcedures.slice(0, 3).map((proc, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-[#171A2B] dark:text-[#D9DDE8]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#FF7817] shrink-0" />
                          <span className="truncate">{proc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Destinations */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {spec.destinations.map((dest, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F0F4FA] dark:bg-[#151A46] text-[#151A46] dark:text-[#D9DDE8] border border-[#E2E6EF] dark:border-[#252B5C]"
                        >
                          📍 {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 sm:p-6 pt-0 border-t border-[#E2E6EF] dark:border-[#202754] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalSpecialty(spec)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-[#151A46] dark:text-white bg-[#F0F4FA] dark:bg-[#151A46] hover:bg-[#FF7817] hover:text-white dark:hover:bg-[#FF7817] transition-all text-center cursor-pointer border border-[#E2E6EF] dark:border-[#252B5C] hover:border-transparent"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => openInquiryForSpecialty(spec)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#FF7817] hover:bg-[#E66606] transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>Inquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE 5-STEP PATIENT JOURNEY */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider">
            Clear, Transparent Care
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#151A46] dark:text-white">
            How The Patient Journey Works
          </h2>
          <p className="text-sm text-[#5F667A] dark:text-[#BAC3DC]">
            We guide you step-by-step from your initial inquiry in Mogadishu to treatment in top hospital suites abroad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#FF7817] text-white flex items-center justify-center font-black text-sm">
              01
            </div>
            <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
              Document Review
            </h4>
            <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Submit patient reports, MRI/CT scans, and recent discharge summaries at our office or via WhatsApp.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#151A46] text-[#FF7817] border border-[#FF7817]/40 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
              Doctor Evaluation
            </h4>
            <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              International specialists analyze the case and issue a formal treatment strategy with upfront estimated costs.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#FF7817] text-white flex items-center justify-center font-black text-sm">
              03
            </div>
            <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
              Visa & Travel Fast Track
            </h4>
            <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              We process official hospital invitation letters and expedite urgent medical visa approvals for patient and companion.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#151A46] text-[#FF7817] border border-[#FF7817]/40 flex items-center justify-center font-black text-sm">
              04
            </div>
            <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
              Escort & Treatment
            </h4>
            <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Airport welcome, dedicated translator during hospital rounds, and complete admission concierge.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#FF7817] text-white flex items-center justify-center font-black text-sm">
              05
            </div>
            <h4 className="font-heading text-base font-bold text-[#151A46] dark:text-white">
              Recovery & Continuity
            </h4>
            <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed">
              Post operative checkups, translated discharge records, and continued physician communication back in Somalia.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQs SECTION */}
      <section className="py-16 bg-[#EEF2F8] dark:bg-[#0E1235] border-y border-[#E2E6EF] dark:border-[#202754]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider">
              Common Inquiries
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#151A46] dark:text-white">
              Frequently Asked Healthcare Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] shadow-xs space-y-2"
              >
                <h4 className="font-heading text-sm sm:text-base font-bold text-[#151A46] dark:text-white flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-[#FF7817] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#5F667A] dark:text-[#AAB2CA] leading-relaxed pl-7.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALLOUT CTA */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-gradient-to-r from-[#151A46] via-[#1C235A] to-[#151A46] text-white p-8 sm:p-12 border border-[#202754] relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-80 h-full bg-[#FF7817]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#FF7817]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dedicated Medical Coordinator On Duty</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Need Fast Medical Advice or a Hospital Quote?
              </h3>
              <p className="text-sm text-[#BAC3DC] leading-relaxed">
                Our clinical liaison officers are ready to review your medical reports and guide your family with total confidentiality and care.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7817] hover:bg-[#E66606] text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Submit Case Details</span>
              </button>

              <a
                href="https://wa.me/252613295050"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#FF7817]" />
                <span>Chat via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL 1: SPECIALTY DETAIL MODAL */}
      {activeModalSpecialty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111638] rounded-3xl border border-[#E2E6EF] dark:border-[#202754] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-48 sm:h-56 shrink-0 bg-slate-900">
              <img
                src={activeModalSpecialty.image}
                alt={activeModalSpecialty.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveModalSpecialty(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF7817] text-white mb-1.5 inline-block">
                  {activeModalSpecialty.category}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black">{activeModalSpecialty.name}</h3>
                <p className="text-xs text-[#D9DDE8]">
                  {activeModalSpecialty.city && activeModalSpecialty.country
                    ? `${activeModalSpecialty.city}, ${activeModalSpecialty.country}`
                    : activeModalSpecialty.tagline}
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <h4 className="text-xs font-bold text-[#8A90A2] uppercase tracking-wider mb-1">
                  Clinical Overview
                </h4>
                <p className="text-xs sm:text-sm text-[#4B5368] dark:text-[#D9DDE8] leading-relaxed">
                  {activeModalSpecialty.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#8A90A2] uppercase tracking-wider mb-2">
                  Specialized Procedures & Treatments
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalSpecialty.keyProcedures.map((proc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F9FC] dark:bg-[#151A46]/60 border border-[#E2E6EF] dark:border-[#202754] text-xs text-[#171A2B] dark:text-white"
                    >
                      <Check className="w-4 h-4 text-[#FF7817] shrink-0" />
                      <span>{proc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FF7817]/10 border border-[#FF7817]/25 text-xs text-[#151A46] dark:text-white space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-[#FF7817]">
                  <Globe2 className="w-4 h-4" />
                  Accredited Hospital Destinations
                </span>
                <p className="text-[#5F667A] dark:text-[#BAC3DC]">
                  {activeModalSpecialty.destinations.join(' • ')}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-[#F8F9FC] dark:bg-[#0B1030] border-t border-[#E2E6EF] dark:border-[#202754] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalSpecialty(null)}
                className="px-4 py-2 text-xs font-bold text-[#5F667A] dark:text-[#BAC3DC] hover:text-[#171A2B] cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => openInquiryForSpecialty(activeModalSpecialty)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#FF7817] hover:bg-[#E66606] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>Request Treatment Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MEDICAL INQUIRY & CONSULTATION REQUEST */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111638] rounded-3xl border border-[#E2E6EF] dark:border-[#202754] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E6EF] dark:border-[#202754] pb-4">
              <div>
                <span className="text-xs font-bold text-[#FF7817] uppercase tracking-wider block">
                  AW Ali Health Division
                </span>
                <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
                  Medical Consultation Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FF7817]/20 text-[#FF7817] flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
                  Medical Request Received!
                </h4>
                <p className="text-xs text-[#5F667A] dark:text-[#AAB2CA] max-w-sm mx-auto">
                  Thank you. An AW Ali clinical liaison officer will contact you within 24 hours at the provided phone number to review your case and coordinate medical records.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                    Patient or Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.patientName}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, patientName: e.target.value })
                    }
                    placeholder="e.g. Hassan Ahmed"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#151A46] text-xs text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      placeholder="+252 61..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#151A46] text-xs text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                      Clinical Specialty *
                    </label>
                    <select
                      value={inquiryForm.specialty}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, specialty: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#151A46] text-xs text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                    >
                      {specialties.map(specialty => (
                        <option key={specialty.id} value={specialty.name}>{specialty.name}</option>
                      ))}
                      <option value="Hospital & Clinic Advisory">Hospital & Clinic Advisory</option>
                      <option value="Medical Equipment Procurement">Medical Equipment Procurement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                      Preferred Destination
                    </label>
                    <select
                      value={inquiryForm.preferredDestination}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, preferredDestination: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#151A46] text-xs text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                    >
                      <option value="Turkey (Istanbul / Ankara)">Turkey (Istanbul / Ankara)</option>
                      <option value="India (New Delhi / Mumbai)">India (New Delhi / Mumbai)</option>
                      <option value="UAE (Dubai / Abu Dhabi)">UAE (Dubai / Abu Dhabi)</option>
                      <option value="Germany / Europe">Germany / Europe</option>
                      <option value="Local Consultation (Somalia)">Local Consultation (Somalia)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                      Case Urgency
                    </label>
                    <select
                      value={inquiryForm.urgency}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, urgency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#151A46] text-xs text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                    >
                      <option value="Normal (Planning ahead)">Normal (Planning ahead)</option>
                      <option value="Urgent (Within 1 to 2 weeks)">Urgent (Within 1 to 2 weeks)</option>
                      <option value="Emergency (Immediate medical evaluation)">
                        Emergency (Immediate evaluation)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A2B] dark:text-[#D9DDE8] mb-1">
                    Medical Condition / Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryForm.medicalNotes}
                    onChange={(e) =>
                      setInquiryForm({ ...inquiryForm, medicalNotes: e.target.value })
                    }
                    placeholder="Briefly describe the diagnosis, doctor's recommendations, or questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#151A46] text-xs text-[#171A2B] dark:text-white focus:outline-none focus:border-[#FF7817]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-[#5F667A] dark:text-[#BAC3DC] hover:text-[#171A2B] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#FF7817] hover:bg-[#E66606] rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Medical Evaluation Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
