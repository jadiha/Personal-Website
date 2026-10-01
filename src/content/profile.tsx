import type { ReactNode } from 'react';

// Shared About and Experience content for the desktop and mobile pages

const ExtLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">{children}</a>
);

export const ABOUT = {
  intro: 'I\'m a social impact builder and a Systems Design Engineering student at the University of Waterloo. I build software, products and design for the people who need it and deserve it.',
  passionsLead: 'I care about a lot of things, and I take the steps to act on them:',
  passions: [
    { icon: '🌸', label: 'Women\'s health', text: 'founding Attune Labs, building the intelligence layer for women\'s health' },
    { icon: '🧠', label: 'Neurotech', text: 'exploring how technology can better understand the mind' },
    { icon: '🗳️', label: 'Local politics', text: 'involved with the NDP youth community, working to be the youth voice that moves policy forward' },
    { icon: '🤝', label: 'Community', text: 'co-organized Women Who Build, bringing early-career women in tech together and donating to charity' },
  ],
  beenAt: 'Gale · Wealthsimple · Attune Labs · Amazon Web Services · Real Life Robotics',
  seeking: 'For Summer 2027, I\'m looking for software, product or design roles at teams building for good, work I genuinely align with.',
  email: 'jadiha.arul@gmail.com',
};

export interface Role {
  icon: string;
  org: string;
  role: string;
  when: string;
  body: ReactNode;
}

export const EXPERIENCE: Role[] = [
  { icon: '✨', org: 'Gale', role: 'Design Engineer', when: 'Sep 2026 - Present',
    body: <>Designing and building internal tools, right where design and engineering meet.</> },
  { icon: '🌱', org: 'Attune Labs', role: 'Founder', when: 'Aug 2026 - Present',
    body: <>Building the intelligence layer for women&apos;s health. Won the <span className="text-pink-500">D.S. Rajczak Enterprise Co-op Award in Engineering</span> (Conrad School of Entrepreneurship and Business), receiving funding through a competitive pitch to a panel of Waterloo Engineering judges.</> },
  { icon: '💳', org: 'Wealthsimple', role: 'Credit Card team', when: 'Jan 2026 - Apr 2026',
    body: <>Helped launch the <ExtLink href="https://www.wealthsimple.com/en-ca/credit-card">Visa Infinite+</ExtLink> and no-fee <ExtLink href="https://help.wealthsimple.com/hc/en-ca/articles/51274223026203-Understand-premium-benefits-for-the-Visa-Infinite-1-credit-card-beta">Visa Infinite 1%</ExtLink> cards: eligibility gates, card rendering, mobile readiness and launch-risk tracking across a 200K+ rollout. Got credit score insights onto the roadmap and prototyped 3 AI mobile concepts.</> },
  { icon: '📈', org: 'Wealthsimple', role: 'Margins team', when: 'May 2025 - Aug 2025',
    body: <>Shipped <ExtLink href="https://product-news.wealthsimple.com/use-your-tfsa-to-boost-your-margin-power">TFSA-to-margin linking</ExtLink>, which lets Canadians boost their buying power while their TFSA keeps growing tax-free. It contributed to $60K in daily revenue.</> },
  { icon: '🧭', org: 'UW Blueprint', role: 'Product Manager', when: 'Jan 2026 - Apr 2026',
    body: <>Collaborated with designers on the first iteration of designs making it easier for schools to connect with local farmers in Mississippi, giving more visibility to small and minority producers.</> },
  { icon: '🤖', org: 'Real Life Robotics', role: 'PM & Full Stack Engineer', when: 'Sep 2024 - Dec 2024',
    body: <>Put real delivery robots in front of real people at the Toronto Zoo. Built the Node.js server linking hardware, telemetry and UI, which cut response latency in half.</> },
  { icon: '☁️', org: 'MPAC', role: 'Cloud Infrastructure Analyst', when: 'Jan 2024 - Apr 2024',
    body: <>Ran cloud infrastructure operations with Python Boto3 and React.</> },
  { icon: '📊', org: 'Amazon Web Services', role: 'SDE Intern', when: 'May 2023 - Aug 2023',
    body: <>Built a cron calendar used by 70,000+ employees, turning 100+ scattered workflows into one clear view.</> },
  { icon: '🏦', org: 'Home Trust Company', role: 'QA Automation Analyst', when: 'Jan 2023 - Apr 2023',
    body: <>Where it all started: automated digital-banking QA with CodeceptJS and Postman, which cut testing time by 40%.</> },
];

// Rotating "I'm a ___" words and tagline on the welcome screen
export const IDENTITIES = ['community builder', 'social impact builder', 'founder', 'design engineer', 'leader', 'dreamer & doer'];
export const TAGLINE = 'Building for the people who need it and deserve it.';
