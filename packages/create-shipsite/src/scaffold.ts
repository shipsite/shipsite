import { deflateSync } from 'zlib';

// ─── Public Types ────────────────────────────────────────────

export interface ScaffoldOptions {
  projectName: string;
  template?: 'shipsite' | 'custom';  // default: "shipsite"
  primaryColor?: string;    // default: "#059669"
  locales?: string[];       // default: ["en"]
  cliVersion?: string;      // for package.json dependencies
}

export interface ScaffoldFile {
  path: string;             // e.g. "shipsite.json"
  content: string;          // Text or Base64 string
  encoding: "utf-8" | "base64";
}

// ─── Minimal PNG generator (zero dependencies) ──────────────

const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])), 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

/** Generate a solid-color PNG (RGB, no alpha). */
function generatePng(width: number, height: number, hex: string): Buffer {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const rowBytes = 1 + width * 3;
  const raw = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const off = y * rowBytes;
    raw[off] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = off + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Generate an OG image PNG (1200x630) with a vertical gradient. */
function generateOgPng(hex: string): Buffer {
  const width = 1200;
  const height = 630;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const rowBytes = 1 + width * 3;
  const raw = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const off = y * rowBytes;
    raw[off] = 0; // filter: none
    // Gradient: top is lighter (+40), bottom is darker (-40)
    const t = y / (height - 1);
    const pr = Math.min(255, Math.max(0, Math.round(r + 40 * (1 - t) - 40 * t)));
    const pg = Math.min(255, Math.max(0, Math.round(g + 40 * (1 - t) - 40 * t)));
    const pb = Math.min(255, Math.max(0, Math.round(b + 40 * (1 - t) - 40 * t)));
    for (let x = 0; x < width; x++) {
      const px = off + 1 + x * 3;
      raw[px] = pr;
      raw[px + 1] = pg;
      raw[px + 2] = pb;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Generate an abstract SVG blog cover image (1200×800, 3:2). */
function generateBlogSvg(hex: string, variant: 'a' | 'b' | 'c'): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const light = `rgba(${Math.min(r + 60, 255)},${Math.min(g + 60, 255)},${Math.min(b + 60, 255)},0.6)`;
  const dark = `rgba(${Math.max(r - 40, 0)},${Math.max(g - 40, 0)},${Math.max(b - 40, 0)},0.5)`;

  const shapes: Record<'a' | 'b' | 'c', string> = {
    a: `<circle cx="900" cy="200" r="180" fill="${light}"/><circle cx="300" cy="600" r="120" fill="${dark}"/><rect x="500" y="350" width="300" height="300" rx="40" fill="${light}"/>`,
    b: `<rect x="100" y="100" width="250" height="250" rx="50" fill="${dark}"/><circle cx="800" cy="500" r="200" fill="${light}"/><rect x="950" y="150" width="150" height="400" rx="30" fill="${dark}"/>`,
    c: `<circle cx="600" cy="400" r="250" fill="${light}"/><rect x="80" y="500" width="200" height="200" rx="60" fill="${dark}"/><circle cx="1000" cy="250" r="130" fill="${dark}"/>`,
  };

  const gradDirs: Record<'a' | 'b' | 'c', [string, string]> = {
    a: ['0%', '100%'],
    b: ['100%', '0%'],
    c: ['50%', '100%'],
  };

  const [gx, gy] = gradDirs[variant];

  return `<svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="${gx}" y2="${gy}">
      <stop offset="0%" stop-color="${hex}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  ${shapes[variant]}
</svg>`;
}

/** Generate a simple circle avatar placeholder SVG. */
function generateTeamSvg(hex: string): string {
  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="100" fill="${hex}"/>
  <circle cx="100" cy="80" r="30" fill="white" opacity="0.9"/>
  <ellipse cx="100" cy="150" rx="45" ry="30" fill="white" opacity="0.9"/>
</svg>`;
}

// ─── Default label translations ─────────────────────────────

const translations: Record<string, Record<string, string>> = {
  Features:         { en: 'Features',         de: 'Funktionen',          fr: 'Fonctionnalités',       es: 'Características' },
  Pricing:          { en: 'Pricing',          de: 'Preise',              fr: 'Tarifs',                es: 'Precios' },
  Blog:             { en: 'Blog',             de: 'Blog',                fr: 'Blog',                  es: 'Blog' },
  'Get Started':    { en: 'Get Started',      de: 'Loslegen',            fr: 'Commencer',             es: 'Comenzar' },
  Product:          { en: 'Product',          de: 'Produkt',             fr: 'Produit',               es: 'Producto' },
  Legal:            { en: 'Legal',            de: 'Rechtliches',         fr: 'Mentions légales',      es: 'Legal' },
  'Privacy Policy': { en: 'Privacy Policy',   de: 'Datenschutz',         fr: 'Politique de confidentialité', es: 'Política de privacidad' },
  'Terms of Service': { en: 'Terms of Service', de: 'Nutzungsbedingungen', fr: 'Conditions d\'utilisation', es: 'Términos de servicio' },
};

function localizedLabel(
  key: string,
  locales: string[],
): string | Record<string, string> {
  if (locales.length <= 1) {
    const locale = locales[0] || 'en';
    return translations[key]?.[locale] || key;
  }
  const map: Record<string, string> = {};
  for (const locale of locales) {
    map[locale] = translations[key]?.[locale] || key;
  }
  return map;
}

// ─── Landing page strings ───────────────────────────────────

function getLandingStrings(projectName: string): Record<string, Record<string, string>> {
  return {
    en: {
      metaTitle: `${projectName} \u2014 Ship Products Faster`,
      metaDesc: 'The modern platform that helps teams build, launch, and scale products with confidence.',
      heroBadge: 'Just launched',
      heroTitle: 'Ship Products Faster Than Ever',
      heroDesc: 'The modern platform that helps teams build, launch, and scale with confidence. Stop wrestling with infrastructure and start delivering value.',
      primaryCta: 'Start Free Trial',
      secondaryCta: 'See How It Works',
      socialProof: 'Trusted by 2,000+ teams worldwide',
      featuresTitle: 'Everything You Need to Succeed',
      featuresDesc: 'Powerful features designed to streamline your workflow from day one.',
      feat1Title: 'Lightning-Fast Setup', feat1Desc: 'Go from zero to production in under five minutes. Our guided onboarding handles the heavy lifting so you can focus on what matters.',
      feat2Title: 'Real-Time Collaboration', feat2Desc: 'Work together seamlessly with live editing, comments, and shared workspaces. Keep your entire team on the same page.',
      feat3Title: 'Advanced Analytics', feat3Desc: 'Understand your users with built-in analytics dashboards. Track engagement, retention, and growth metrics out of the box.',
      feat4Title: 'Workflow Automation', feat4Desc: 'Automate repetitive tasks with powerful triggers and actions. Set up once and let the system handle the rest.',
      feat5Title: 'Enterprise-Grade Security', feat5Desc: 'SOC 2 compliant with end-to-end encryption, SSO, and role-based access controls. Your data stays safe.',
      feat6Title: 'Seamless Integrations', feat6Desc: 'Connect with the tools you already use. Slack, GitHub, Jira, and 100+ integrations available out of the box.',
      bentoTitle: 'Built for Modern Teams', bentoDesc: `See what sets ${projectName} apart from the rest.`,
      bento1Title: 'Visual Workflow Builder', bento1Desc: 'Design complex workflows with an intuitive drag-and-drop interface. No coding required for common automation tasks.',
      bento2Title: 'API-First Architecture', bento2Desc: 'Every feature is accessible via our REST and GraphQL APIs. Build custom integrations with comprehensive documentation.',
      bento3Title: 'Global Edge Network', bento3Desc: 'Deploy to 150+ edge locations worldwide. Your users get sub-100ms response times no matter where they are.',
      bento4Title: 'Team Dashboard', bento4Desc: 'A unified command center for your entire organization. Monitor projects, track progress, and manage resources from a single view.',
      stepsTitle: 'How It Works', stepsDesc: 'Get up and running in three simple steps.',
      step1Title: 'Create Your Account', step1Desc: 'Sign up in seconds with your email or SSO provider. No credit card required to get started.',
      step2Title: 'Configure Your Workspace', step2Desc: 'Import your existing data, invite your team, and customize your workspace to match your workflow.',
      step3Title: 'Launch and Scale', step3Desc: 'Go live with one click. Our infrastructure scales automatically to handle any amount of traffic.',
      testimonialsTitle: 'Loved by Teams Everywhere',
      t1Quote: 'We cut our development time in half after switching. The workflow automation alone saved us 20 hours a week.', t1Author: 'Sarah Chen', t1Role: 'VP of Engineering', t1Company: 'Acme Corp',
      t2Quote: 'The best developer experience I have ever used. Everything just works, and the API documentation is phenomenal.', t2Author: 'Marcus Rivera', t2Role: 'Lead Developer', t2Company: 'TechFlow',
      t3Quote: 'Finally a platform that scales with us. We went from 1,000 to 100,000 users without changing a single config.', t3Author: 'Emily Nakamura', t3Role: 'CTO', t3Company: 'ScaleUp Inc',
      statsTitle: 'The Numbers Speak for Themselves',
      stat1Label: 'Active Teams', stat1Desc: `Teams shipping with ${projectName}`,
      stat2Label: 'Uptime', stat2Desc: 'Enterprise-grade reliability',
      stat3Label: 'Integrations', stat3Desc: 'Connect your favorite tools',
      stat4Label: 'Rating', stat4Desc: 'Average customer satisfaction',
      faqTitle: 'Frequently Asked Questions',
      faq1Q: 'Is there a free plan?', faq1A: 'Yes! Our free plan includes all core features for up to 5 team members. No credit card required and no time limit.',
      faq2Q: 'How long does setup take?', faq2A: 'Most teams are up and running in under 5 minutes. Our guided onboarding walks you through everything, and you can import existing data with a single click.',
      faq3Q: 'Can I cancel anytime?', faq3A: 'Absolutely. There are no long-term contracts or cancellation fees. You can upgrade, downgrade, or cancel your plan at any time.',
      faq4Q: 'Is my data secure?', faq4A: 'Security is our top priority. We are SOC 2 Type II compliant, use end-to-end encryption, and offer SSO and role-based access controls on all paid plans.',
      faq5Q: 'Do you offer support?', faq5A: 'We provide email support on all plans and priority support with a dedicated account manager on Pro and Enterprise plans. Our average response time is under 2 hours.',
      ctaTitle: 'Ready to ship faster?', ctaButton: 'Start Your Free Trial', ctaSubtext: 'No credit card required. Free plan available forever.',
    },
    de: {
      metaTitle: `${projectName} \u2014 Produkte schneller ausliefern`,
      metaDesc: 'Die moderne Plattform, die Teams hilft, Produkte zu entwickeln, zu launchen und zu skalieren.',
      heroBadge: 'Gerade gestartet',
      heroTitle: 'Produkte schneller ausliefern als je zuvor',
      heroDesc: 'Die moderne Plattform, die Teams hilft, mit Zuversicht zu entwickeln, zu launchen und zu skalieren. Schluss mit Infrastruktur-Problemen \u2014 konzentrieren Sie sich auf das Wesentliche.',
      primaryCta: 'Kostenlos testen',
      secondaryCta: 'So funktioniert es',
      socialProof: 'Bereits von 2.000+ Teams weltweit genutzt',
      featuresTitle: 'Alles, was Sie brauchen',
      featuresDesc: 'Leistungsstarke Funktionen, die Ihren Workflow vom ersten Tag an optimieren.',
      feat1Title: 'Blitzschnelle Einrichtung', feat1Desc: 'In weniger als fuenf Minuten produktionsbereit. Unser Onboarding-Assistent nimmt Ihnen die schwere Arbeit ab.',
      feat2Title: 'Echtzeit-Zusammenarbeit', feat2Desc: 'Arbeiten Sie nahtlos zusammen mit Live-Bearbeitung, Kommentaren und geteilten Arbeitsbereichen.',
      feat3Title: 'Erweiterte Analysen', feat3Desc: 'Verstehen Sie Ihre Nutzer mit integrierten Analyse-Dashboards. Engagement, Retention und Wachstum auf einen Blick.',
      feat4Title: 'Workflow-Automatisierung', feat4Desc: 'Automatisieren Sie wiederkehrende Aufgaben mit Triggern und Aktionen. Einmal einrichten, dauerhaft profitieren.',
      feat5Title: 'Enterprise-Sicherheit', feat5Desc: 'SOC 2-konform mit Ende-zu-Ende-Verschluesselung, SSO und rollenbasierter Zugriffskontrolle.',
      feat6Title: 'Nahtlose Integrationen', feat6Desc: 'Verbinden Sie die Tools, die Sie bereits nutzen. Slack, GitHub, Jira und 100+ weitere Integrationen.',
      bentoTitle: 'Fuer moderne Teams gebaut', bentoDesc: `Entdecken Sie, was ${projectName} von anderen unterscheidet.`,
      bento1Title: 'Visueller Workflow-Builder', bento1Desc: 'Entwerfen Sie komplexe Workflows mit einer intuitiven Drag-and-Drop-Oberflaeche. Kein Code noetig.',
      bento2Title: 'API-First-Architektur', bento2Desc: 'Jede Funktion ist ueber unsere REST- und GraphQL-APIs verfuegbar. Umfassende Dokumentation inklusive.',
      bento3Title: 'Globales Edge-Netzwerk', bento3Desc: 'Deployment auf 150+ Edge-Standorten weltweit. Antwortzeiten unter 100ms, egal wo Ihre Nutzer sind.',
      bento4Title: 'Team-Dashboard', bento4Desc: 'Eine zentrale Kommandozentrale fuer Ihre gesamte Organisation. Projekte ueberwachen, Fortschritte verfolgen und Ressourcen verwalten.',
      stepsTitle: 'So funktioniert es', stepsDesc: 'In drei einfachen Schritten startklar.',
      step1Title: 'Konto erstellen', step1Desc: 'Registrieren Sie sich in Sekunden mit E-Mail oder SSO. Keine Kreditkarte erforderlich.',
      step2Title: 'Workspace konfigurieren', step2Desc: 'Importieren Sie bestehende Daten, laden Sie Ihr Team ein und passen Sie den Workspace an.',
      step3Title: 'Starten und skalieren', step3Desc: 'Mit einem Klick live gehen. Unsere Infrastruktur skaliert automatisch mit Ihrem Traffic.',
      testimonialsTitle: 'Von Teams weltweit geschaetzt',
      t1Quote: 'Wir haben unsere Entwicklungszeit halbiert. Allein die Workflow-Automatisierung spart uns 20 Stunden pro Woche.', t1Author: 'Sarah Chen', t1Role: 'VP of Engineering', t1Company: 'Acme Corp',
      t2Quote: 'Die beste Developer Experience, die ich je genutzt habe. Alles funktioniert einfach, und die API-Dokumentation ist hervorragend.', t2Author: 'Marcus Rivera', t2Role: 'Lead Developer', t2Company: 'TechFlow',
      t3Quote: 'Endlich eine Plattform, die mit uns skaliert. Wir sind von 1.000 auf 100.000 Nutzer gewachsen, ohne eine einzige Einstellung zu aendern.', t3Author: 'Emily Nakamura', t3Role: 'CTO', t3Company: 'ScaleUp Inc',
      statsTitle: 'Die Zahlen sprechen fuer sich',
      stat1Label: 'Aktive Teams', stat1Desc: `Teams, die mit ${projectName} arbeiten`,
      stat2Label: 'Verfuegbarkeit', stat2Desc: 'Enterprise-Zuverlaessigkeit',
      stat3Label: 'Integrationen', stat3Desc: 'Verbinden Sie Ihre Lieblings-Tools',
      stat4Label: 'Bewertung', stat4Desc: 'Durchschnittliche Kundenzufriedenheit',
      faqTitle: 'Haeufig gestellte Fragen',
      faq1Q: 'Gibt es einen kostenlosen Plan?', faq1A: 'Ja! Unser kostenloser Plan umfasst alle Kernfunktionen fuer bis zu 5 Teammitglieder. Keine Kreditkarte noetig, kein Zeitlimit.',
      faq2Q: 'Wie lange dauert die Einrichtung?', faq2A: 'Die meisten Teams sind in weniger als 5 Minuten startklar. Unser Onboarding fuehrt Sie durch alles, und Sie koennen bestehende Daten mit einem Klick importieren.',
      faq3Q: 'Kann ich jederzeit kuendigen?', faq3A: 'Selbstverstaendlich. Keine langfristigen Vertraege, keine Kuendigungsgebuehren. Sie koennen jederzeit upgraden, downgraden oder kuendigen.',
      faq4Q: 'Sind meine Daten sicher?', faq4A: 'Sicherheit hat oberste Prioritaet. Wir sind SOC 2 Type II-zertifiziert, nutzen Ende-zu-Ende-Verschluesselung und bieten SSO und rollenbasierte Zugriffskontrollen.',
      faq5Q: 'Bieten Sie Support an?', faq5A: 'Wir bieten E-Mail-Support bei allen Plaenen und Prioritaets-Support mit dediziertem Account Manager bei Pro- und Enterprise-Plaenen.',
      ctaTitle: 'Bereit, schneller zu liefern?', ctaButton: 'Kostenlos testen', ctaSubtext: 'Keine Kreditkarte noetig. Kostenloser Plan fuer immer verfuegbar.',
    },
    fr: {
      metaTitle: `${projectName} \u2014 Livrez vos produits plus vite`,
      metaDesc: 'La plateforme moderne qui aide les equipes a concevoir, lancer et faire evoluer leurs produits en toute confiance.',
      heroBadge: 'Nouveau',
      heroTitle: 'Livrez vos produits plus vite que jamais',
      heroDesc: 'La plateforme moderne qui aide les equipes a concevoir, lancer et faire evoluer leurs produits en toute confiance. Oubliez les problemes d\'infrastructure.',
      primaryCta: 'Essai gratuit',
      secondaryCta: 'Decouvrir le fonctionnement',
      socialProof: 'Adopte par plus de 2 000 equipes dans le monde',
      featuresTitle: 'Tout ce dont vous avez besoin',
      featuresDesc: 'Des fonctionnalites puissantes pour optimiser votre flux de travail des le premier jour.',
      feat1Title: 'Mise en route ultra-rapide', feat1Desc: 'Passez de zero a la production en moins de cinq minutes. Notre assistant d\'integration s\'occupe du plus difficile.',
      feat2Title: 'Collaboration en temps reel', feat2Desc: 'Travaillez ensemble avec l\'edition en direct, les commentaires et les espaces de travail partages.',
      feat3Title: 'Analyses avancees', feat3Desc: 'Comprenez vos utilisateurs grace a des tableaux de bord analytiques integres. Suivi de l\'engagement et de la croissance.',
      feat4Title: 'Automatisation des workflows', feat4Desc: 'Automatisez les taches repetitives avec des declencheurs et des actions. Configurez une fois, profitez en permanence.',
      feat5Title: 'Securite entreprise', feat5Desc: 'Conforme SOC 2 avec chiffrement de bout en bout, SSO et controles d\'acces bases sur les roles.',
      feat6Title: 'Integrations fluides', feat6Desc: 'Connectez les outils que vous utilisez deja. Slack, GitHub, Jira et plus de 100 integrations disponibles.',
      bentoTitle: 'Concu pour les equipes modernes', bentoDesc: `Decouvrez ce qui distingue ${projectName}.`,
      bento1Title: 'Editeur visuel de workflows', bento1Desc: 'Concevez des workflows complexes avec une interface intuitive par glisser-deposer. Aucun code requis.',
      bento2Title: 'Architecture API-First', bento2Desc: 'Chaque fonctionnalite est accessible via nos API REST et GraphQL. Documentation complete incluse.',
      bento3Title: 'Reseau Edge mondial', bento3Desc: 'Deploiement sur plus de 150 emplacements Edge dans le monde. Temps de reponse inferieur a 100 ms.',
      bento4Title: 'Tableau de bord equipe', bento4Desc: 'Un centre de commande unifie pour toute votre organisation. Suivez les projets, la progression et gerez les ressources.',
      stepsTitle: 'Comment ca marche', stepsDesc: 'Soyez operationnel en trois etapes simples.',
      step1Title: 'Creez votre compte', step1Desc: 'Inscrivez-vous en quelques secondes avec votre e-mail ou SSO. Aucune carte bancaire requise.',
      step2Title: 'Configurez votre espace', step2Desc: 'Importez vos donnees, invitez votre equipe et personnalisez votre espace de travail.',
      step3Title: 'Lancez et evoluez', step3Desc: 'Passez en production en un clic. Notre infrastructure evolue automatiquement avec votre trafic.',
      testimonialsTitle: 'Apprecie par des equipes partout',
      t1Quote: 'Nous avons reduit notre temps de developpement de moitie. L\'automatisation des workflows nous fait gagner 20 heures par semaine.', t1Author: 'Sarah Chen', t1Role: 'VP of Engineering', t1Company: 'Acme Corp',
      t2Quote: 'La meilleure experience developpeur que j\'aie jamais utilisee. Tout fonctionne et la documentation API est remarquable.', t2Author: 'Marcus Rivera', t2Role: 'Lead Developer', t2Company: 'TechFlow',
      t3Quote: 'Enfin une plateforme qui evolue avec nous. Nous sommes passes de 1 000 a 100 000 utilisateurs sans modifier une seule configuration.', t3Author: 'Emily Nakamura', t3Role: 'CTO', t3Company: 'ScaleUp Inc',
      statsTitle: 'Les chiffres parlent d\'eux-memes',
      stat1Label: 'Equipes actives', stat1Desc: `Equipes qui utilisent ${projectName}`,
      stat2Label: 'Disponibilite', stat2Desc: 'Fiabilite niveau entreprise',
      stat3Label: 'Integrations', stat3Desc: 'Connectez vos outils preferes',
      stat4Label: 'Note', stat4Desc: 'Satisfaction client moyenne',
      faqTitle: 'Questions frequentes',
      faq1Q: 'Existe-t-il un plan gratuit?', faq1A: 'Oui! Notre plan gratuit inclut toutes les fonctionnalites de base pour 5 membres d\'equipe maximum. Sans carte bancaire et sans limite de temps.',
      faq2Q: 'Combien de temps prend la mise en route?', faq2A: 'La plupart des equipes sont operationnelles en moins de 5 minutes. Notre assistant vous guide a chaque etape.',
      faq3Q: 'Puis-je annuler a tout moment?', faq3A: 'Absolument. Pas de contrat a long terme ni de frais d\'annulation. Vous pouvez changer de plan a tout moment.',
      faq4Q: 'Mes donnees sont-elles securisees?', faq4A: 'La securite est notre priorite. Nous sommes certifies SOC 2 Type II avec chiffrement de bout en bout et controles d\'acces granulaires.',
      faq5Q: 'Proposez-vous un support?', faq5A: 'Nous offrons un support par e-mail sur tous les plans et un support prioritaire avec un gestionnaire de compte dedie sur les plans Pro et Enterprise.',
      ctaTitle: 'Pret a livrer plus vite?', ctaButton: 'Essai gratuit', ctaSubtext: 'Sans carte bancaire. Plan gratuit disponible pour toujours.',
    },
    es: {
      metaTitle: `${projectName} \u2014 Lanza productos mas rapido`,
      metaDesc: 'La plataforma moderna que ayuda a los equipos a crear, lanzar y escalar productos con confianza.',
      heroBadge: 'Recien lanzado',
      heroTitle: 'Lanza productos mas rapido que nunca',
      heroDesc: 'La plataforma moderna que ayuda a los equipos a crear, lanzar y escalar con confianza. Deja de luchar con la infraestructura y empieza a generar valor.',
      primaryCta: 'Prueba gratuita',
      secondaryCta: 'Ver como funciona',
      socialProof: 'Utilizado por mas de 2000 equipos en todo el mundo',
      featuresTitle: 'Todo lo que necesitas para triunfar',
      featuresDesc: 'Funciones potentes disenadas para optimizar tu flujo de trabajo desde el primer dia.',
      feat1Title: 'Configuracion ultrarapida', feat1Desc: 'De cero a produccion en menos de cinco minutos. Nuestro asistente de incorporacion se encarga del trabajo pesado.',
      feat2Title: 'Colaboracion en tiempo real', feat2Desc: 'Trabaja en equipo con edicion en vivo, comentarios y espacios de trabajo compartidos.',
      feat3Title: 'Analisis avanzados', feat3Desc: 'Comprende a tus usuarios con paneles de analisis integrados. Seguimiento de engagement, retencion y crecimiento.',
      feat4Title: 'Automatizacion de flujos', feat4Desc: 'Automatiza tareas repetitivas con disparadores y acciones. Configura una vez, beneficiate siempre.',
      feat5Title: 'Seguridad empresarial', feat5Desc: 'Cumplimiento SOC 2 con cifrado de extremo a extremo, SSO y controles de acceso basados en roles.',
      feat6Title: 'Integraciones perfectas', feat6Desc: 'Conecta las herramientas que ya utilizas. Slack, GitHub, Jira y mas de 100 integraciones disponibles.',
      bentoTitle: 'Creado para equipos modernos', bentoDesc: `Descubre lo que distingue a ${projectName}.`,
      bento1Title: 'Editor visual de flujos', bento1Desc: 'Disena flujos de trabajo complejos con una interfaz intuitiva de arrastrar y soltar. Sin necesidad de codigo.',
      bento2Title: 'Arquitectura API-First', bento2Desc: 'Cada funcion es accesible a traves de nuestras API REST y GraphQL. Documentacion completa incluida.',
      bento3Title: 'Red Edge global', bento3Desc: 'Despliega en mas de 150 ubicaciones Edge en todo el mundo. Tiempos de respuesta inferiores a 100 ms.',
      bento4Title: 'Panel de equipo', bento4Desc: 'Un centro de mando unificado para toda tu organizacion. Supervisa proyectos, sigue el progreso y gestiona recursos.',
      stepsTitle: 'Como funciona', stepsDesc: 'Empieza a trabajar en tres sencillos pasos.',
      step1Title: 'Crea tu cuenta', step1Desc: 'Registrate en segundos con tu correo o SSO. No se requiere tarjeta de credito.',
      step2Title: 'Configura tu espacio', step2Desc: 'Importa tus datos, invita a tu equipo y personaliza tu espacio de trabajo.',
      step3Title: 'Lanza y escala', step3Desc: 'Pasa a produccion con un clic. Nuestra infraestructura escala automaticamente con tu trafico.',
      testimonialsTitle: 'Querido por equipos en todas partes',
      t1Quote: 'Redujimos nuestro tiempo de desarrollo a la mitad. Solo la automatizacion de flujos nos ahorra 20 horas por semana.', t1Author: 'Sarah Chen', t1Role: 'VP of Engineering', t1Company: 'Acme Corp',
      t2Quote: 'La mejor experiencia de desarrollador que he usado. Todo simplemente funciona, y la documentacion de la API es fenomenal.', t2Author: 'Marcus Rivera', t2Role: 'Lead Developer', t2Company: 'TechFlow',
      t3Quote: 'Por fin una plataforma que escala con nosotros. Pasamos de 1000 a 100 000 usuarios sin cambiar ni una sola configuracion.', t3Author: 'Emily Nakamura', t3Role: 'CTO', t3Company: 'ScaleUp Inc',
      statsTitle: 'Los numeros hablan por si solos',
      stat1Label: 'Equipos activos', stat1Desc: `Equipos que trabajan con ${projectName}`,
      stat2Label: 'Disponibilidad', stat2Desc: 'Fiabilidad de nivel empresarial',
      stat3Label: 'Integraciones', stat3Desc: 'Conecta tus herramientas favoritas',
      stat4Label: 'Valoracion', stat4Desc: 'Satisfaccion media del cliente',
      faqTitle: 'Preguntas frecuentes',
      faq1Q: 'Hay un plan gratuito?', faq1A: 'Si. Nuestro plan gratuito incluye todas las funciones principales para hasta 5 miembros del equipo. Sin tarjeta de credito y sin limite de tiempo.',
      faq2Q: 'Cuanto tiempo lleva la configuracion?', faq2A: 'La mayoria de los equipos estan operativos en menos de 5 minutos. Nuestro asistente te guia en cada paso.',
      faq3Q: 'Puedo cancelar en cualquier momento?', faq3A: 'Por supuesto. Sin contratos a largo plazo ni cargos de cancelacion. Puedes cambiar de plan en cualquier momento.',
      faq4Q: 'Estan seguros mis datos?', faq4A: 'La seguridad es nuestra prioridad. Contamos con certificacion SOC 2 Type II, cifrado de extremo a extremo y controles de acceso granulares.',
      faq5Q: 'Ofrecen soporte?', faq5A: 'Ofrecemos soporte por correo en todos los planes y soporte prioritario con un gestor de cuenta dedicado en los planes Pro y Enterprise.',
      ctaTitle: 'Listo para lanzar mas rapido?', ctaButton: 'Prueba gratuita', ctaSubtext: 'Sin tarjeta de credito. Plan gratuito disponible para siempre.',
    },
  };
}

// ─── Main export ────────────────────────────────────────────

/**
 * Generate all project files in-memory. Pure function — no I/O, no CLI prompts.
 * Returns an array of files with their paths and content.
 * Binary files (PNG) are returned as base64-encoded strings.
 */
export function generateProjectFiles(options: ScaffoldOptions): ScaffoldFile[] {
  if (options.template === 'custom') {
    return generateCustomProjectFiles(options);
  }
  return generateShipSiteProjectFiles(options);
}

function generateCustomProjectFiles(options: ScaffoldOptions): ScaffoldFile[] {
  const {
    projectName,
    locales = ['en'],
    cliVersion = '0.0.0',
  } = options;

  const defaultLocale = locales[0] || 'en';
  const files: ScaffoldFile[] = [];

  const text = (path: string, content: string) =>
    files.push({ path, content, encoding: 'utf-8' });

  // ── shipsite.json ──────────────────────────────────────────

  const today = new Date().toISOString().split('T')[0];

  const config = {
    $schema: './node_modules/@shipsite.dev/core/shipsite.schema.json',
    name: projectName,
    url: `https://${projectName}.com`,
    template: 'custom' as const,
    i18n: {
      defaultLocale,
      locales,
      localePrefix: 'as-needed' as const,
    },
    pages: [
      { slug: '', type: 'page', content: 'landing', locales },
      { slug: 'blog', type: 'blog-index', content: 'blog', locales: [defaultLocale] },
      { slug: 'blog/hello-world', type: 'blog-article', content: 'blog/hello-world', locales: [defaultLocale] },
    ],
    blog: {
      authors: {
        default: {
          name: 'Team',
          role: 'Author',
        },
      },
    },
  };

  text('shipsite.json', JSON.stringify(config, null, 2) + '\n');

  // ── Landing page ────────────────────────────────────────────

  for (const locale of locales) {
    text(`content/landing/${locale}.mdx`, `---
title: "${projectName} — Build Something Great"
description: "Welcome to ${projectName}."
---

<Hero
  title="Build Something Great"
  description="This is your custom ShipSite project. Every component here is yours to modify — change the design, swap the layout, make it your own."
  primaryHref="#features"
  primaryLabel="See Features"
  secondaryHref="/blog"
  secondaryLabel="Read the Blog"
/>

<Section id="features" title="What You Get" description="A solid starting point with components you fully control.">
  <CardGrid>
    <Card title="Custom Layout" description="Header, footer, and page shell — all in your components/ folder. Change anything." />
    <Card title="Blog Built In" description="A working blog with index and article pages. Add posts as MDX files." />
    <Card title="Full Control" description="No locked-in design system. Tailwind CSS, your styles, your rules." />
  </CardGrid>
</Section>
`);
  }

  // ── Blog index page ─────────────────────────────────────────

  text(`content/blog/${defaultLocale}.mdx`, `---
title: "Blog — ${projectName}"
description: "Latest posts from ${projectName}."
---

<BlogIndex title="Blog" description="Latest posts." />
`);

  // ── Blog article ────────────────────────────────────────────

  text(`content/blog/hello-world/${defaultLocale}.mdx`, `---
title: "Hello World"
description: "Our very first blog post."
excerpt: "Welcome to the blog! This is a sample post to show how articles work in your custom ShipSite project."
date: "${today}"
readingTime: 2
author: default
---

<BlogArticle>

## Welcome

This is your first blog post. It lives at \`content/blog/hello-world/${defaultLocale}.mdx\`.

You can write **Markdown** here and use any of your custom components. The \`BlogArticle\` wrapper
adds the title, date, and author info automatically — but you control how it looks in
\`components/BlogArticle.tsx\`.

## Adding More Posts

1. Create a new folder under \`content/blog/\`, e.g. \`content/blog/my-post/\`
2. Add a \`${defaultLocale}.mdx\` file with frontmatter (\`title\`, \`description\`, \`date\`, \`author\`, \`excerpt\`)
3. Register the page in \`shipsite.json\` under \`pages\`

That is it — the blog index picks it up automatically.

</BlogArticle>
`);

  // ── Starter components ──────────────────────────────────────

  text('components/Layout.tsx', `export default function Layout({ children, locale }: { children: React.ReactNode; locale: string }) {
  return (
    <>
      <header className="site-header">
        <nav className="site-nav">
          <a href="/" className="site-logo">${projectName}</a>
          <div className="nav-links">
            <a href="/blog">Blog</a>
          </div>
        </nav>
      </header>
      <main className="site-main">
        {children}
      </main>
      <footer className="site-footer">
        <p>&copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.</p>
      </footer>
    </>
  );
}
`);

  text('components/Hero.tsx', `interface HeroProps {
  title: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function Hero({ title, description, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: HeroProps) {
  return (
    <section className="hero">
      <h1>{title}</h1>
      {description && <p className="hero-description">{description}</p>}
      {(primaryHref || secondaryHref) && (
        <div className="hero-actions">
          {primaryHref && <a href={primaryHref} className="btn btn-primary">{primaryLabel || 'Get Started'}</a>}
          {secondaryHref && <a href={secondaryHref} className="btn btn-secondary">{secondaryLabel || 'Learn More'}</a>}
        </div>
      )}
    </section>
  );
}
`);

  text('components/Section.tsx', `interface SectionProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} className="content-section">
      {title && <h2>{title}</h2>}
      {description && <p className="section-description">{description}</p>}
      {children}
    </section>
  );
}
`);

  text('components/Card.tsx', `interface CardProps {
  title: string;
  description?: string;
  href?: string;
  children?: React.ReactNode;
}

export function Card({ title, description, href, children }: CardProps) {
  const content = (
    <div className="card">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );

  if (href) {
    return <a href={href} className="card-link">{content}</a>;
  }
  return content;
}
`);

  text('components/CardGrid.tsx', `interface CardGridProps {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function CardGrid({ columns = 3, children }: CardGridProps) {
  return (
    <div className="card-grid" style={{ '--columns': columns } as React.CSSProperties}>
      {children}
    </div>
  );
}
`);

  text('components/BlogIndex.tsx', `interface BlogArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: number;
  href: string;
  author?: { name: string; role: string; image: string };
}

interface BlogIndexProps {
  title?: string;
  description?: string;
  articles?: BlogArticleSummary[];
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function BlogIndex({ title, description, articles = [] }: BlogIndexProps) {
  return (
    <section className="blog-index">
      {title && <h1>{title}</h1>}
      {description && <p className="section-description">{description}</p>}
      {articles.length === 0 && <p className="empty-state">No posts yet.</p>}
      <div className="blog-grid">
        {articles.map((article) => (
          <a key={article.slug} href={article.href} className="blog-card">
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
            <div className="blog-card-meta">
              {article.author && <span>{article.author.name}</span>}
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span>{article.readingTime} min read</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
`);

  text('components/BlogArticle.tsx', `interface BlogArticleProps {
  children: React.ReactNode;
  title?: string;
  date?: string;
  readingTime?: number;
  author?: { name: string; role: string; image: string; bio?: string };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function BlogArticle({ children, title, date, readingTime, author }: BlogArticleProps) {
  return (
    <article className="blog-article">
      {title && <h1>{title}</h1>}
      <div className="blog-article-meta">
        {author && <span className="blog-author">{author.name}</span>}
        {date && <time dateTime={date}>{formatDate(date)}</time>}
        {readingTime && <span>{readingTime} min read</span>}
      </div>
      <div className="blog-article-content">
        {children}
      </div>
    </article>
  );
}
`);

  text('components/index.ts', `export { default as Layout } from './Layout';
export { Hero } from './Hero';
export { Section } from './Section';
export { Card } from './Card';
export { CardGrid } from './CardGrid';
export { BlogIndex } from './BlogIndex';
export { BlogArticle } from './BlogArticle';
`);

  // ── Custom styles ───────────────────────────────────────────

  text('styles/globals.css', `@import 'tailwindcss';

/* ─── Base ─────────────────────────────────────────── */

@layer base {
  :root {
    --color-primary: #059669;
    --color-primary-hover: #047857;
    --color-text: #1f2937;
    --color-text-muted: #6b7280;
    --color-bg: #ffffff;
    --color-bg-muted: #f9fafb;
    --color-border: #e5e7eb;
    --max-width: 64rem;
    --radius: 0.5rem;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    color: var(--color-text);
    background: var(--color-bg);
  }
}

/* ─── Layout ───────────────────────────────────────── */

.site-header {
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 1.5rem;
}

.site-nav {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-logo {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.nav-links a:hover {
  color: var(--color-text);
}

.site-main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.site-footer {
  border-top: 1px solid var(--color-border);
  padding: 2rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* ─── Hero ─────────────────────────────────────────── */

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  max-width: 36rem;
  margin: 0 auto 2rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ─── Buttons ──────────────────────────────────────── */

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: var(--color-bg-muted);
}

/* ─── Sections ─────────────────────────────────────── */

.content-section {
  padding: 3rem 0;
}

.content-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.section-description {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

/* ─── Cards ────────────────────────────────────────── */

.card-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: box-shadow 0.15s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.card-link {
  text-decoration: none;
  color: inherit;
}

/* ─── Blog Index ───────────────────────────────────── */

.blog-index h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.blog-card {
  display: block;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.15s, transform 0.15s;
}

.blog-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.blog-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.blog-card p {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.blog-card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.empty-state {
  color: var(--color-text-muted);
  font-style: italic;
}

/* ─── Blog Article ─────────────────────────────────── */

.blog-article {
  max-width: 42rem;
}

.blog-article h1 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
}

.blog-article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.blog-author {
  font-weight: 500;
  color: var(--color-text);
}

.blog-article-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.blog-article-content p {
  line-height: 1.75;
  margin-bottom: 1rem;
}

.blog-article-content ol,
.blog-article-content ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.blog-article-content li {
  line-height: 1.75;
  margin-bottom: 0.25rem;
}

.blog-article-content strong {
  font-weight: 600;
}

.blog-article-content code {
  font-size: 0.875em;
  background: var(--color-bg-muted);
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
}
`);

  // ── Project files ───────────────────────────────────────────

  text('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".shipsite/**/*.ts", ".shipsite/**/*.tsx"],
  "exclude": ["node_modules"]
}
`);

  text('postcss.config.mjs', `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`);

  text('.gitignore', `node_modules/
.next/
.shipsite/
.content-collections/
*.tsbuildinfo
`);

  text('package.json', JSON.stringify(
    {
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'shipsite dev',
        build: 'shipsite build',
        validate: 'shipsite validate',
      },
      dependencies: {
        '@shipsite.dev/cli': `^${cliVersion}`,
        '@shipsite.dev/core': `^${cliVersion}`,
        next: '16.1.6',
        react: '19.2.3',
        'react-dom': '19.2.3',
      },
      devDependencies: {
        '@tailwindcss/postcss': '^4',
        '@types/node': '^20',
        '@types/react': '^19',
        tailwindcss: '^4',
        typescript: '^5',
      },
    },
    null,
    2,
  ) + '\n');

  return files;
}

function generateShipSiteProjectFiles(options: ScaffoldOptions): ScaffoldFile[] {
  const {
    projectName,
    primaryColor = '#059669',
    locales = ['en'],
    cliVersion = '0.0.0',
  } = options;

  const defaultLocale = locales[0] || 'en';
  const today = new Date().toISOString().split('T')[0];
  const files: ScaffoldFile[] = [];

  const text = (path: string, content: string) =>
    files.push({ path, content, encoding: 'utf-8' });
  const binary = (path: string, buf: Buffer) =>
    files.push({ path, content: buf.toString('base64'), encoding: 'base64' });

  // ── shipsite.json ──────────────────────────────────────────

  const config = {
    $schema: './node_modules/@shipsite.dev/core/shipsite.schema.json',
    name: projectName,
    url: `https://${projectName}.com`,
    logo: '/images/logo.svg',
    favicon: '/favicon.png',
    ogImage: '/images/og-image.png',
    colors: {
      primary: primaryColor,
      accent: '#067647',
      background: '#ffffff',
      text: '#1f2a37',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    i18n: {
      defaultLocale,
      locales,
      localePrefix: 'as-needed' as const,
    },
    navigation: {
      items: [
        { label: localizedLabel('Features', locales), href: '/features' },
        { label: localizedLabel('Pricing', locales), href: '/pricing' },
        { label: localizedLabel('Blog', locales), href: '/blog' },
      ],
      cta: {
        label: localizedLabel('Get Started', locales),
        href: `https://app.${projectName}.com/signup`,
      },
    },
    footer: {
      columns: [
        {
          title: localizedLabel('Product', locales),
          links: [
            { label: localizedLabel('Features', locales), href: '/features' },
            { label: localizedLabel('Pricing', locales), href: '/pricing' },
            { label: localizedLabel('Blog', locales), href: '/blog' },
          ],
        },
        {
          title: localizedLabel('Legal', locales),
          links: [
            { label: localizedLabel('Privacy Policy', locales), href: '/privacy' },
            { label: localizedLabel('Terms of Service', locales), href: '/terms' },
          ],
        },
      ],
      copyright: `\u00A9 ${new Date().getFullYear()} ${projectName}`,
    },
    pages: [
      { slug: '', type: 'landing', content: 'landing', locales },
      { slug: 'features', type: 'page', content: 'features', locales: [defaultLocale] },
      { slug: 'pricing', type: 'page', content: 'pricing', locales: [defaultLocale] },
      { slug: 'blog', type: 'blog-index', content: 'blog', locales: [defaultLocale] },
      { slug: 'blog/getting-started', type: 'blog-article', content: 'blog/getting-started', locales: [defaultLocale] },
      { slug: 'blog/building-your-first-project', type: 'blog-article', content: 'blog/building-your-first-project', locales: [defaultLocale] },
      { slug: 'blog/best-practices', type: 'blog-article', content: 'blog/best-practices', locales: [defaultLocale] },
      { slug: 'privacy', type: 'legal', content: 'privacy', locales: [defaultLocale] },
      { slug: 'terms', type: 'legal', content: 'terms', locales: [defaultLocale] },
    ],
    blog: {
      authors: {
        default: {
          name: 'Team',
          role: 'Author',
          image: '/images/team.svg',
        },
      },
    },
  };

  text('shipsite.json', JSON.stringify(config, null, 2) + '\n');

  // ── Landing page (one file per locale) ─────────────────────

  const landingStrings = getLandingStrings(projectName);

  for (const locale of locales) {
    const t = landingStrings[locale] || landingStrings['en']!;
    text(`content/landing/${locale}.mdx`, `---
title: "${t.metaTitle}"
description: "${t.metaDesc}"
---

<Hero
  badge="${t.heroBadge}"
  title="${t.heroTitle}"
  description="${t.heroDesc}"
  primaryCta={{ label: "${t.primaryCta}", href: "https://app.${projectName}.com/signup" }}
  secondaryCta={{ label: "${t.secondaryCta}", href: "#how-it-works" }}
/>

<SocialProof text="${t.socialProof}" />

<Features title="${t.featuresTitle}" description="${t.featuresDesc}" columns={3}>
  <Feature title="${t.feat1Title}" description="${t.feat1Desc}" />
  <Feature title="${t.feat2Title}" description="${t.feat2Desc}" />
  <Feature title="${t.feat3Title}" description="${t.feat3Desc}" />
  <Feature title="${t.feat4Title}" description="${t.feat4Desc}" />
  <Feature title="${t.feat5Title}" description="${t.feat5Desc}" />
  <Feature title="${t.feat6Title}" description="${t.feat6Desc}" />
</Features>

<BentoGrid title="${t.bentoTitle}" description="${t.bentoDesc}">
  <BentoItem title="${t.bento1Title}" description="${t.bento1Desc}" visual="aurora" span={2} />
  <BentoItem title="${t.bento2Title}" description="${t.bento2Desc}" visual="orbs" />
  <BentoItem title="${t.bento3Title}" description="${t.bento3Desc}" visual="rings" />
  <BentoItem title="${t.bento4Title}" description="${t.bento4Desc}" visual="dots" span={2} />
</BentoGrid>

<Steps id="how-it-works" title="${t.stepsTitle}" description="${t.stepsDesc}">
  <Step title="${t.step1Title}" description="${t.step1Desc}" />
  <Step title="${t.step2Title}" description="${t.step2Desc}" />
  <Step title="${t.step3Title}" description="${t.step3Desc}" />
</Steps>

<Testimonials title="${t.testimonialsTitle}" columns={3}>
  <TestimonialCard quote="${t.t1Quote}" author="${t.t1Author}" role="${t.t1Role}" company="${t.t1Company}" rating={5} />
  <TestimonialCard quote="${t.t2Quote}" author="${t.t2Author}" role="${t.t2Role}" company="${t.t2Company}" rating={5} />
  <TestimonialCard quote="${t.t3Quote}" author="${t.t3Author}" role="${t.t3Role}" company="${t.t3Company}" rating={5} />
</Testimonials>

<Stats title="${t.statsTitle}">
  <Stat value="10K+" label="${t.stat1Label}" description="${t.stat1Desc}" />
  <Stat value="99.9%" label="${t.stat2Label}" description="${t.stat2Desc}" />
  <Stat value="150+" label="${t.stat3Label}" description="${t.stat3Desc}" />
  <Stat value="4.9/5" label="${t.stat4Label}" description="${t.stat4Desc}" />
</Stats>

<FAQ title="${t.faqTitle}">
  <FAQItem question="${t.faq1Q}">
    ${t.faq1A}
  </FAQItem>
  <FAQItem question="${t.faq2Q}">
    ${t.faq2A}
  </FAQItem>
  <FAQItem question="${t.faq3Q}">
    ${t.faq3A}
  </FAQItem>
  <FAQItem question="${t.faq4Q}">
    ${t.faq4A}
  </FAQItem>
  <FAQItem question="${t.faq5Q}">
    ${t.faq5A}
  </FAQItem>
</FAQ>

<BannerCTA
  title="${t.ctaTitle}"
  buttonText="${t.ctaButton}"
  buttonHref="https://app.${projectName}.com/signup"
  subtext="${t.ctaSubtext}"
/>
`);
  }

  // ── Features page ──────────────────────────────────────────

  text('content/features/en.mdx', `---
title: "Features \u2014 ${projectName}"
description: "Explore the full suite of tools and capabilities that make ${projectName} the platform of choice for modern teams."
---

<PageHero
  title="Features"
  description="Everything your team needs to build, ship, and scale \u2014 all in one platform."
/>

<Features title="Core Capabilities" description="A complete toolkit designed for speed, reliability, and collaboration." columns={3}>
  <Feature title="Visual Workflow Builder" description="Design and automate complex processes with an intuitive drag-and-drop editor. No code required for common tasks." />
  <Feature title="Real-Time Collaboration" description="Edit together with live cursors, inline comments, and instant sync across all devices and team members." />
  <Feature title="Advanced Analytics" description="Track every metric that matters with customizable dashboards, funnel analysis, and automatic reports." />
  <Feature title="API-First Platform" description="Build anything with our comprehensive REST and GraphQL APIs. Full OpenAPI specs and SDKs for every major language." />
  <Feature title="Enterprise Security" description="SOC 2 Type II certified with end-to-end encryption, SSO, SCIM provisioning, and granular role-based access." />
  <Feature title="Global Infrastructure" description="Deploy to 150+ edge locations. Automatic failover, load balancing, and sub-100ms latency worldwide." />
</Features>

<BentoGrid title="Deep Dive" description="See how each capability helps your team move faster.">
  <BentoItem title="Workflow Automation" description="Set up triggers, conditions, and actions to automate any process. From onboarding sequences to deployment pipelines, eliminate manual work." visual="aurora" span={2} />
  <BentoItem title="Version Control" description="Built-in versioning for every change. Roll back instantly, compare diffs, and audit who changed what and when." visual="orbs" />
  <BentoItem title="Custom Integrations" description="Connect ${projectName} to your stack with pre-built connectors for Slack, GitHub, Jira, Salesforce, and 100+ more." visual="rings" />
  <BentoItem title="Team Management" description="Organize members into teams and projects with fine-grained permissions. Manage access at scale with SCIM and directory sync." visual="dots" span={2} />
</BentoGrid>

<Testimonial
  quote="We evaluated a dozen platforms before choosing ${projectName}. The combination of developer experience, reliability, and customer support is unmatched."
  author="James Park"
  role="Head of Platform Engineering"
  company="Moneta Systems"
/>

<BannerCTA
  title="See it in action"
  buttonText="Start Your Free Trial"
  buttonHref="https://app.${projectName}.com/signup"
  subtext="No credit card required. Free plan available forever."
/>
`);

  // ── Pricing ────────────────────────────────────────────────

  text('content/pricing/en.mdx', `---
title: "Pricing \u2014 ${projectName}"
description: "Simple, transparent pricing for teams of all sizes."
---

<PricingSection title="Simple, Transparent Pricing" description="Start free. Upgrade when you are ready. No surprises.">
  <PricingPlan name="Free" price="$0" description="For individuals and small projects" features={["Up to 5 team members", "Core features included", "1 GB storage", "Community support", "Basic analytics"]} cta={{ label: "Get Started Free", href: "https://app.${projectName}.com/signup" }} />
  <PricingPlan name="Pro" price="$29/mo" yearlyPrice="$24/mo" description="For growing teams that need more" features={["Unlimited team members", "All features included", "50 GB storage", "Priority email support", "Advanced analytics", "Custom integrations", "SSO authentication"]} cta={{ label: "Start Free Trial", href: "https://app.${projectName}.com/signup?plan=pro" }} popular={true} />
  <PricingPlan name="Enterprise" price="Custom" description="For organizations that need control" features={["Everything in Pro", "Unlimited storage", "Dedicated account manager", "99.99% uptime SLA", "SCIM provisioning", "Custom contracts", "On-premise deployment"]} cta={{ label: "Contact Sales", href: "mailto:sales@${projectName}.com" }} />
</PricingSection>

<FAQ title="Pricing Questions">
  <FAQItem question="Can I switch plans at any time?">
    Yes. You can upgrade, downgrade, or cancel at any time. When you upgrade, you only pay the prorated difference. When you downgrade, the credit is applied to your next billing cycle.
  </FAQItem>
  <FAQItem question="What happens when my trial ends?">
    After your 14-day Pro trial, you can continue on the Free plan with no data loss. All your projects and settings are preserved. Upgrade whenever you are ready.
  </FAQItem>
  <FAQItem question="Do you offer discounts for startups or nonprofits?">
    Yes! We offer 50% off Pro plans for qualifying startups and nonprofits. Contact our sales team to learn more about eligibility.
  </FAQItem>
</FAQ>
`);

  // ── Blog ───────────────────────────────────────────────────

  text('content/blog/en.mdx', `---
title: "Blog \u2014 ${projectName}"
description: "Latest news, updates, and insights."
---

<BlogIndex title="Our Blog" description="Latest news, updates, and insights from our team." />
`);

  text('content/blog/getting-started/en.mdx', `---
title: "Getting Started with ${projectName}"
description: "A complete guide to setting up your account, configuring your workspace, and launching your first project."
excerpt: "Everything you need to go from sign-up to production in under five minutes."
date: "${today}"
image: "/images/blog/getting-started.svg"
readingTime: 5
author: default
featured: true
---

<BlogArticle>

## Step 1: Create Your Account

Head to [app.${projectName}.com/signup](https://app.${projectName}.com/signup) and create your free account. You can sign up with your email address or use SSO with Google or GitHub. No credit card is required and the free plan has no time limit.

Once you verify your email, you will land in your new workspace dashboard. This is your home base for managing projects, team members, and settings.

## Step 2: Set Up Your Workspace

Your workspace is where everything comes together. Start by personalizing it:

- **Invite your team** \u2014 Go to Settings and then Team to add members by email. You can assign roles like Admin, Editor, or Viewer to control access.
- **Connect your tools** \u2014 Visit the Integrations page to link Slack, GitHub, Jira, or any of our 100+ supported services. Notifications and data will sync automatically.
- **Import existing data** \u2014 If you are migrating from another platform, use the one-click import tool to bring your projects, files, and history along.

## Step 3: Launch Your First Project

Click "New Project" from the dashboard and choose a template or start from scratch. Every project comes with built-in version control, analytics, and collaboration tools.

Once your project is ready, hit "Deploy" to push it live. Our global edge network handles the rest, delivering your content with sub-100ms latency worldwide.

## What Comes Next

Now that you are up and running, explore the [Features](/features) page to discover advanced capabilities like workflow automation, custom integrations, and analytics dashboards. If you have questions, our support team is always here to help.

</BlogArticle>
`);

  text('content/blog/building-your-first-project/en.mdx', `---
title: "Building Your First Project"
description: "A hands-on tutorial that walks you through creating, configuring, and deploying your first project."
excerpt: "Follow along as we build a project from scratch and deploy it to production."
date: "${today}"
image: "/images/blog/building-your-first-project.svg"
readingTime: 6
author: default
---

<BlogArticle>

## Choosing the Right Template

When you create a new project, you can start from scratch or choose one of our pre-built templates. Templates come with sensible defaults for common use cases like marketing sites, internal dashboards, and API services.

For this tutorial, we will start with the "Starter" template. It includes a basic project structure, sample data, and a deployment pipeline that is ready to go.

## Configuring Your Project

Every project has a settings panel where you can customize behavior:

- **Environment Variables** \u2014 Store API keys, database URLs, and other secrets securely. They are encrypted at rest and never exposed in logs.
- **Custom Domains** \u2014 Add your own domain and we will provision an SSL certificate automatically. DNS changes typically propagate in under 10 minutes.
- **Webhooks** \u2014 Set up webhooks to trigger external services whenever specific events happen in your project.

Take a few minutes to review the defaults and adjust anything that does not match your requirements.

## Adding Collaborators

Projects support granular permissions. From the project settings, invite team members and assign one of three roles:

- **Admin** \u2014 Full access including billing and danger-zone settings.
- **Editor** \u2014 Can create, update, and deploy content.
- **Viewer** \u2014 Read-only access for stakeholders who need visibility.

Roles can be changed at any time without disrupting ongoing work.

## Deploying to Production

When you are happy with your project, click "Deploy" in the top-right corner. The platform runs your build pipeline, runs automated checks, and pushes the result to our global edge network.

Every deploy creates an immutable snapshot. If something goes wrong, you can roll back to any previous deploy in one click. There is no downtime during rollbacks.

</BlogArticle>
`);

  text('content/blog/best-practices/en.mdx', `---
title: "Best Practices for Teams"
description: "Proven strategies for getting the most out of ${projectName}, from workspace organization to deployment workflows."
excerpt: "Tips and patterns from teams that ship fast and stay organized."
date: "${today}"
image: "/images/blog/best-practices.svg"
readingTime: 4
author: default
---

<BlogArticle>

## Organize with Purpose

The most productive teams keep their workspaces clean and predictable. Here are a few patterns that work well:

- **One project per product or service** \u2014 Avoid cramming unrelated work into a single project. Separate projects are easier to manage, permission, and monitor.
- **Use consistent naming** \u2014 Agree on a naming convention early. Something like "team-product-environment" makes it easy to find what you need at a glance.
- **Archive instead of delete** \u2014 When a project wraps up, archive it rather than deleting it. Archives are searchable and can be restored if you need to reference old work.

## Automate Repetitive Work

Workflow automation is one of the most impactful features available. Start with the tasks your team does repeatedly:

- **Deployment notifications** \u2014 Send a Slack message every time a deploy succeeds or fails.
- **Review reminders** \u2014 Automatically nudge reviewers when a change has been waiting too long.
- **Data backups** \u2014 Schedule nightly exports of critical data to your own storage.

Each automation you add frees up time for the work that actually matters.

## Ship with Confidence

A reliable deployment process reduces stress and prevents outages. Follow these guidelines:

- **Use preview deployments** \u2014 Every branch can have its own preview URL. Share it with stakeholders for feedback before merging.
- **Enable automatic rollbacks** \u2014 Configure health checks so the platform can roll back a bad deploy before users notice.
- **Monitor after every release** \u2014 Check the analytics dashboard for error spikes or performance regressions in the first 30 minutes after a deploy.

</BlogArticle>
`);

  // ── Legal pages ────────────────────────────────────────────

  text('content/privacy/en.mdx', `---
title: "Privacy Policy"
description: "How we handle your data."
---

<ContentPage title="Privacy Policy" lastUpdated="${today}">
  <ContentSection title="1. Data Collection">We collect only the data necessary to provide our services.</ContentSection>
  <ContentSection title="2. Data Usage">Your data is used solely to deliver and improve our services.</ContentSection>
  <ContentSection title="3. Contact">For privacy-related inquiries, contact us at privacy@${projectName}.com.</ContentSection>
</ContentPage>
`);

  text('content/terms/en.mdx', `---
title: "Terms of Service"
description: "Terms and conditions for using our service."
---

<ContentPage title="Terms of Service" lastUpdated="${today}">
  <ContentSection title="1. Acceptance of Terms">By using our service, you agree to these terms.</ContentSection>
  <ContentSection title="2. Use of Service">You may use our service for lawful purposes only.</ContentSection>
  <ContentSection title="3. Termination">We reserve the right to terminate accounts that violate these terms.</ContentSection>
</ContentPage>
`);

  // ── Images ─────────────────────────────────────────────────

  text('public/images/logo.svg', `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="${primaryColor}"/>
  <text x="16" y="22" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="system-ui">${projectName.charAt(0).toUpperCase()}</text>
</svg>`);

  binary('public/favicon.png', generatePng(32, 32, primaryColor));
  binary('public/apple-touch-icon.png', generatePng(180, 180, primaryColor));
  binary('public/images/og-image.png', generateOgPng(primaryColor));

  text('public/images/blog/getting-started.svg', generateBlogSvg(primaryColor, 'a'));
  text('public/images/blog/building-your-first-project.svg', generateBlogSvg(primaryColor, 'b'));
  text('public/images/blog/best-practices.svg', generateBlogSvg(primaryColor, 'c'));
  text('public/images/team.svg', generateTeamSvg(primaryColor));

  // ── Code files ─────────────────────────────────────────────

  text('components/index.ts', `// Custom components — export your components here to use them in MDX.
// ShipSite automatically merges these with the built-in components.
//
// Example:
//   export { Highlight } from './Highlight';
//
// Then use in any MDX file:
//   <Highlight color="blue">Important text</Highlight>

export {};
`);

  text('next.config.ts', `import type { NextConfig } from 'next';

const config: NextConfig = {
  // Add your custom Next.js config here.
  // ShipSite merges this with its own config automatically.
  //
  // Examples:
  // redirects: async () => [
  //   { source: '/old-page', destination: '/new-page', permanent: true },
  // ],
  // headers: async () => [
  //   { source: '/(.*)', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] },
  // ],
};

export default config;
`);

  text('.gitignore', `node_modules/
.next/
.shipsite/
.content-collections/
*.tsbuildinfo
`);

  text('package.json', JSON.stringify(
    {
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'shipsite dev',
        build: 'shipsite build',
        validate: 'shipsite validate',
      },
      dependencies: {
        '@shipsite.dev/cli': `^${cliVersion}`,
        '@shipsite.dev/core': `^${cliVersion}`,
        '@shipsite.dev/components': `^${cliVersion}`,
        next: '16.1.6',
        react: '19.2.3',
        'react-dom': '19.2.3',
        '@radix-ui/react-accordion': '^1.2.3',
        '@radix-ui/react-dialog': '^1.1.6',
        '@radix-ui/react-slot': '^1.2.0',
        'class-variance-authority': '^0.7.1',
        'clsx': '^2.1.1',
        'lucide-react': '^0.475.0',
        'next-themes': '^0.4.4',
        'tailwind-merge': '^3.0.2',
        'tw-animate-css': '^1.2.5',
      },
      devDependencies: {
        '@tailwindcss/postcss': '^4',
        '@types/node': '^20',
        '@types/react': '^19',
        tailwindcss: '^4',
        typescript: '^5',
      },
    },
    null,
    2,
  ) + '\n');

  return files;
}
