export type Client = 'WCL' | 'SCCL' | 'NMDC' | 'Other'

export interface CompletedProject {
  sno: number
  name: string
  from: string // dd-mm-yyyy as on the old site
  to: string
  quantity: number // OB/Coal Qty in Million Cum
  client: Client
}

export const COMPLETED_PROJECTS_TITLE = 'Completed Projects'
export const COMPLETED_PROJECTS_COLUMNS = {
  sno: 'S.No',
  name: 'Name of Work / Location',
  from: 'Duration From',
  to: 'Duration To',
  quantity: 'OB/Coal Qty in Million Cum',
} as const

export const COMPLETED_PROJECTS: CompletedProject[] = [
  { sno: 1, name: 'Durgapur OC Mine of Chandrapur Area, (WCL)', from: '06-10-2006', to: '07-11-2008', quantity: 10.82, client: 'WCL' },
  { sno: 2, name: 'Sasti OC Mine of Ballarpur Area, (WCL)', from: '26-05-2007', to: '27-06-2008', quantity: 7.2, client: 'WCL' },
  { sno: 3, name: 'Naigaon OCM Mine of Wani Area, (WCL)', from: '05-06-2007', to: '09-05-2008', quantity: 2.86, client: 'WCL' },
  { sno: 4, name: 'RG OC -I at Ramagundam-III Area, (SCCL)', from: '23-10-2008', to: '05-07-2009', quantity: 6.88, client: 'SCCL' },
  { sno: 5, name: 'Block-E, JK OCP of Yellandu Area, (SCCL)', from: '14-02-2009', to: '27-04-2010', quantity: 7.64, client: 'SCCL' },
  { sno: 6, name: 'RG OC-II of Ramagundam-III Area, (SCCL)', from: '01-10-2009', to: '23-03-2012', quantity: 34.23, client: 'SCCL' },
  { sno: 7, name: 'Block-B of KTK OC Sector-I, Bhupalpalli Area, (SCCL)', from: '05-05-2012', to: '13-05-2013', quantity: 5.76, client: 'SCCL' },
  { sno: 8, name: 'Junad OCM of Wani North Area, (WCL)', from: '17-04-2012', to: '01-04-2013', quantity: 6.49, client: 'WCL' },
  { sno: 9, name: 'Dhorwasa OCM of Majri Area, (WCL)', from: '31-10-2013', to: '20-06-2014', quantity: 3.45, client: 'WCL' },
  { sno: 10, name: 'JK-5 OCP of Yellandu Area, (SCCL)', from: '01-09-2013', to: '21-04-2015', quantity: 18.08, client: 'SCCL' },
  { sno: 11, name: 'Jallaramvagu Extension Stage-I for RG OC- III of RG-II Area, (SCCL)', from: '05-03-2015', to: '08-07-2015', quantity: 1.8, client: 'SCCL' },
  // TODO(client): row 12 looks corrupted on the old site (two names appear merged). Confirm the correct title.
  { sno: 12, name: 'Block-B of KTK OC SectorPolavaram Right Bank Canal From km 163.200 to 164.450;(I&CAD, Govt.of AP)', from: '01-08-2015', to: '15-04-2016', quantity: 2.19, client: 'Other' },
  { sno: 13, name: 'Bhatadi Expansion OCM of Chandrapur Area, (WCL)', from: '01-06-2016', to: '30-12-2017', quantity: 9.63, client: 'WCL' },
  { sno: 14, name: 'South Block of Donimalai Iron Ore Mine (NMDC, Karnataka)', from: '20-05-2016', to: '04-05-2018', quantity: 2.71, client: 'NMDC' },
  { sno: 15, name: 'BMMX Section of Donimalai Iron Ore Mine (NMDC, Karnataka)', from: '30-05-2016', to: '04-05-2018', quantity: 8.73, client: 'NMDC' },
  { sno: 16, name: 'KTK OCP, Sector -1 Mine of Bhoopalapalli Area (SCCL)', from: '18-06-2014', to: '28-02-2019', quantity: 59.12, client: 'SCCL' },
  { sno: 17, name: 'OB Removal of Koyagudem OC-II of Yellandu Area, Telangana (SCCL)', from: '01-06-2016', to: '09-02-2020', quantity: 39.97, client: 'SCCL' },
  { sno: 18, name: 'Extraction of Coal at Koyagudem OCP-II of Yellandu Area, Telangana (SCCL)', from: '01-10-2016', to: '06-10-2020', quantity: 6.01, client: 'SCCL' },
  { sno: 19, name: 'JVR OC-I Mine of Sathupalli, Kothagudem Area (SCCL)', from: '01-01-2018', to: '22-02-2020', quantity: 46.33, client: 'SCCL' },
  { sno: 20, name: 'Overburden and Re-Handling of Loose OB for 2" diversion of Vattivaagu at Khairagura Opencast Project, Bellampalli Area', from: '05-10-2022', to: '27-03-2023', quantity: 2.48, client: 'Other' },
  { sno: 21, name: 'Bhatadi OCM, Chandrapur Area of WCL', from: '05-03-2020', to: '11-01-2023', quantity: 26.77, client: 'WCL' },
  { sno: 22, name: 'Pauni II Expansion OCM of Ballarpur Area of WCL', from: '01-12-2019', to: '31-05-2024', quantity: 68.63, client: 'WCL' },
  { sno: 23, name: 'OB Removal work and deployment, operation and maintenance of Equipment at Parsa Coal Mine, Chhattisgarh', from: '11-02-2024', to: '31-08-2024', quantity: 2.65, client: 'Other' },
]

export const PROJECT_FILTERS: { label: string; value: Client | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'WCL', value: 'WCL' },
  { label: 'SCCL', value: 'SCCL' },
  { label: 'NMDC', value: 'NMDC' },
  { label: 'Other', value: 'Other' },
]

export interface ProductionYear {
  year: string
  coal: number // Coal/Ore in Million Tons
  ob: number // Over Burden in Million BCM
}

export const PRODUCTION_TITLE = 'Yearly production summary'
export const PRODUCTION_SERIES = { coal: 'Coal/Ore in Million Tons', ob: 'Over Burden in Million BCM' } as const
export const PRODUCTION: ProductionYear[] = [
  { year: '2019-20', coal: 6.92, ob: 23.32 },
  { year: '2020-21', coal: 3.8, ob: 37.97 },
  { year: '2021-22', coal: 3.76, ob: 50.25 },
  { year: '2022-23', coal: 4.38, ob: 44.74 },
  { year: '2023-24', coal: 2.42, ob: 37.15 },
  { year: '2024-25', coal: 1.21, ob: 50.58 },
  { year: '2025-26 Estd.', coal: 4.21, ob: 62.87 },
]
export const PRODUCTION_GRAND_TOTAL = { label: 'Grand Total', coal: 26.69, ob: 306.87 } as const

export interface CurrentProject {
  sno: number
  name: string
  quantity: number // Qty in Lakh BCM
  startYear: number
}
export const CURRENT_PROJECTS_TITLE = 'Current Projects'
export const CURRENT_PROJECTS_COLUMNS = { name: 'Name of Work / Location', quantity: 'Qty in Lakh BCM', startYear: 'Project Start Year' } as const
export const CURRENT_PROJECTS: CurrentProject[] = [
  { sno: 1, name: 'Khairagura Opencast Project, BPA Area of SCCL', quantity: 240.12, startYear: 2020 },
  { sno: 2, name: 'Niljai Expansion (Deep) OC Mine, Wani Area of WCL', quantity: 147.38, startYear: 2024 },
  { sno: 3, name: 'Mine Developer and Operator (MDO) for North Dhadu (Western Part) Coal Mine (3 MTPA) at Latehar District of Jharkhand State of NLCIL.', quantity: 692.92, startYear: 2025 },
]
