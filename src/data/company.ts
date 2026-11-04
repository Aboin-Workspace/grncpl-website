export interface EditorialSection {
  heading?: string
  paragraphs?: string[]
  list?: string[]
}

export const ABOUT_US = {
  title: 'About Us',
  eyebrow: 'Company',
  banner: { src: '/images/site/about-us.webp', alt: 'GRN Constructions site' },
  headline: 'Exploring opportunities',
  paragraphs: [
    'GRN Constructions embarked on its journey in the mining and excavation sector in 1983, and there has been no looking back since. Sri Ganta Ramanaiah Naidu, the founder, with steadfast ideals and astute business acumen, added value to various state and central infra-building projects. His passion and relentless dedication to providing top-notch solutions in the mining industry set him apart and established his reputation in the niche segment.',
    'Following this success closely, GRN evolved into GRN Constructions Pvt. Ltd in 2008. With profound industry expertise and experience in managing large-scale projects, GRN Constructions Pvt. Ltd diversified its operations, extending its proficiency to domains like Irrigation, Railways, and Road Building.',
    'At the heart of this remarkable accomplishment is the unwavering leadership of the chairman, supported by his sons, Mr. Purnachandra Rao and Mr. Ramesh. It’s a testament to their dynamic management that the company has experienced consistent growth and success over the years.',
  ],
  coreDrivers: {
    heading: 'CORE DRIVERS OF GRNCPL',
    items: [
      'Fair Business Practices',
      'Building Trust, Integrity and Reliability',
      'A continuous effort to achieve higher standards of Professionalism and Team Spirit.',
      'Perseverance for Quality and Innovation',
    ],
  },
  vision: {
    heading: 'Vision',
    items: [
      'To be recognized as leaders in mining civil and infrastructure building frontier',
      'To be a frontrunner in introducing efficient and resource friendly technologies to the country',
      'To be recognized as major contributor to Nation building',
    ],
  },
  mission: {
    heading: 'Mission',
    items: [
      'To perform and surpass the set benchmarks of targets, quality and deliverables',
      'To stay ahead in researching and adopting efficient technologies in fields of construction and engineering',
      'To create safe working environment that encourages innovation and high performance',
      'To always recognize employee achievement and reward talent',
      'To adopt lean operations and ensure max returns to customers, stakeholders, and performers.',
    ],
  },
  /** The old values.png wheel, reproduced verbatim (letter → value) and drawn live in src/components/company/KeyValuesWheel.tsx. */
  keyValues: {
    title: 'Key Values',
    items: [
      { letter: 'G', value: 'Well- equipped machinery for doing various contracts' },
      { letter: 'R', value: 'Client Centric' },
      { letter: 'N', value: 'Quality and Safety driven' },
      { letter: 'C', value: 'Effective Time Management' },
      { letter: 'P', value: 'Efficient use of resources' },
      { letter: 'L', value: 'Sustainable Project Management' },
    ],
  },
  strengths: {
    heading: 'Strengths to reckon with!',
    body: 'A workforce of 1800 skilled employees, unwavering in their commitment, coupled with an armada of over 400 equipment pieces, and visionary leadership, etched GRNCPL’s name in gold. Today, the company is one of the top contenders, fostering ties, nurturing the nation’s growth, and adeptly serving diverse industries. For peers, an eminent name; for clients, a trusted choice; for quality and punctuality, a beacon.',
  },
} as const

export const MANAGEMENT = {
  title: 'Management',
  eyebrow: 'Company',
  banner: { src: '/images/site/building.webp', alt: 'GRN Constructions building' },
  headline: 'A leadership with focus!',
  paragraphs: [
    'The leadership duo – Mr. Ganta Ramanaiah Naidu and his son, Mr. Purnachandra Rao – imbued acute professionalism and discipline. Their guidance propels teams, operating under keen management, toward milestones of excellence and distinction.',
    'Mr. Ganta Ramanaiah Naidu’s sons have truly reinforced his business vision through concerted efforts. They’ve generated new strategies, enhanced operations, and ensured top-notch output, while injecting greater strength into GRN Constructions Pvt. Ltd.',
    'The elder son, Mr. Ganta Purnachandra Rao, serves as the Managing Director. He holds a Bachelor’s in Civil Engineering and a Masters in International Business from London – South Bank University. Joining the enterprise in 2007, he has played a pivotal role in diversifying the business and actively engages in administration, accounts, and finance.',
  ],
} as const

export const FOUNDERS_MESSAGE = {
  title: 'Founder’s Message',
  eyebrow: 'Company',
  banner: { src: '/images/site/founders-message.webp', alt: 'Founder of GRN Constructions' },
  headline: 'Founder’s Message',
  pullQuote: 'We pushed the envelope of progress bit by bit and today stand at the threshold of success that we hadn’t even imagined in our most ambitious dreams.',
  paragraphs: [
    'It is a great pleasure to introduce GRN Constructions Pvt. Ltd. Our journey to success has been marked by both challenges and opportunities. Through humility and hard work, we have risen from modest beginnings to attain national and global recognition. Established in 1983, the initial steps were crucial for our journey: outlining a plan to work, setting projects on a trajectory, establishing a track record of achievements, and creating new benchmarks in the sphere. Our progress has been slow, yet steady. The growth has been difficult, yet closer to our aspirations. Finally, our toil paid off. We pushed the envelope of progress bit by bit and today stand at the threshold of success that we hadn’t even imagined in our most ambitious dreams.',
    'As our businesses diversified into various domains such as mining, railways, irrigation, roadways, and more, contributing to the nation’s development, our range of services also expanded. Our ability to flourish is rooted in ethical business practices. An inherent drive to excel in our operational field led us to devise cost-effective solutions. Our unwavering standards enhanced our quality and operational capacities, positively affecting our clients.',
    'Apart from that, our strategic thinking, innovative approaches, and diverse skill sets have paved the way for us to enter new markets and spheres. Our overseas ventures have flourished, increasing our market share and further solidifying our presence both in India and abroad. As a result, our company has ascended with the momentum to soar into the limitless skies of success.',
    'We acknowledge that effective human resource management is pivotal for success. This is why we consistently attract the finest talent across various domains of expertise. Our senior management possesses the knowledge to swiftly address critical challenges. Training remains a constant feature to enhance our understanding of technologies and skill sets. Moreover, we have established strong relationships with key industry players, enabling us to draw upon their expertise and benefit stakeholders across platforms.',
  ],
} as const

export const CERTIFICATIONS = {
  title: 'Certifications',
  eyebrow: 'Company',
  headline: 'Rising to Excellence: GRNCPL\'s Triple ISO Certificates',
  paragraphs: [
    'The acquisition of the ISO 45001, ISO 14001, and ISO 9001 Certificates represents a momentous achievement for GRNCPL. These esteemed certifications symbolize our unwavering dedication to excellence across diverse fronts. ISO 45001, the global standard for workplace health and safety, underscores our commitment to safeguarding our workforce and stakeholders. ISO 14001, an internationally recognized environmental management standard, highlights our responsibility to sustainable practices. ISO 9001, synonymous with Quality Management Systems (QMS), reaffirms our pursuit of uncompromising quality.',
    'These certifications serve as badges of honor, reflective of our values and aspirations. They inspire us to reach higher, strive further, and continuously raise the bar. With this recognition, we are poised to uphold our pledge to health, safety, environmental sustainability, and superior quality.',
  ],
  certificates: [
    { id: 'iso-45001', label: 'ISO 45001', caption: 'Occupational health and safety', src: '/images/site/45001-725x1024.webp', alt: 'ISO 45001 certificate of GRN Constructions Pvt. Ltd.' },
    { id: 'iso-14001', label: 'ISO 14001', caption: 'Environmental management', src: '/images/site/G.R.N.-CONSTRUCTIONS-PVT.-LTD.-14001-FINAL-ICV_page-0001-725x1024.webp', alt: 'ISO 14001 certificate of GRN Constructions Pvt. Ltd.' },
    { id: 'iso-9001', label: 'ISO 9001', caption: 'Quality management systems', src: '/images/site/G.R.N.-CONSTRUCTIONS-PVT.-LTD.-9001-FINAL-ICV_page-0001-725x1024.webp', alt: 'ISO 9001 certificate of GRN Constructions Pvt. Ltd.' },
  ],
} as const

export const CONSTRUCTION_BRILLIANCE = {
  title: 'Construction Brilliance',
  eyebrow: 'Company',
  banner: { src: '/images/site/construction-brilliance-1.webp', alt: 'Construction work by GRN Constructions' },
  headline: 'Construction Brilliance',
  paragraphs: [
    'GRNCPL stands as a beacon of excellence, not only in its commitment to diverse fields but also in its dedication to mining-related constructions. From the construction of camps and roads to bridges and workshops, GRNCPL’s prowess extends beyond conventional boundaries. Each project undertaken reflects a seamless blend of innovation, precision, and expertise, amplifying not only the workflow but also the quality of the final result.',
    'With an unwavering dedication to delivering exceptional projects, GRNCPL has set a distinctive benchmark that resonates across the industry. The fusion of their construction prowess with mining-related endeavours showcases their ability to create holistic solutions that transcend expectations.',
  ],
} as const

export const OUR_EXPERTISE = {
  title: 'Our Expertise',
  eyebrow: 'Company',
  images: [
    { src: '/images/site/our-expertise-1.webp', alt: 'GRN Constructions expertise' },
    { src: '/images/site/our-expertise-2.webp', alt: 'GRN Constructions equipment at work' },
  ],
  headline: 'Thinking ahead for positive outcomes!',
  paragraphs: [
    'GRNCPL, driven by strategic focal points, a skilled workforce, incorporation of cutting-edge technology, and professional competence, has secured multiple projects from both central and state governments. Successfully completing these projects within specified timelines, the company’s intrinsic passion for nation-building, coupled with its infrastructural strength and expertise sets GRNCPL apart. This strategic stance consistently opens doors to a diverse array of services in the mining field, catering to mining giants, state mining corporations, and central mining requirements.',
    'GRNCPL possesses the necessary capabilities to professionally execute projects of any scale in fields such as Mining, Civil, Irrigation, and Railways, showcasing exceptional acumen and precision.',
  ],
  strengths: {
    heading: 'Strengths to reckon with!',
    paragraphs: [
      'A formidable convoy of 1800 skilled and dedicated employees, combined with a fleet of over 400 equipment and machinery, and guided by a resolute leadership, has propelled GRNCPL to etch its name in golden letters.',
      'Today, the company stands among the top, fostering robust relationships, contributing to the nation’s development, and proficiently serving diverse industries.',
      'GRNCPL is a name recognized by peers, esteemed by clients, and trusted for quality and punctuality in deliveries!',
    ],
  },
  /** Five feature blocks (the old page showed them twice; built once). */
  features: [
    { title: 'Commitment to excellence', body: 'The company goes the extra mile to ensure clients are thoroughly satisfied. Our measure of success is the quality and perfection we deliver in our work – the reason we hold an outstanding record of completing projects ahead of schedule, earning appreciation from clients.' },
    { title: 'Expertise for top output!', body: 'Having accumulated extensive years of experience, the company possesses a valuable domain advantage. GRNCPL’s comprehensive strengths consistently aim to deliver clients a highly beneficial and exceeding experience.' },
    { title: 'Growing Customer base!', body: 'The company’s presence across diverse fields fosters robust relationships with suppliers, vendors, and customers, leveraging these strengths to benefit clients. Our credibility speaks volumes.' },
    { title: 'Professionals at the helm!', body: 'The company’s top management is among the finest. From the inception of new projects to delivery, there’s a constant vigilance at every step to ensure value, performance, and on-time distribution. The skilled workforce is empowered to harness the company’s strengths for optimal design.' },
    { title: 'Technology at hand!', body: 'The company’s fleet of technologically advanced equipment is readily available for swift turnarounds. This fleet possesses the strength to tackle challenging terrains and handle large volumes of material. The advanced equipment facilitates seamless job completion without any snags or glitches, complementing the expertise of our skilled workforce.' },
  ],
} as const
