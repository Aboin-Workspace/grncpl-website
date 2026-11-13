export interface CsrPillar {
  slug: string
  href: string
  name: string
  theme: string
  image: { src: string; alt: string }
  intro?: string
  items: string[]
  outro?: string
}

export const CSR_HUB = {
  title: 'CSR',
  eyebrow: 'Corporate Social Responsibility',
  banner: { src: '/images/site/CSR.webp', alt: 'GRN Constructions CSR activity' },
  headline: 'Our CSR activities aim to build lasting benefits',
  body: 'GRNCPL boasts of several CSR activities across platforms. The company comprehends its activities influence countless individuals and communities in and around its neighbourhood, therefore, it is focused on actions that promote healthcare & education while laying emphasis on protecting the environment. GRNCPL also strives for improvements that encompass environmental, safety and social management practices.  Special pre-selected teams work to generate sustainability activities for the multi-faceted benefits of the children of employees. The company takes focused care on forming an environment that is both absorbing and enriching.',
  list: [
    'Payment of salaries to the additional teachers of primary schools at Haranathapuram',
    'Payment of school fee and scholarships to deserving poor students at Nellore',
    'Donations to united charitable organisation to run orphanages and centres for disabled people.',
    'Donations to construct shelters at funeral ground for public utility through Rotary club',
    'Donations to Rotary club to conduct social caused activities such as, Eye camps / Medical camps etc.,',
    'Constructed old age home at Nellore.',
    'Provided drinking water facilities with water purifying systems in villages.',
  ],
} as const

/**
 * The old hub banner (CSR.jpg) was a stock "responsibility pyramid" graphic.
 * Its four tiers are reproduced here verbatim and drawn as an interactive
 * component (src/components/csr/ResponsibilityPyramid.tsx) instead of the image.
 */
export interface CsrTier { abbr: string; title: string; motto: string }
export const CSR_PYRAMID: CsrTier[] = [
  { abbr: 'PR', title: 'Philanthropic Responsibility', motto: 'Be a good corporate citizen' },
  { abbr: 'ER', title: 'Ethical Responsibility', motto: 'Be ethical' },
  { abbr: 'LR', title: 'Legal Responsibility', motto: 'Obey the law' },
  { abbr: 'ER', title: 'Economic Responsibility', motto: 'Be profitable' },
]

/**
 * Latest CSR recognition, shown as the featured block on the CSR hub. Copy is verbatim from GRN's announcement.
 * The facts row is lifted from that same copy; the date is the one printed on the event backdrop.
 * TODO(client): confirm the event date, and that GRN may republish the news clip (footage: Mahaa News).
 */
export const CSR_ACHIEVEMENT = {
  eyebrow: 'Latest recognition',
  date: '24 July 2026',
  title: 'Empowering Education | Building a Better Tomorrow',
  amount: { value: 4, prefix: '₹', suffix: ' crore', label: 'CSR contribution towards school infrastructure' },
  facts: [
    { label: 'Honoured', value: 'Shri Ganta Ramanaiah Naidu' },
    { label: 'Recognition', value: 'Certificate of Appreciation' },
    { label: 'Awarded by', value: 'School Education Department, Government of Andhra Pradesh' },
    { label: 'School', value: 'ZPHS Housing Board Colony, Kallurupalli, Nellore, SPS Nellore District' },
  ],
  paragraphs: [
    'We are delighted to share that Shri Ganta Ramanaiah Naidu has been honoured with a Certificate of Appreciation by the School Education Department, Government of Andhra Pradesh, recognizing a significant contribution of ₹4 crore under Corporate Social Responsibility (CSR) activities towards the infrastructure development of ZPHS Housing Board Colony, Kallurupalli, Nellore, SPS Nellore District.',
    'The Certificate of Appreciation, signed by Shri Nara Lokesh, Hon’ble Minister for HRD, IT, Electronics & Communications, and RTG, Government of Andhra Pradesh, recognizes this meaningful initiative towards strengthening educational infrastructure and providing students with an improved and conducive learning environment.',
    'At GRN Constructions, we believe that education is one of the strongest foundations for sustainable social development. Our CSR initiatives reflect our commitment to supporting communities, enhancing access to quality educational infrastructure, and creating opportunities that enable future generations to learn, grow, and succeed.',
    'This recognition is a proud milestone in our CSR journey and reinforces our commitment to making a meaningful and lasting contribution to society.',
  ],
  tagline: ['Building Infrastructure.', 'Empowering Education.', 'Shaping the Future.'],
  video: { src: '/videos/csr-zphs-appreciation.mp4', poster: '/images/csr/zphs-appreciation-1.webp', label: 'Watch the Certificate of Appreciation being presented', credit: 'Footage: Mahaa News' },
  photos: [
    { src: '/images/csr/zphs-appreciation-2.webp', alt: 'Applause on stage as the Certificate of Appreciation is handed over at the School Education Department event' },
    { src: '/images/csr/zphs-appreciation-3.webp', alt: 'Congratulations on stage after the Certificate of Appreciation is received' },
  ],
} as const

export const CSR_PILLARS: CsrPillar[] = [
  {
    slug: 'svastha-health', href: '/svastha-health/', name: 'Svastha', theme: 'Health',
    image: { src: '/images/site/1.webp', alt: 'Svastha – Health' },
    intro: 'Under our health-focused CSR program, GRNCPL has undertaken several impactful initiatives, including:',
    items: [
      'Providing financial support to Epileptic, cardiac, cancer patients, covid -19 ventilated Patients in critical need, covering the cost of their surgeries at KIMS hospital, Hyderabad and Nellore.',
      'Donating ambulance to Government Hospital at kumaram Bheem, Adilabad district.  during the critical time of the COVID-19 pandemic.',
      'Contributing to the establishment of the latest cardiothoracic Intensive Care Unit at NIMS Government hospital, Hyderabad.',
    ],
    outro: 'These endeavors reflect GRN’s commitment to enhancing healthcare accessibility and infrastructure, making a positive difference in the lives of those in need.',
  },
  {
    slug: 'vidyadhanam-education', href: '/vidyadhanam-education/', name: 'Vidyadhanam', theme: 'Education',
    image: { src: '/images/site/vidyadhanam.webp', alt: 'Vidyadhanam – Education' },
    intro: 'GRNCPL’s dedication to education has led to a wide range of projects that have helped both the growth of each student and the improvement of educational facilities and services as a whole. These efforts include :',
    items: [
      'Awarding scholarships to deserving students.',
      'Providing financial aid to underprivileged students to ensure they have access to quality education.',
      'Sponsoring furniture for several schools in Nellore, enhancing the learning environment for students.',
      'Assisting in the construction of government schools in Nellore(Andhra Pradesh) and neighboring villages ,to enhance education in these areas.',
    ],
  },
  {
    slug: 'jal-jeevan-drinking-water', href: '/jal-jeevan-drinking-water/', name: 'Jal Jeevan', theme: 'Drinking water',
    image: { src: '/images/site/3.webp', alt: 'Jal Jeevan – Drinking water' },
    items: [
      'GRNCPL’s involvement with the drinking water program shows its commitment to addressing drinking water problems in rural areas nearby to its project sites. The company acknowledges that having clean ,drinking water is a fundamental human right and an essential component for the people . As a result, it has implemented numerous drinking water plants to enhance water accessibility and sustainability in these regions.',
      'GRNCPL has also realized that the groundwater that naturally occurs in mines could be a useful resource that can be used to help local farmers. Groundwater often builds up in mines in mining areas. This water is usually drained or controlled as part of the mining process. But GRNCPL has come up with new ways to get this groundwater out of the ground through pumping and pipe systems. By sending this water to nearby farms, GRNCPL helps with irrigation and improves the region’s farming output. This proactive method not only helps farmers, but it also encourages farmers to use water in ways that are good for the environment and make the most of the resources they have.',
    ],
  },
  {
    slug: 'annadhana-food-donation', href: '/annadhana-food-donation/', name: 'Annadhana', theme: 'Food donation',
    image: { src: '/images/site/4.webp', alt: 'Annadhana – Food donation' },
    items: [
      'GRNCPL’s strong commitment to social responsibility is shown by the fact that it sends groceries every month to few orphanages in Hyderabad and Nellore. Additionally, GRN sends daily milk from its farm to support the nutritional needs of young children under the age of 15 in local children’s home .',
    ],
  },
  {
    slug: 'paryavarana-environment', href: '/paryavarana-environment/', name: 'Paryavarana', theme: 'Environment',
    image: { src: '/images/site/5.webp', alt: 'Paryavarana – Environment' },
    items: [
      'GRNCPL strives to actively promote environmental sustainability by proactively protecting, conserving, and using natural resources responsibly. Through its initiatives, the corporation is committed to contributing to the preservation and improvement of the environment.',
      'GRNCPL practices responsible mining with biological reclamation. The company replants trees in devastated forests after mining, restoring ecological balance and biodiversity. Reforestation improves air quality, sequesters carbon, and maintains the local environment. Biological reclamation indicates Grncpl’s commitment to sustainable mining and environmental conservation.',
    ],
  },
  {
    slug: 'aadhaar-community-development', href: '/aadhaar-community-development/', name: 'Aadhaar', theme: 'Community Development',
    image: { src: '/images/site/6.webp', alt: 'Aadhaar – Community Development' },
    items: [
      'The GRNCPL’s initiative to build science museum in Nellore is an important step toward community development. The museum will serve as an important cultural and educational resource by exhibiting the region’s history, art, and culture. It will foster a sense of pride and identity among residents, attract tourists, stimulate economic growth, and generate employment opportunities, all of which will contribute to the community’s well-being and progress.',
      'GRNCPL ,As part of its CSR initiative for Community Development, GRN assists the elderly by covering the cost of living for a number of members residing in an old age facility.',
      'GRNCPL’s CSR contributions cover diverse developments, including social welfare, infrastructure, cultural preservation, economic empowerment, environmental sustainability, disaster relief, and community engagement. These initiatives have positively impacted society, progress and well-being for communities.',
    ],
  },
]

/** Nav label for a pillar, exactly as the old menu printed it. */
export const CSR_NAV_LABELS: Record<string, string> = {
  'svastha-health': 'Svastha – Health',
  'vidyadhanam-education': 'Vidyadhanam – Education',
  'jal-jeevan-drinking-water': 'Jal Jeevan – Drinking water',
  'annadhana-food-donation': 'Annadhana – Food donation',
  'paryavarana-environment': 'Paryavarana – Environment',
  'aadhaar-community-development': 'Aadhaar- Community Development',
}
