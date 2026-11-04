export interface HeroSlide {
  /** Full headline, verbatim. */
  title: string
  /** The word that renders outlined and fills to amber. */
  accent: string
  image: {
    /** ≥1024px viewports (1920w WebP). */
    src: string
    /** <1024px viewports (1080w WebP). */
    srcSmall: string
    /** 3840px master for large / high-DPI desktops. Upscaled from the 1920px slider originals. TODO(client): replace with true 4K masters. */
    srcLarge: string
    alt: string
  }
}

/**
 * Slider images are the originals from the live site's Slider Revolution
 * (111.jpg, Banner-4-2.jpg, banner4.jpg, banner3-1.jpg), colour-graded and
 * re-encoded as WebP at 1920w / 1080w. TODO(client): supply 4K masters if they exist.
 */
export const HERO_SLIDES: HeroSlide[] = [
  { title: 'ACHIEVING THE IMPOSSIBLE', accent: 'IMPOSSIBLE', image: { src: '/images/hero/slide-1-1920.webp', srcSmall: '/images/hero/slide-1-1080.webp', srcLarge: '/images/hero/slide-1-3840.webp', alt: 'Open-cast mine with terraced benches, haul roads and dumpers under a dust haze' } },
  { title: 'BLASTING FREE EXCAVATION', accent: 'EXCAVATION', image: { src: '/images/hero/slide-2-1920.webp', srcSmall: '/images/hero/slide-2-1080.webp', srcLarge: '/images/hero/slide-2-3840.webp', alt: 'Volvo excavator loading a dumper truck at a rock face' } },
  { title: 'EXPLORING OPPORTUNITIES', accent: 'OPPORTUNITIES', image: { src: '/images/hero/slide-3-1920.webp', srcSmall: '/images/hero/slide-3-1080.webp', srcLarge: '/images/hero/slide-3-3840.webp', alt: 'Red iron-ore mine with excavators, dumpers and a loader working the benches' } },
  { title: 'MAKING A DIFFERENCE', accent: 'DIFFERENCE', image: { src: '/images/hero/slide-4-1920.webp', srcSmall: '/images/hero/slide-4-1080.webp', srcLarge: '/images/hero/slide-4-3840.webp', alt: 'Komatsu dumpers being loaded by an excavator at the pit edge' } },
]

/** Hero buttons reuse existing destinations and labels from the navigation. */
export const HERO_CTAS = { primary: { label: 'Equipments', href: '/equipments/' }, secondary: { label: 'Contact Us', href: '/contact-us/' } } as const

export const HERO_SUBTEXT =
  'We go the extra mile to ensure our clients are thoroughly satisfied. We measure our success with quality and perfection we deliver on works.'

export const PILLARS = [
  {
    title: 'Commitment',
    body: 'The company goes the extra mile to ensure that clients are thoroughly satisfied. Our measure of success is based on the quality and perfection we deliver in our work. This is the reason we hold an outstanding record of completing projects ahead of schedule, which has earned us appreciation from our clients.',
  },
  {
    title: 'Professionals',
    body: "The company's top management ranks among the finest. From the initiation of new projects to delivery, there's continuous vigilance at every step to ensure value, performance, and on-time distribution. The skilled workforce is empowered to leverage the company's strengths to achieve optimal results.",
  },
  {
    title: 'Technology',
    body: "The company's fleet of technologically advanced equipment is always available for quick turnarounds. The fleet has the capability to handle tough terrains and move large volumes of materials. This advanced equipment aids in completing jobs smoothly, without any snags or glitches, complementing the skilled workforce.",
  },
] as const

export const NATION_BUILDING = {
  title: 'A concerted effort towards nation building',
  body: 'One of GRNCPL’s primary goals is the passionate advancement of the nation through its insightful approach, strength, capability, and skill in diverse domains such as Mining, Civil Engineering, Irrigation, and Railways. The company demonstrates excellent workforce strengths alongside technological resources, with flexibility and professionalism that is particularly impressive in executing projects across a wide spectrum. As a result, it has opened diverse avenues of service for mining giants, state mining corporations, and central mining requirements. With progress and development in mind, GRNCPL never hesitates to put its best foot forward!',
  /** Words that land in amber during the scroll-scrubbed highlight. */
  keyDomains: ['Mining', 'Civil Engineering', 'Irrigation', 'Railways'],
  cta: { label: 'learn more', href: '/contact-us/' },
  /**
   * TODO(client): no video URL was exposed and the old poster (video-image-1170x658.jpg) now 404s on the
   * server. Using the live site's inner banner until the video/poster is supplied.
   */
  videoPoster: '/images/site-banner.webp',
  videoUrl: null as string | null,
} as const

export const STATS = [
  { value: 1983, label: 'Founded', format: 'year' },
  { value: 1800, suffix: '+', label: 'Skilled employees' },
  { value: 400, suffix: '+', label: 'Equipment pieces' },
  { value: 1.5, suffix: ' lakh m³/day', label: 'Average earthwork capability', decimals: 1 },
  { value: 3, label: 'ISO certificates' },
] as const

export const QUALITY_PROFESSIONALISM = {
  // TODO(client): the old site's adout.png was a 1KB placeholder; using the Strengths & Experience photo meanwhile.
  image: { src: '/images/site/strengths-and-experience.webp', alt: 'GRN Constructions at work' },
  items: [
    { title: 'Quality', body: 'We ensure that every operation in each domain maintains optimum quality. To achieve this, we go the extra mile, as we believe that satisfied customers are happy customers.' },
    { title: 'Professionalism', body: 'Professionalism is evident across our entire value chain. Numerous client testimonials echo our strong work ethics and our dedication to hard work and achievements.' },
  ],
} as const

export const LEADERS = [
  {
    name: 'Ganta Ramanaiah Naidu',
    role: 'Founder',
    body: 'GRN Constructions first embarked on a journey in the mining and excavation domain in 1983. Since, there has been no turning back. Sri Ganta Ramanaiah Naidu, founder-Chairman, with his unwavering ideals and business sense contributed value to different state and central infra-building projects. His passion and perseverance to offer best-in-class solutions in the mining industry put him ahead of his peers and carved a name for himself in the niche segment.',
  },
  {
    name: 'Ganta Purnachandra Rao',
    role: 'Managing Director',
    body: 'Mr. Ganta Purnachandra Rao, Managing Director, earned a Bachelor of Civil Engineering and a Master of International Business from London’s South Bank University before joining the family business in 2007. He is instrumental in diversifying the business while also being actively involved in administration, accounts, and finance.',
  },
  {
    name: 'Ganta Ramesh',
    role: 'Director',
    body: 'Mr. Ramesh, Director, earned his Masters in Engineering in the United States before joining the family business in 2008. He is actively involved in managing site administration and project progress on all projects outside of India.',
  },
] as const

export const CSR_TEASER = {
  title: 'CORPORATE SOCIAL RESPONSIBILITY',
  cards: [
    { title: 'Drinking Water Unit', body: 'We have established drinking water facilities in villages, equipped with advanced water purifying systems. Our aim is to ensure access to clean and safe drinking water for communities.', image: '/images/site/11.webp' },
    { title: 'Old Age Home with Hostel facility', body: 'We have established an old age home in Nellore, equipped with comprehensive hostel amenities. Additionally, we contribute donations to the United Charitable Organization to support and manage centres for orphanages and individuals with disabilities.', image: '/images/site/22.webp' },
    { title: 'Supporting Primary Schools', body: 'We are committed to providing additional teaching resources to primary schools in Haranathapuram by ensuring the payment of salaries to additional teachers.', image: '/images/site/school1.webp' },
    { title: 'Donations', body: 'We contribute to a united charitable organization to operate centres for orphanages and disabled persons. Additionally, we support the construction of essential shelters at a funeral ground for public utility, in collaboration with the Rotary club.', image: '/images/site/library1.webp' },
  ],
} as const

export const CLIENTS = ['WCL', 'SCCL', 'NMDC', 'NLCIL', 'I&CAD Govt. of AP'] as const

/**
 * Client badges for the home strip. `logo` is optional: drop an SVG/PNG at
 * public/images/clients/<slug>.svg and set it here; until then a monogram is drawn.
 * TODO(client): supply official logo files and confirm the expanded names below.
 */
export interface ClientBadge { abbr: string; fullName: string; slug: string; logo?: string }
export const CLIENT_BADGES: ClientBadge[] = [
  { abbr: 'WCL', fullName: 'Western Coalfields Limited', slug: 'wcl' },
  { abbr: 'SCCL', fullName: 'The Singareni Collieries Company Limited', slug: 'sccl' },
  { abbr: 'NMDC', fullName: 'NMDC Limited', slug: 'nmdc' },
  { abbr: 'NLCIL', fullName: 'NLC India Limited', slug: 'nlcil' },
  { abbr: 'I&CAD Govt. of AP', fullName: 'Irrigation & CAD Department, Government of Andhra Pradesh', slug: 'icad-ap' },
]

export const OPERATING_AREA = {
  address: 'PLOT NO. 23, DOOR NO. 2-48/TN/31/3&4, SECOND AND THIRD FLOOR, TELECOM NAGAR, GACHIBOWLI, HYDERABAD -500032, TELANGANA, INDIA.',
  cta: { label: 'Contact Us', href: '/contact-us/' },
} as const
