export interface EquipmentRow { make: string; model: string; numbers: number }
export interface EquipmentCategory {
  id: string
  label: string
  image?: { src: string; alt: string }
  rows: EquipmentRow[]
}

export const EQUIPMENT_TITLE = 'Equipments'
export const EQUIPMENT_COLUMNS = { make: 'Make', model: 'Model', numbers: 'Numbers' } as const

export const EQUIPMENT: EquipmentCategory[] = [
  {
    id: 'excavators', label: 'Excavators',
    image: { src: '/images/site/excavators.webp', alt: 'Excavators' },
    rows: [
      { make: 'Volvo', model: 'EC210', numbers: 1 },
      { make: 'Volvo', model: 'EC480', numbers: 15 },
      { make: 'Volvo', model: 'EC750', numbers: 2 },
      { make: 'Volvo', model: 'EC550', numbers: 12 },
      { make: 'TATA', model: 'ZX650', numbers: 2 },
      { make: 'TATA', model: 'ZX870', numbers: 16 },
      { make: 'TATA', model: 'ZX890', numbers: 4 },
    ],
  },
  {
    id: 'dumpers-trucks', label: 'Dumpers/Trucks',
    image: { src: '/images/site/dumpers-trucks.webp', alt: 'Dumpers and trucks' },
    rows: [
      { make: 'Volvo', model: 'FMX460', numbers: 144 },
      { make: 'Volvo', model: 'FMX500', numbers: 105 },
      { make: 'Komatsu', model: 'HD785', numbers: 28 },
    ],
  },
  {
    id: 'dozers', label: 'Dozers',
    image: { src: '/images/site/dozers.webp', alt: 'Dozers' },
    rows: [
      { make: 'Komatsu', model: 'D85', numbers: 17 },
      { make: 'Shantui', model: 'DH17B2', numbers: 2 },
      { make: 'Shantui', model: 'DH24C3', numbers: 8 },
      { make: 'CAT', model: 'D8T', numbers: 2 },
    ],
  },
  {
    id: 'graders', label: 'Graders',
    image: { src: '/images/site/graders.webp', alt: 'Graders' },
    rows: [
      { make: 'CAT', model: 'Motor Grader 140K2', numbers: 8 },
      { make: 'Komatsu', model: 'KG-705-5', numbers: 2 },
    ],
  },
  {
    id: 'loaders', label: 'Loaders',
    image: { src: '/images/site/loaders.webp', alt: 'Loaders' },
    rows: [
      { make: 'VOLVO', model: 'L150H', numbers: 4 },
      { make: 'VOLVO', model: 'L120F', numbers: 5 },
      { make: 'VOLVO', model: 'ZW225', numbers: 9 },
    ],
  },
  {
    id: 'surface-miner', label: 'Surface Miner',
    rows: [{ make: 'WRITGEN', model: '220SM', numbers: 2 }],
  },
]

export const EQUIPMENT_OTHERS = {
  id: 'others',
  label: 'Others',
  items: [
    { title: 'Diesel Tankers', count: 15, unit: 'No’s', image: { src: '/images/site/diesel-tankers.webp', alt: 'Diesel tankers' } },
    { title: 'Water Sprinklers', count: 20, unit: 'No’s', image: { src: '/images/site/water-sprinklers.webp', alt: 'Water sprinklers' } },
    { title: 'Supporting Vehicles', count: 98, unit: 'No’s', image: { src: '/images/site/supporting-vehicles.webp', alt: 'Supporting vehicles' } },
  ],
} as const

// TODO(client): the site copy says "over 400 equipment" while the tables sum differently. Confirm the headline count before animating it anywhere beyond the About/Expertise copy.
