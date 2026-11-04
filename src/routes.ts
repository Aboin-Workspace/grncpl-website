import { lazy, type LazyExoticComponent, type ComponentType } from 'react'

const L = (f: () => Promise<{ default: ComponentType }>) => lazy(f)

export interface RouteDef { path: string; element: LazyExoticComponent<ComponentType> }

/** One route per page, slugs identical to the old site. */
export const ROUTES: RouteDef[] = [
  { path: '/', element: L(() => import('@/pages/Home')) },
  { path: '/about-us/', element: L(() => import('@/pages/AboutUs')) },
  { path: '/management/', element: L(() => import('@/pages/Management')) },
  { path: '/founders-message/', element: L(() => import('@/pages/FoundersMessage')) },
  { path: '/certifications/', element: L(() => import('@/pages/Certifications')) },
  { path: '/construction-brilliance/', element: L(() => import('@/pages/ConstructionBrilliance')) },
  { path: '/our-expertise/', element: L(() => import('@/pages/OurExpertise')) },
  { path: '/infrastructure/', element: L(() => import('@/pages/Infrastructure')) },
  { path: '/strengths-and-experience/', element: L(() => import('@/pages/StrengthsAndExperience')) },
  { path: '/hse-practices/', element: L(() => import('@/pages/HsePractices')) },
  { path: '/completed-projects/', element: L(() => import('@/pages/CompletedProjects')) },
  { path: '/current-projects/', element: L(() => import('@/pages/CurrentProjects')) },
  { path: '/equipments/', element: L(() => import('@/pages/Equipments')) },
  { path: '/csr/', element: L(() => import('@/pages/Csr')) },
  { path: '/svastha-health/', element: L(() => import('@/pages/Csr')) },
  { path: '/vidyadhanam-education/', element: L(() => import('@/pages/Csr')) },
  { path: '/jal-jeevan-drinking-water/', element: L(() => import('@/pages/Csr')) },
  { path: '/annadhana-food-donation/', element: L(() => import('@/pages/Csr')) },
  { path: '/paryavarana-environment/', element: L(() => import('@/pages/Csr')) },
  { path: '/aadhaar-community-development/', element: L(() => import('@/pages/Csr')) },
  { path: '/photo-gallery/', element: L(() => import('@/pages/PhotoGallery')) },
  { path: '/careers/', element: L(() => import('@/pages/Careers')) },
  { path: '/contact-us/', element: L(() => import('@/pages/ContactUs')) },
]
