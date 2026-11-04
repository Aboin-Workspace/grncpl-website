import { SITE } from './nav'

export interface PageSeo { title: string; description: string }

const T = (s: string) => `${s} | ${SITE.title}`

/** Per-route title + meta description. Keys are the exact slugs. */
export const SEO: Record<string, PageSeo> = {
  '/': { title: 'GRN Constructions | Mining & Civil Infrastructure Contractor', description: 'GRN Constructions (GRNCPL): mining and civil infrastructure contractor in India since 1983. Mining, Civil Engineering, Irrigation and Railways.' },
  '/about-us/': { title: T('About Us'), description: 'GRN Constructions embarked on its journey in the mining and excavation sector in 1983. Core drivers, vision, mission and strengths of GRNCPL.' },
  '/management/': { title: T('Management'), description: 'A leadership with focus: Mr. Ganta Ramanaiah Naidu and Mr. Ganta Purnachandra Rao lead GRN Constructions Pvt. Ltd.' },
  '/founders-message/': { title: T('Founder’s Message'), description: 'A message from the founder of GRN Constructions Pvt. Ltd on the company’s journey since 1983.' },
  '/certifications/': { title: T('Certifications'), description: 'GRNCPL holds ISO 45001, ISO 14001 and ISO 9001 certificates for health and safety, environment and quality management.' },
  '/construction-brilliance/': { title: T('Construction Brilliance'), description: 'From camps and roads to bridges and workshops, GRNCPL’s construction expertise in mining-related works.' },
  '/our-expertise/': { title: T('Our Expertise'), description: 'GRNCPL executes projects of any scale in Mining, Civil, Irrigation and Railways with 1800 skilled employees and over 400 equipment.' },
  '/infrastructure/': { title: T('Infrastructure'), description: 'Average earthwork execution capability of around 1.5 lakh cubic meters per day with equipment from globally renowned manufacturers.' },
  '/strengths-and-experience/': { title: T('Strengths and Experience'), description: 'Company values, a dedicated workforce and an optimally managed fleet at GRN Constructions.' },
  '/hse-practices/': { title: T('HSE practices'), description: 'Health, Safety and Environment management practices at GRNCPL.' },
  '/completed-projects/': { title: T('Completed Projects'), description: '23 completed overburden and coal projects for WCL, SCCL, NMDC and others, with yearly production figures.' },
  '/current-projects/': { title: T('Current Projects'), description: 'Current projects of GRN Constructions including Khairagura, Niljai Expansion and the North Dhadu MDO for NLCIL.' },
  '/equipments/': { title: T('Equipments'), description: 'GRNCPL fleet: excavators, dumpers and trucks, dozers, graders, loaders, surface miners and support vehicles.' },
  '/csr/': { title: T('CSR'), description: 'GRNCPL CSR activities across health, education, drinking water, food donation, environment and community development.' },
  '/svastha-health/': { title: T('Svastha – Health'), description: 'GRNCPL health initiatives: financial support for patients, ambulance donation and a cardiothoracic ICU at NIMS, Hyderabad.' },
  '/vidyadhanam-education/': { title: T('Vidyadhanam – Education'), description: 'Scholarships, financial aid, school furniture and school construction support in Nellore by GRNCPL.' },
  '/jal-jeevan-drinking-water/': { title: T('Jal Jeevan – Drinking water'), description: 'Drinking water plants near project sites and mine groundwater redirected to local farms by GRNCPL.' },
  '/annadhana-food-donation/': { title: T('Annadhana – Food donation'), description: 'Monthly groceries to orphanages in Hyderabad and Nellore and daily milk for children’s homes from GRNCPL.' },
  '/paryavarana-environment/': { title: T('Paryavarana – Environment'), description: 'Responsible mining with biological reclamation and reforestation by GRNCPL.' },
  '/aadhaar-community-development/': { title: T('Aadhaar- Community Development'), description: 'A science museum in Nellore, elderly care support and wider community development by GRNCPL.' },
  '/photo-gallery/': { title: T('Photo Gallery'), description: 'Photo gallery of GRN Constructions. Coming soon. GeM 10 Years Recognition Award.' },
  '/careers/': { title: T('Careers'), description: 'Careers at GRN Constructions. Coming soon.' },
  '/contact-us/': { title: T('Contact Us'), description: 'Contact GRN Constructions: registered office in Nellore and office in Hyderabad. Email infohr@grncpl.com.' },
}

export const SEO_404: PageSeo = { title: T('Page not found'), description: 'The page you are looking for does not exist.' }

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GRN Constructions Pvt. Ltd',
  alternateName: 'GRNCPL',
  url: SITE.baseUrl,
  logo: SITE.logoRemote,
  foundingDate: '1983',
  email: 'infohr@grncpl.com',
  telephone: '+91-40-23002525',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plot no. 23, Door no. 2-48/TN/31/3&4, 2nd & 3rd Floor, Telecom Nagar, Gachibowli, Seri Lingampally, K.V. Rangareddy',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: '500032',
    addressCountry: 'IN',
  },
}

export const LOCAL_BUSINESS_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'GRN Constructions (Registered Office)',
    url: `${SITE.baseUrl}/contact-us/`,
    email: 'infohr@grncpl.com',
    telephone: '+91-861-2335687',
    address: { '@type': 'PostalAddress', streetAddress: 'Door No-16-3-1632, Haranatha Puram Main Road', addressLocality: 'Nellore', addressRegion: 'Andhra Pradesh', postalCode: '524003', addressCountry: 'IN' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'GRN Constructions (Hyderabad Office)',
    url: `${SITE.baseUrl}/contact-us/`,
    email: 'infohr@grncpl.com',
    telephone: '+91-40-23002525',
    address: { '@type': 'PostalAddress', streetAddress: 'Plot no. 23, Door no. 2-48/TN/31/3, 3rd Floor, Telecom Nagar, Gachibowli, Seri Lingampally, K.V. Rangareddy', addressLocality: 'Hyderabad', addressRegion: 'Telangana', postalCode: '500032', addressCountry: 'IN' },
  },
]
