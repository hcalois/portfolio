// Todo o conteúdo do site mora aqui. Textos bilíngues usam { pt, en }.

export const profile = {
  name: 'Henrique Valois',
  fullName: 'Carlos Henrique Valois dos Santos',
  firstName: 'Henrique',
  // e-mail montado em tempo de execução para não ficar exposto a scrapers no HTML
  emailUser: 'hvalois48',
  emailDomain: 'gmail.com',
  phoneDisplay: '+55 (74) 99114-9492',
  whatsapp: '5574991149492',
  linkedin: 'https://www.linkedin.com/in/henriquesoftware',
  linkedinHandle: 'in/henriquesoftware',
  github: 'hcalois',
  instagram: 'thishenrique_is', // usuário sem @ — vazio esconde o link
  cv: {
    pt: '/assets/cv/Curriculo-Henrique-Valois.pdf',
    en: '/assets/cv/Resume-Henrique-Valois.pdf',
  },
  timezone: 'America/Bahia',
  whatsappMessage: {
    pt: 'Olá, Henrique! Vi seu portfólio e gostaria de conversar.',
    en: 'Hi Henrique! I saw your portfolio and would like to talk.',
  },
};

export const email = () => `${profile.emailUser}@${profile.emailDomain}`;
export const whatsappUrl = (lang) =>
  `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMessage[lang])}`;

// II. Arsenal — uma tabela periódica: cada tecnologia é um elemento.
// sym = símbolo de duas letras exibido no quadro.
export const stack = [
  {
    el: 'fire',
    name: { pt: 'Fogo', en: 'Fire' },
    domain: { pt: 'Java & fundamentos', en: 'Java & fundamentals' },
    note: { pt: 'O núcleo de tudo que construo.', en: 'The core of everything I build.' },
    items: [
      { sym: 'Jv', name: 'Java', detail: { pt: 'Linguagem principal', en: 'Main language' } },
      { sym: 'Oo', name: { pt: 'POO', en: 'OOP' }, detail: { pt: 'Orientação a objetos', en: 'Object-oriented design' } },
      { sym: 'Ed', name: { pt: 'Estruturas de dados', en: 'Data structures' }, detail: { pt: 'Listas · pilhas · mapas', en: 'Lists · stacks · maps' } },
      { sym: 'Al', name: { pt: 'Algoritmos', en: 'Algorithms' }, detail: { pt: 'Lógica · complexidade', en: 'Logic · complexity' } },
    ],
  },
  {
    el: 'water',
    name: { pt: 'Água', en: 'Water' },
    domain: { pt: 'Dados & APIs', en: 'Data & APIs' },
    note: { pt: 'O que flui por baixo de tudo.', en: 'What flows beneath everything.' },
    items: [
      { sym: 'Sq', name: 'SQL', detail: { pt: 'Consultas · modelagem', en: 'Queries · modeling' } },
      { sym: 'Pg', name: 'PostgreSQL', detail: { pt: 'Banco relacional', en: 'Relational database' } },
      { sym: 'Ap', name: { pt: 'APIs REST', en: 'REST APIs' }, detail: { pt: 'Consumo e criação', en: 'Consume & build' } },
      { sym: 'Ms', name: { pt: 'Microsserviços', en: 'Microservices' }, detail: { pt: 'Conceitos · arquitetura', en: 'Concepts · architecture' } },
    ],
  },
  {
    el: 'air',
    name: { pt: 'Ar', en: 'Air' },
    domain: { pt: 'Automação & IA', en: 'Automation & AI' },
    note: { pt: 'Hermes, o mensageiro: sistemas que conversam entre si.', en: 'Hermes, the messenger: systems that talk to each other.' },
    items: [
      { sym: 'N8', name: 'n8n', detail: { pt: 'Fluxos de automação', en: 'Automation workflows' } },
      { sym: 'Wh', name: 'Webhooks', detail: { pt: 'Eventos em tempo real', en: 'Real-time events' } },
      { sym: 'In', name: { pt: 'Integrações', en: 'Integrations' }, detail: 'RD Station · Meta Ads' },
      { sym: 'Ai', name: { pt: 'IA aplicada', en: 'Applied AI' }, detail: 'LLMs via API' },
    ],
  },
  {
    el: 'earth',
    name: { pt: 'Terra', en: 'Earth' },
    domain: { pt: 'Fundação', en: 'Foundation' },
    note: { pt: 'O chão que sustenta a obra.', en: 'The ground the work stands on.' },
    items: [
      { sym: 'Sc', name: { pt: 'Segurança', en: 'Security' }, detail: { pt: 'Auth multicamadas · RLS', en: 'Multi-layer auth · RLS' } },
      { sym: 'Aw', name: 'AWS', detail: { pt: 'Cloud · provisionamento', en: 'Cloud · provisioning' } },
      { sym: 'Gt', name: 'Git', detail: { pt: 'GitHub · versionamento', en: 'GitHub · version control' } },
      { sym: 'Ag', name: { pt: 'Ágil', en: 'Agile' }, detail: { pt: 'Entregas iterativas', en: 'Iterative delivery' } },
    ],
  },
];

// III. Jornada — nove cantos, três atos.
export const acts = {
  origin: { pt: 'Origem', en: 'Origin' },
  present: { pt: 'Presente', en: 'Present' },
  destination: { pt: 'Destino', en: 'Destination' },
};

export const stepStatus = {
  done: { pt: 'Concluído', en: 'Done' },
  now: { pt: 'Agora', en: 'Now' },
  next: { pt: 'Meta', en: 'Goal' },
};

export const journey = [
  {
    act: 'origin', n: 'I', status: 'done',
    title: { pt: 'Primeiro código', en: 'First code' },
    meta: { pt: 'Capim Grosso, Bahia', en: 'Capim Grosso, Bahia' },
    text: {
      pt: 'O primeiro contato com código: lógica, curiosidade e a teimosia de entender como as coisas funcionam por dentro.',
      en: 'First contact with code: logic, curiosity and the stubbornness to understand how things work on the inside.',
    },
  },
  {
    act: 'origin', n: 'II', status: 'done',
    title: { pt: 'Capim Solar', en: 'Capim Solar' },
    meta: { pt: 'Analista · Setor técnico · 2025', en: 'Analyst · Technical team · 2025' },
    text: {
      pt: 'Gestão e submissão de documentação técnica de projetos de microgeração junto à concessionária. A empresa conquistou o Prêmio Excelência Empresarial 2025 em energia solar.',
      en: 'Managed and submitted technical documentation for micro-generation projects with the power utility. The company won the 2025 Business Excellence Award in solar energy.',
    },
  },
  {
    act: 'origin', n: 'III', status: 'done',
    title: { pt: 'Primeiras automações', en: 'First automations' },
    meta: { pt: 'n8n · Webhooks · APIs', en: 'n8n · Webhooks · APIs' },
    text: {
      pt: 'Fluxos que conectam serviços e APIs: disparo de mensagens e sincronização de leads em tempo real, sem trabalho manual.',
      en: 'Workflows connecting services and APIs: automated messaging and real-time lead sync, with zero manual work.',
    },
  },
  {
    act: 'present', n: 'IV', status: 'now',
    title: { pt: 'ADS · AGES', en: 'Systems Analysis & Development · AGES' },
    meta: { pt: '2º semestre · conclusão em 2028', en: '2nd semester · graduating 2028' },
    text: {
      pt: 'Análise e Desenvolvimento de Sistemas: engenharia de software, banco de dados e programação orientada a objetos.',
      en: 'Associate degree in Systems Analysis & Development: software engineering, databases and object-oriented programming.',
    },
  },
  {
    act: 'present', n: 'V', status: 'now',
    title: { pt: 'Grupo Sing', en: 'Grupo Sing' },
    meta: { pt: 'Desenvolvedor Júnior · 06/2026 — hoje', en: 'Junior Developer · Jun 2026 — present' },
    text: {
      pt: 'ERP modular para os ciclos comercial, operacional e financeiro. Segurança em quatro camadas com Row Level Security no PostgreSQL e integrações com RD Station e Meta Ads.',
      en: 'Modular ERP covering sales, operations and finance. Four-layer data security with Row Level Security on PostgreSQL, plus RD Station and Meta Ads integrations.',
    },
  },
  {
    act: 'present', n: 'VI', status: 'now',
    title: { pt: 'Java & AWS', en: 'Java & AWS' },
    meta: { pt: 'Back-end · nuvem', en: 'Back-end · cloud' },
    text: {
      pt: 'Lógica de serviços, conceitos de microsserviços, consumo de APIs e provisionamento de recursos na AWS, mirando escalabilidade.',
      en: 'Service logic, microservice concepts, API consumption and provisioning resources on AWS, aiming for scalability.',
    },
  },
  {
    act: 'destination', n: 'VII', status: 'next',
    title: { pt: 'Engenharia em escala', en: 'Engineering at scale' },
    meta: { pt: 'Sistemas distribuídos · alta disponibilidade', en: 'Distributed systems · high availability' },
    text: {
      pt: 'Projetar sistemas que aguentam milhões de requisições: arquitetura distribuída, resiliência e observabilidade de ponta a ponta.',
      en: 'Designing systems that handle millions of requests: distributed architecture, resilience and end-to-end observability.',
    },
  },
  {
    act: 'destination', n: 'VIII', status: 'next',
    title: { pt: 'Engenheiro Sênior', en: 'Senior Engineer' },
    meta: { pt: 'Big tech · grande banco', en: 'Big tech · major bank' },
    text: {
      pt: 'Ser referência técnica em um time de produto numa big tech ou num grande banco, com decisões que impactam milhões de clientes.',
      en: 'Becoming a technical reference on a product team at a big tech company or a major bank, making decisions that reach millions of customers.',
    },
  },
  {
    act: 'destination', n: 'IX', status: 'next',
    title: { pt: 'Le stelle', en: 'Le stelle' },
    meta: { pt: 'Liderança técnica', en: 'Technical leadership' },
    text: {
      pt: 'Liderar arquitetura, formar outros engenheiros e construir software que milhões de pessoas usam todos os dias.',
      en: 'Leading architecture, growing other engineers and building software that millions of people use every day.',
    },
  },
];

// IV. Opus — os quatro estágios da obra alquímica.
export const stages = {
  nigredo: { name: 'Nigredo', meaning: { pt: 'ideia & estudo', en: 'idea & study' } },
  albedo: { name: 'Albedo', meaning: { pt: 'em construção', en: 'in progress' } },
  citrinitas: { name: 'Citrinitas', meaning: { pt: 'funcional, evoluindo', en: 'working, evolving' } },
  rubedo: { name: 'Rubedo', meaning: { pt: 'em produção', en: 'in production' } },
};

export const projects = [
  {
    title: { pt: 'ERP modular', en: 'Modular ERP' },
    org: 'Grupo Sing', year: '2026', stage: 'citrinitas',
    desc: {
      pt: 'Sistema interno de gestão para os ciclos comercial, operacional e financeiro. Segurança de dados em quatro camadas (rotas protegidas, autenticação, autorização e Row Level Security) e integrações via API com RD Station e Meta Ads para centralizar dados comerciais.',
      en: 'Internal management system covering sales, operations and finance. Four-layer data security (protected routes, authentication, authorization and Row Level Security) and API integrations with RD Station and Meta Ads to centralize sales data.',
    },
    tags: [{ pt: 'APIs REST', en: 'REST APIs' }, 'PostgreSQL · RLS', { pt: 'Segurança em camadas', en: 'Layered security' }, { pt: 'Integrações', en: 'Integrations' }],
    note: { pt: 'Código privado · corporativo', en: 'Private code · corporate' },
  },
  {
    title: { pt: 'Automação de leads', en: 'Lead automation' },
    org: { pt: 'Independente', en: 'Independent' }, year: '2025', stage: 'rubedo',
    desc: {
      pt: 'Fluxos de integração que conectam serviços e APIs: disparo automatizado de mensagens e sincronização de leads em tempo real, eliminando trabalho manual.',
      en: 'Integration workflows connecting services and APIs: automated messaging and real-time lead sync, eliminating manual work.',
    },
    tags: ['n8n', 'Webhooks', { pt: 'APIs REST', en: 'REST APIs' }],
  },
  {
    title: { pt: 'Back-end & nuvem', en: 'Back-end & cloud' },
    org: { pt: 'Independente', en: 'Independent' }, year: '2026', stage: 'albedo',
    desc: {
      pt: 'Lógica de serviços e arquitetura em nuvem: microsserviços, consumo de APIs e provisionamento básico de recursos na AWS, visando escalabilidade.',
      en: 'Service logic and cloud architecture: microservices, API consumption and basic resource provisioning on AWS, built with scalability in mind.',
    },
    tags: ['Java', 'AWS', { pt: 'Microsserviços', en: 'Microservices' }],
  },
  {
    title: { pt: 'Este portfólio', en: 'This portfolio' },
    org: { pt: 'Pessoal', en: 'Personal' }, year: '2026', stage: 'rubedo',
    desc: {
      pt: 'Site bilíngue (PT/EN) com paleta de comandos, terminal interativo, Content Security Policy e deploy contínuo na Vercel. Desenvolvido com apoio de IA, com direção e revisão minhas.',
      en: 'Bilingual (PT/EN) site with a command palette, interactive terminal, Content Security Policy and continuous deployment on Vercel. Built with AI assistance, under my direction and review.',
    },
    tags: ['Vercel', 'CSP', 'i18n', { pt: 'Acessibilidade', en: 'Accessibility' }],
  },
];

// Traduções da interface. O português já está no HTML; aqui ficam o inglês
// e as strings usadas só pelo JavaScript.
export const ui = {
  pt: {
    copied: 'Copiado',
    copy: 'Copiar',
    paletteEmpty: 'Nada encontrado.',
    pal: {
      goto: 'Ir para',
      copyEmail: 'Copiar e-mail',
      whatsapp: 'Abrir WhatsApp',
      linkedin: 'Abrir LinkedIn',
      github: 'Abrir GitHub',
      instagram: 'Abrir Instagram',
      cv: 'Baixar currículo (PDF)',
      lang: 'Switch to English',
      terminal: 'Abrir terminal',
      top: 'Voltar ao topo',
    },
  },
  en: {
    copied: 'Copied',
    copy: 'Copy',
    paletteEmpty: 'Nothing found.',
    pal: {
      goto: 'Go to',
      copyEmail: 'Copy e-mail',
      whatsapp: 'Open WhatsApp',
      linkedin: 'Open LinkedIn',
      github: 'Open GitHub',
      instagram: 'Open Instagram',
      cv: 'Download résumé (PDF)',
      lang: 'Mudar para português',
      terminal: 'Open terminal',
      top: 'Back to top',
    },
  },
};

export const en = {
  'meta.title': 'Henrique Valois — Junior Software Engineer',
  'meta.desc': 'Junior software engineer focused on Java back-end: data structures, SQL, REST APIs and AWS, plus secure systems, integrations and AI automations.',
  skip: 'Skip to content',
  'nav.manifesto': 'Manifesto',
  'nav.arsenal': 'Arsenal',
  'nav.journey': 'Journey',
  'nav.opus': 'Opus',
  'nav.contact': 'Contact',
  'nav.cv': 'Résumé',
  'nav.menu': 'Menu',
  'nav.close': 'Close',
  'nav.cmd': 'Open command palette',

  'hero.edition': 'Portfolio — MMXXVI',
  'hero.status': 'Open to new opportunities',
  'hero.role': 'Junior Software<br><em>Engineer</em>',
  'hero.focus': 'Java back-end · Automation · AI',
  'hero.tagline': 'I build secure systems and integrations that run on their own, from the database to the API, with Java back-end as my focus. Next step: software at the scale of millions.',
  'hero.cta1': 'Message on WhatsApp',
  'hero.cta2': 'Download résumé',
  'hero.quoteTr': 'As above, so below — from the interface down to the database.',
  'hero.quoteSrc': 'The Emerald Tablet · Hermes Trismegistus',
  'hero.scroll': 'Scroll to descend',
  'hero.edu': 'Systems Dev. · AGES',
  'hero.cmd': 'commands',
  'hero.alt': 'Portrait of Henrique Valois',

  's1.ref': 'Sisyphus · Albert Camus, 1942',
  's1.statement': 'One must imagine <em>Sisyphus happy.</em> Every day I push the boulder — a bug, a query, a deploy — and the next day I push it again, a little further.',
  's1.p1': 'I’m <strong>Henrique Valois</strong>, a developer focused on Java back-end. I like solving the problem underneath — data modeling, APIs, multi-layer security and integrations across platforms like RD Station and Meta Ads. Right now I’m applying that to a modular ERP covering sales, operations and finance.',
  's1.p2': 'Before shipping code to production, I worked on the technical team at Capim Solar, handling documentation for solar micro-generation projects. I brought back what I use most today: rigor with process and respect for detail.',
  's1.p3': 'I study Systems Analysis &amp; Development at AGES and I’m going deep on Java and AWS. The goal is clear: software engineering at scale — at a major bank or a big tech company.',
  's1.f1k': 'Now',
  's1.f1v': 'Junior Dev @ Grupo Sing',
  's1.f2k': 'Focus',
  's1.f2v': 'Java · SQL · REST APIs · AWS',
  's1.f3k': 'Education',
  's1.f3v': 'Systems Dev. — AGES · 2028',
  's1.f4k': 'Based in',
  's1.fig1': '<span>Fig. 1</span> Sisyphus, or the delivery cycle.',
  's1.again': '↺ and tomorrow, again',
  's1.fig2': '<span>Fig. 2</span> whoami — type <kbd>help</kbd>.',
  's1.termLabel': 'Terminal command',

  's2.ref': 'The Emerald Tablet · Hermes Trismegistus',
  's2.title': 'Four elements,<br><em>one work.</em>',
  's2.lede': 'Alchemy became chemistry, and chemistry became a table. This one is mine: the elements I use to turn problems into products.',

  's3.ref': 'Divine Comedy · Dante Alighieri',
  's3.title': '<em>Nel mezzo del cammin</em><br>di nostra vita…',
  's3.lede': 'Every career is a crossing. Mine has three acts and nine circles — from the first line of code to the stars.',
  's3.fig': '<span>Fig. 3</span> The nine circles of the journey.',
  's3.end': 'And so we came forth, and once again beheld the stars.',

  's4.ref': 'Magnum Opus · the four stages of alchemy',
  's4.title': 'Every work goes through<br><em>four stages.</em>',
  's4.lede': 'Alchemists called it the Great Work: from raw matter to gold. I label my projects the same way.',
  's4.more': 'More on GitHub',

  's5.ref': 'Divine Comedy · Dante Alighieri',
  's5.title': 'Let’s build<br>something <em>that lasts.</em>',
  's5.lede': 'Open to junior developer roles and software engineering internships. I reply fast, ideally on WhatsApp.',
  's5.mail': 'E-mail',
  's5.cv': 'Résumé',
  's5.cvv': 'PDF · English',

  'foot.made': 'No frameworks — with coffee, philosophy and AI.',
  'foot.top': 'The end is the beginning',

  'pal.placeholder': 'Type a command or search…',
  'pal.hint': '<kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> run <kbd>esc</kbd> close',
};
