export interface NavLink { label: string; href: string }
export interface NavGroup { label: string; href?: string; children: NavLink[] }
export type NavItem = NavLink | NavGroup

export const isGroup = (item: NavItem): item is NavGroup => 'children' in item

/** Exact names, order and slugs from the old site. */
export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Company',
    children: [
      { label: 'About Us', href: '/about-us/' },
      { label: 'Management', href: '/management/' },
      { label: 'Founder’s Message', href: '/founders-message/' },
      { label: 'Certifications', href: '/certifications/' },
      { label: 'Construction Brilliance', href: '/construction-brilliance/' },
      { label: 'Our Expertise', href: '/our-expertise/' },
    ],
  },
  {
    label: 'Our Operations',
    children: [
      { label: 'Infrastructure', href: '/infrastructure/' },
      { label: 'Strengths and Experience', href: '/strengths-and-experience/' },
      { label: 'HSE practices', href: '/hse-practices/' },
    ],
  },
  {
    label: 'Works',
    children: [
      { label: 'Completed Projects', href: '/completed-projects/' },
      { label: 'Current Projects', href: '/current-projects/' },
    ],
  },
  { label: 'Equipments', href: '/equipments/' },
  {
    label: 'CSR',
    href: '/csr/',
    children: [
      { label: 'Svastha – Health', href: '/svastha-health/' },
      { label: 'Vidyadhanam – Education', href: '/vidyadhanam-education/' },
      { label: 'Jal Jeevan – Drinking water', href: '/jal-jeevan-drinking-water/' },
      { label: 'Annadhana – Food donation', href: '/annadhana-food-donation/' },
      { label: 'Paryavarana – Environment', href: '/paryavarana-environment/' },
      { label: 'Aadhaar- Community Development', href: '/aadhaar-community-development/' },
    ],
  },
  { label: 'Photo Gallery', href: '/photo-gallery/' },
  { label: 'Careers', href: '/careers/' },
  { label: 'Contact Us', href: '/contact-us/' },
]

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { label: 'About Us', href: '/about-us/' },
  { label: 'Management', href: '/management/' },
  { label: "Founder's Message", href: '/founders-message/' },
  { label: 'Certifications', href: '/certifications/' },
  { label: 'Construction Brilliance', href: '/construction-brilliance/' },
  { label: 'Our Expertise', href: '/our-expertise/' },
  { label: 'Infrastructure', href: '/infrastructure/' },
  { label: 'Strengths and Experience', href: '/strengths-and-experience/' },
  { label: 'HSE Practices', href: '/hse-practices/' },
]

export const SITE = {
  title: 'GRN Constructions',
  shortName: 'GRNCPL',
  logo: '/images/brand/logo.png',
  logoRemote: 'https://www.grncpl.com/wp-content/uploads/2023/05/logo.png',
  favicon: 'https://www.grncpl.com/wp-content/uploads/2023/05/favicon-300x300.png',
  baseUrl: 'https://www.grncpl.com',
} as const
