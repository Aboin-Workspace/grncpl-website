export interface Office {
  id: string
  name: string
  address: string
  email: string
  phone: string
  /** tel: href */
  phoneHref: string
}

export const OFFICES: Office[] = [
  {
    id: 'registered',
    name: 'GRN Constructions (Registered Office)',
    address: 'Door No-16-3-1632, Haranatha Puram Main Road, Nellore -524003 Andhra Pradesh INDIA',
    email: 'infohr@grncpl.com',
    phone: '+91-861-2335687',
    phoneHref: 'tel:+918612335687',
  },
  {
    id: 'hyderabad',
    name: 'GRN Constructions (Hyderabad Office)',
    address: 'Plot no. 23, Door no. 2-48/TN/31/3, 3rd Floor, Telecom Nagar, Gachibowli, Seri Lingampally, K.V. Rangareddy, Hyderabad -500032, Telangana, India.',
    email: 'infohr@grncpl.com',
    phone: '040-23002525',
    phoneHref: 'tel:04023002525',
  },
]

export const CONTACT = {
  title: 'Contact Us',
  getInTouch: {
    heading: 'GET IN TOUCH',
    // "drone related" was leftover template copy and has been removed.
    body: 'We’re here to help! If you have any questions regarding our services or anything else please send us an email via the contact form.',
  },
  form: {
    fields: { name: 'Name', email: 'Email', phone: 'Phone', message: 'Message' },
    submit: 'Send message',
    success: { title: 'Message sent', body: 'Thank you. We will get back to you shortly.' },
  },
  // TODO(client): the old page had a map block that did not come through; supply the embed URL.
  mapEmbedUrl: null as string | null,
} as const

/** Footer contact block (verbatim). */
export const FOOTER_CONTACT = {
  about: 'GRNCPL’s one of the chief goals is to passionately build the nation with its insightful approach, strength, capability and skill in diverse domains like Mining,..',
  contactInformation: {
    heading: 'Contact Information',
    address: 'Plot no. 23, Door no. 2-48/TN/31/3&4, 2nd & 3rd Floor, Telecom Nagar, Gachibowli, Seri Lingampally, K.V. Rangareddy, Hyderabad -500032, Telangana, India.',
    email: 'infohr@grncpl.com',
    phone: '040-23002525',
    phoneHref: 'tel:04023002525',
  },
  regdOffice: {
    heading: 'Regd. office',
    address: '16-3-1632, Haranathapuram Main Road, Nellore- 524003, Andhra Pradesh.',
    phone: '+91-861-2335687',
    phoneHref: 'tel:+918612335687',
  },
  copyright: 'GRN Constructions © 2026. All rights reserved.',
  // TODO(client): social profile URLs were not exposed on the old site.
  social: [
    { label: 'Facebook', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'Youtube', href: '#' },
  ],
  bigLine: 'Let\'s build together',
} as const

export const GALLERY = {
  title: 'Photo Gallery',
  comingSoon: 'Coming Soon',
  award: {
    heading: 'Gem 10 Years Award Ceremony',
    body: 'GRN Construction is proud to be recognized at the GEM 10 Years Award Ceremony. This special occasion celebrates our continued commitment to excellence, quality, and contribution to the industry.',
    recognition: { heading: 'GeM 10 Years Recognition Award', body: 'Celebrating excellence and outstanding contribution to the nation through Government e Marketplace (GeM).' },
    highlightsHeading: 'Award Ceremony Highlights',
    // TODO(client): the award photos did not load on the old site; supply the images.
    photos: [] as { src: string; alt: string }[],
  },
} as const

export const CAREERS = { title: 'Careers', comingSoon: 'Coming Soon' } as const
