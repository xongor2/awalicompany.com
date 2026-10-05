import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'tr' | 'so' | 'fr' | 'ar';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', dir: 'ltr' },
  { code: 'fr', name: 'France', nativeName: 'Français', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    'topbar.phone': '+252 61 3295050',
    'topbar.email': 'info@awalicompany.com',
    'topbar.location': 'Mogadishu, Somalia',
    'topbar.hours': 'Sat – Thu: 8:00 AM – 6:00 PM',
    'topbar.partner': 'Accredited Global Partner',
    'topbar.select_lang': 'Select Language',
    'nav.home': 'Home',
    'nav.consulting': 'Consulting',
    'nav.health': 'Health',
    'nav.education': 'Education',
    'nav.realEstate': 'Real Estate',
    'nav.agencies': 'Agencies',
    'nav.aboutUs': 'About us',
    'nav.ourStory': 'Our Story',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.portal': 'Management Portal',
    'nav.accessPortal': 'Access Management Portal',
  },
  so: {
    'topbar.phone': '+252 61 3295050',
    'topbar.email': 'info@awalicompany.com',
    'topbar.location': 'Muqdisho, Soomaaliya',
    'topbar.hours': 'Sab – Kham: 8:00 AM – 6:00 PM',
    'topbar.partner': 'Shuraako Caalami ah oo La Aqoonsan yahay',
    'topbar.select_lang': 'Dooro Luuqadda',
    'nav.home': 'Hoyga',
    'nav.consulting': 'La-talin Ganacsi',
    'nav.health': 'Caafimaad',
    'nav.education': 'Waxbarasho',
    'nav.realEstate': 'Guryaha & Dhulka',
    'nav.agencies': 'Wakaaladaha',
    'nav.aboutUs': 'Nagu Saabsan',
    'nav.ourStory': 'Sheekadeena',
    'nav.blog': 'Wararka & Blog',
    'nav.contact': 'Xiriirka',
    'nav.portal': 'Bogga Maamulka',
    'nav.accessPortal': 'Gal Bogga Maamulka',
  },
  tr: {
    'topbar.phone': '+252 61 3295050',
    'topbar.email': 'info@awalicompany.com',
    'topbar.location': 'Mogadişu, Somali',
    'topbar.hours': 'Cmt – Per: 08:00 – 18:00',
    'topbar.partner': 'Akredite Küresel Ortak',
    'topbar.select_lang': 'Dil Seçin',
    'nav.home': 'Ana Sayfa',
    'nav.consulting': 'Danışmanlık',
    'nav.health': 'Sağlık',
    'nav.education': 'Eğitim',
    'nav.realEstate': 'Gayrimenkul',
    'nav.agencies': 'Acenteler',
    'nav.aboutUs': 'Hakkımızda',
    'nav.ourStory': 'Hikayemiz',
    'nav.blog': 'Blog & Haberler',
    'nav.contact': 'İletişim',
    'nav.portal': 'Yönetim Portalı',
    'nav.accessPortal': 'Yönetim Portalına Giriş',
  },
  fr: {
    'topbar.phone': '+252 61 3295050',
    'topbar.email': 'info@awalicompany.com',
    'topbar.location': 'Mogadiscio, Somalie',
    'topbar.hours': 'Sam – Jeu: 8h00 – 18h00',
    'topbar.partner': 'Partenaire Mondial Agréé',
    'topbar.select_lang': 'Choisir la langue',
    'nav.home': 'Accueil',
    'nav.consulting': 'Conseil',
    'nav.health': 'Santé',
    'nav.education': 'Éducation',
    'nav.realEstate': 'Immobilier',
    'nav.agencies': 'Agences',
    'nav.aboutUs': 'À propos',
    'nav.ourStory': 'Notre Histoire',
    'nav.blog': 'Blog & Actualités',
    'nav.contact': 'Contact',
    'nav.portal': 'Portail de Gestion',
    'nav.accessPortal': 'Accéder au Portail',
  },
  ar: {
    'topbar.phone': '+252 61 3295050',
    'topbar.email': 'info@awalicompany.com',
    'topbar.location': 'مقديشو، الصومال',
    'topbar.hours': 'السبت – الخميس: 8:00 ص – 6:00 م',
    'topbar.partner': 'شريك عالمي معتمد',
    'topbar.select_lang': 'اختر اللغة',
    'nav.home': 'الرئيسية',
    'nav.consulting': 'الاستشارات',
    'nav.health': 'الصحة',
    'nav.education': 'التعليم',
    'nav.realEstate': 'العقارات',
    'nav.agencies': 'الوكالات',
    'nav.aboutUs': 'من نحن',
    'nav.ourStory': 'قصتنا',
    'nav.blog': 'المدونة والأخبار',
    'nav.contact': 'اتصل بنا',
    'nav.portal': 'بوابة الإدارة',
    'nav.accessPortal': 'الدخول لبوابة الإدارة',
  },
};

// Global in-house DOM phrase dictionary for 100% manual, authentic translation
export const DOM_PHRASES: Record<LanguageCode, Record<string, string>> = {
  en: {},
  so: {
    'Your Goals. Our Guidance.': 'Yoolalkaaga. Hagisteena.',
    'Real Results. YOUR LIFE.': 'Natiijooyin Dhab ah. NOLOSHAADA.',
    'Start Here Now': 'Halkan Ka Bilow Hadda',
    'Explore Consulting': 'Sahami La-talinta',
    'From Education & Work, To Spirituality & Citizenry. Decades of experience.': 'Laga bilaabo Waxbarashada & Shaqada, ilaa Horumarka Bulshada. Tobannaan sano oo waayo-aragnimo ah.',
    'Whether you’re starting your university journey, exploring online learning, or planning to import goods for your business we’re here to help. Our expert consulting is tailored to your goals, offering clear guidance and practical solutions every step of the way. Let’s turn your vision into reality.': 'Haddii aad bilaabayso tacliintaada jaamacadeed, barashada internetka, ama aad qorshaynayso inaad ganacsigaaga wax u soo dejiso, waxaan diyaar u nahay inaan ku caawino. La-talintayada khibradda leh waxay ku habboon tahay yoolalkaaga.',
    'University & Online Learning': 'Jaamacadda & Waxbarashada Khadka Tooska ah',
    'Medical Tourism & Hospital Solutions': 'Dalxiiska Caafimaadka & Xalalka Isbitaallada',
    'Custom Business Advisory': 'La-talinta Ganacsiga ee Khaaska ah',
    'Guidance for university admissions, degree programs, and global online learning certifications.': 'Hagidda gelitaanka jaamacadaha, shahaadooyinka, iyo waxbarashada caalamiga ah ee khadka tooska ah.',
    'Accredited international hospital admissions, specialist second opinions, and patient concierge.': 'Isbitaallo caalami ah oo la aqoonsan yahay, ra’yiga labaad ee takhasuska, iyo daryeelka bukaanka.',
    'Actionable business strategy, capacity building, and organizational transformation.': 'Istaraatiijiyad ganacsi oo wax ku ool ah, dhisidda awoodda, iyo beddelka hay’adda.',
    'Global Enterprise Ecosystem': 'Nidaamka Ganacsiga Caalamiga ah',
    'Operating across East Africa, Middle East, Europe & South Asia': 'Ka howlgala Bariga Afrika, Bariga Dhexe, Yurub & Koonfurta Aasiya',
    'Students Placed Globally': 'Arday Wax Ka Barta Caalamka',
    'Across premier accredited universities in 12+ nations': 'Jaamacado caalami ah oo la aqoonsan yahay oo ku yaal 12+ waddan',
    'Facilitated Trade & Cargo': 'Fududeynta Ganacsiga & Xamuulka',
    'Secure cross border logistics & commercial goods clearance': 'Saadka xuduudaha ka gudba & nadiifinta alaabta ganacsiga ee ammaan ah',
    'Prime Real Estate Assets': 'Hantida Maguurtada ah ee Xulan',
    'High yield commercial hubs, luxury villas & development plots': 'Xarumo ganacsi oo faa\'iido badan, filooyin raaxo leh & dhulalka horumarinta',
    'Institutional Track Record': 'Taariikh Shaqo oo La Xaqiijiyay',
    'Uncompromising corporate governance & strategic advisory': 'Maamul wanaag hufan & la-talin istiraatiiji ah',
    'Our Core Sectors & Services': 'Qaybaha & Adeegyadayada Muhiimka ah',
    'Discover our specialized divisions delivering world-class standards, integrity, and sustainable execution.': 'Baro laamahayada gaarka ah ee bixiya adeegyada heerka caalami, daacadnimada, iyo fulinta tayada leh.',
    'Featured Properties & Developments': 'Guryaha & Dhulalka Horumarineed ee Xulan',
    'Explore verified commercial, residential, and development real estate opportunities across key growth zones.': 'Sahami fursado dhab ah oo ganacsi iyo deegaan ah oo ku yaal aagagga ugu kobaca badan.',
    'View All Properties': 'Eeg Dhammaan Guryaha',
    'Delivering Excellence with Integrity': 'Bixinta Tayo Sare oo Leh Daacadnimo',
    'Latest Insights & Corporate News': 'Wararkii Ugu Dambeeyay & Xogta Shirkadda',
    'Read Full Article': 'Akhriso Maqaalka oo Dhan',
    'View All Insights': 'Eeg Dhammaan Wararka',
    'Ready to Scale Your Investments & Enterprise in Somalia?': 'Diyaar ma u tahay inaad Kobciso Maalgashigaaga & Ganacsigaaga Soomaaliya?',
    'Connect with our leadership team for advisory, joint ventures, property acquisitions, and institutional partnerships.': 'La xiriir kooxdayada maamulka sare si aad u hesho la-talin, iskaashi maalgashi, iyo guryo tayo sare leh.',
    'Contact Corporate Desk': 'La Xiriir Xafiiska Sare',
    'Access Client Portal': 'Gal Bogga Macmiilka',
    'Quick Links': 'Xiriirinta Degdegga ah',
    'Core Sectors': 'Qaybaha Muhiimka ah',
    'Contact Info': 'Faahfaahinta Xiriirka',
    'All rights reserved.': 'Xuquuqda oo dhan way dhowran tahay.',
    'Management Portal': 'Bogga Maamulka',
    'Access Management Portal': 'Gal Bogga Maamulka',
    'Home': 'Hoyga',
    'Consulting': 'La-talin',
    'Health': 'Caafimaad',
    'Education': 'Waxbarasho',
    'Real Estate': 'Guryaha & Dhulka',
    'Agencies': 'Wakaaladaha',
    'About us': 'Nagu Saabsan',
    'Our Story': 'Sheekadeena',
    'Blog': 'Wararka',
    'Contact': 'Xiriirka',
    'Mogadishu, Somalia': 'Muqdisho, Soomaaliya',
    'Select Language': 'Dooro Luuqadda',
    'Inquire Now': 'Weydii Hadda',
    'View Details': 'Faahfaahinta Eeg',
    'Bedrooms': 'Qolalka Jiifka',
    'Bathrooms': 'Musqulaha',
    'Commercial': 'Ganacsi',
    'Residential': 'Deegaan',
  },
  tr: {
    'Your Goals. Our Guidance.': 'Hedefleriniz. Rehberliğimiz.',
    'Real Results. YOUR LIFE.': 'Gerçek Sonuçlar. SİZİN HAYATINIZ.',
    'Start Here Now': 'Şimdi Buradan Başlayın',
    'Explore Consulting': 'Danışmanlığı Keşfedin',
    'From Education & Work, To Spirituality & Citizenry. Decades of experience.': 'Eğitim ve İşten Maneviyata ve Vatandaşlığa. Onlarca yıllık deneyim.',
    'University & Online Learning': 'Üniversite ve Çevrimiçi Eğitim',
    'Medical Tourism & Hospital Solutions': 'Sağlık Turizmi ve Hastane Çözümleri',
    'Custom Business Advisory': 'Özel İş Danışmanlığı',
    'Global Enterprise Ecosystem': 'Küresel Kurumsal Ekosistem',
    'Operating across East Africa, Middle East, Europe & South Asia': 'Doğu Afrika, Orta Doğu, Avrupa ve Güney Asya\'da faaliyet gösteriyor',
    'Students Placed Globally': 'Küresel Olarak Yerleştirilen Öğrenciler',
    'Facilitated Trade & Cargo': 'Kolaylaştırılmış Ticaret ve Kargo',
    'Prime Real Estate Assets': 'Seçkin Gayrimenkul Varlıkları',
    'Institutional Track Record': 'Kurumsal Başarı Geçmişi',
    'Our Core Sectors & Services': 'Temel Sektörlerimiz ve Hizmetlerimiz',
    'Featured Properties & Developments': 'Öne Çıkan Gayrimenkul Projeleri',
    'View All Properties': 'Tüm Mülkleri Gör',
    'Delivering Excellence with Integrity': 'Dürüstlükle Mükemmellik Sunuyoruz',
    'Latest Insights & Corporate News': 'En Son Görüşler ve Kurumsal Haberler',
    'Read Full Article': 'Makaleyi Oku',
    'View All Insights': 'Tüm Haberleri Gör',
    'Ready to Scale Your Investments & Enterprise in Somalia?': 'Somali\'de Yatırımlarınızı Büyütmeye Hazır mısınız?',
    'Contact Corporate Desk': 'Kurumsal İletişim',
    'Access Client Portal': 'Müşteri Portalı',
    'Quick Links': 'Hızlı Bağlantılar',
    'Core Sectors': 'Ana Sektörler',
    'Contact Info': 'İletişim Bilgileri',
    'All rights reserved.': 'Tüm hakları saklıdır.',
    'Management Portal': 'Yönetim Portalı',
    'Access Management Portal': 'Yönetim Portalına Giriş',
    'Home': 'Ana Sayfa',
    'Consulting': 'Danışmanlık',
    'Health': 'Sağlık',
    'Education': 'Eğitim',
    'Real Estate': 'Gayrimenkul',
    'Agencies': 'Acenteler',
    'About us': 'Hakkımızda',
    'Our Story': 'Hikayemiz',
    'Blog': 'Blog',
    'Contact': 'İletişim',
  },
  fr: {
    'Your Goals. Our Guidance.': 'Vos Objectifs. Notre Orientation.',
    'Real Results. YOUR LIFE.': 'Des Résultats Réels. VOTRE VIE.',
    'Start Here Now': 'Commencer Dès Maintenant',
    'Explore Consulting': 'Découvrir le Conseil',
    'From Education & Work, To Spirituality & Citizenry. Decades of experience.': 'De l\'éducation et du travail à la citoyenneté. Des décennies d\'expérience.',
    'University & Online Learning': 'Université et Enseignement en Ligne',
    'Medical Tourism & Hospital Solutions': 'Tourisme Médical et Solutions Hospitalières',
    'Custom Business Advisory': 'Conseil d\'Entreprise Sur Mesure',
    'Global Enterprise Ecosystem': 'Écosystème d\'Entreprise Mondial',
    'Operating across East Africa, Middle East, Europe & South Asia': 'Opérant en Afrique de l\'Est, au Moyen-Orient, en Europe et en Asie du Sud',
    'Students Placed Globally': 'Étudiants Placés dans le Monde',
    'Facilitated Trade & Cargo': 'Commerce & Fret Facilités',
    'Prime Real Estate Assets': 'Actifs Immobiliers de Premier Ordre',
    'Institutional Track Record': 'Expérience Institutionnelle Éprouvée',
    'Our Core Sectors & Services': 'Nos Secteurs Clés et Services',
    'Featured Properties & Developments': 'Propriétés et Projets Immobiliers',
    'View All Properties': 'Voir Toutes les Propriétés',
    'Delivering Excellence with Integrity': 'Offrir l\'Excellence avec Intégrité',
    'Latest Insights & Corporate News': 'Dernières Analyses & Nouvelles',
    'Read Full Article': 'Lire l\'Article',
    'View All Insights': 'Voir Toutes les Actualités',
    'Ready to Scale Your Investments & Enterprise in Somalia?': 'Prêt à Développer vos Investissements en Somalie ?',
    'Contact Corporate Desk': 'Contacter la Direction',
    'Access Client Portal': 'Portail Client',
    'Quick Links': 'Liens Rapides',
    'Core Sectors': 'Secteurs Clés',
    'Contact Info': 'Coordonnées',
    'All rights reserved.': 'Tous droits réservés.',
    'Management Portal': 'Portail de Gestion',
    'Access Management Portal': 'Accéder au Portail',
    'Home': 'Accueil',
    'Consulting': 'Conseil',
    'Health': 'Santé',
    'Education': 'Éducation',
    'Real Estate': 'Immobilier',
    'Agencies': 'Agences',
    'About us': 'À propos',
    'Our Story': 'Notre Histoire',
    'Blog': 'Blog',
    'Contact': 'Contact',
  },
  ar: {
    'Your Goals. Our Guidance.': 'أهدافك. إرشادنا.',
    'Real Results. YOUR LIFE.': 'نتائج حقيقية. حياتك.',
    'Start Here Now': 'ابدأ هنا الآن',
    'Explore Consulting': 'استكشف الاستشارات',
    'From Education & Work, To Spirituality & Citizenry. Decades of experience.': 'من التعليم والعمل إلى المواطنة. عقود من الخبرة.',
    'University & Online Learning': 'التعليم الجامعي وعبر الإنترنت',
    'Medical Tourism & Hospital Solutions': 'السياحة العلاجية والحلول الطبية',
    'Custom Business Advisory': 'استشارات الأعمال المخصصة',
    'Global Enterprise Ecosystem': 'منظومة المشاريع العالمية',
    'Operating across East Africa, Middle East, Europe & South Asia': 'العمل عبر شرق أفريقيا والشرق الأوسط وأوروبا وجنوب آسيا',
    'Students Placed Globally': 'طلاب ملتحقون عالمياً',
    'Facilitated Trade & Cargo': 'تجارة وبضائع ميسرة',
    'Prime Real Estate Assets': 'أصول عقارية مميزة',
    'Institutional Track Record': 'سجل إنجازات مؤسسي',
    'Our Core Sectors & Services': 'قطاعاتنا وخدماتنا الرئيسية',
    'Featured Properties & Developments': 'أبرز العقارات والمشاريع التطويرية',
    'View All Properties': 'عرض جميع العقارات',
    'Delivering Excellence with Integrity': 'تقديم التميز بأعلى درجات النزاهة',
    'Latest Insights & Corporate News': 'أحدث الرؤى والأخبار المؤسسية',
    'Read Full Article': 'قراءة المقال بالكامل',
    'View All Insights': 'عرض جميع الأخبار',
    'Ready to Scale Your Investments & Enterprise in Somalia?': 'هل أنت مستعد لتوسيع استثماراتك وأعمالك في الصومال؟',
    'Contact Corporate Desk': 'تواصل مع الإدارة',
    'Access Client Portal': 'بوابة العملاء',
    'Quick Links': 'روابط سريعة',
    'Core Sectors': 'القطاعات الرئيسية',
    'Contact Info': 'معلومات الاتصال',
    'All rights reserved.': 'جميع الحقوق محفوظة.',
    'Management Portal': 'بوابة الإدارة',
    'Access Management Portal': 'الدخول لبوابة الإدارة',
    'Home': 'الرئيسية',
    'Consulting': 'الاستشارات',
    'Health': 'الصحة',
    'Education': 'التعليم',
    'Real Estate': 'العقارات',
    'Agencies': 'الوكالات',
    'About us': 'من نحن',
    'Our Story': 'قصتنا',
    'Blog': 'المدونة',
    'Contact': 'اتصل بنا',
  },
};

const originalTextMap = new WeakMap<Node, string>();

function translateDOM(targetLang: LanguageCode) {
  if (typeof document === 'undefined') return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'code') {
          return NodeFilter.FILTER_REJECT;
        }
        const text = node.textContent?.trim() || '';
        return text.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    }
  );

  const nodes: Node[] = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  const dict = DOM_PHRASES[targetLang];

  for (const node of nodes) {
    if (!originalTextMap.has(node)) {
      originalTextMap.set(node, node.textContent || '');
    }
    const orig = originalTextMap.get(node) || '';
    if (!orig) continue;

    if (targetLang === 'en') {
      if (node.textContent !== orig) {
        node.textContent = orig;
      }
      continue;
    }

    if (!dict) continue;

    const trimmed = orig.trim();
    if (dict[trimmed]) {
      node.textContent = orig.replace(trimmed, dict[trimmed]);
    } else {
      let replaced = orig;
      let hasMatch = false;
      for (const [enPhrase, transPhrase] of Object.entries(dict)) {
        if (replaced.includes(enPhrase)) {
          replaced = replaced.replaceAll(enPhrase, transPhrase);
          hasMatch = true;
        }
      }
      if (hasMatch) {
        node.textContent = replaced;
      }
    }
  }
}

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  currentInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('aw_ali_language') as LanguageCode;
    return ['en', 'tr', 'so', 'fr', 'ar'].includes(saved) ? saved : 'en';
  });

  // Clean up any old Google Translate cookies from browser
  useEffect(() => {
    try {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (window.location.hostname) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
      }
    } catch {}
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('aw_ali_language', lang);

    document.documentElement.lang = lang;
    const info = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    if (info) {
      document.documentElement.dir = info.dir;
      if (info.dir === 'rtl') {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }

    // Run custom in-house DOM translation immediately
    translateDOM(lang);
  };

  useEffect(() => {
    const info = SUPPORTED_LANGUAGES.find(l => l.code === language);
    document.documentElement.lang = language;
    if (info && info.dir === 'rtl') {
      document.documentElement.dir = 'rtl';
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.classList.remove('rtl');
    }

    // Run DOM translation
    translateDOM(language);
    const t1 = setTimeout(() => translateDOM(language), 50);
    const t2 = setTimeout(() => translateDOM(language), 300);

    // Watch for dynamic route / component changes to translate newly added nodes
    let observer: MutationObserver | null = null;
    if (language !== 'en' && typeof MutationObserver !== 'undefined') {
      let timeoutId: number;
      observer = new MutationObserver(() => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          translateDOM(language);
        }, 60);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  const currentInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentInfo }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
