import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LazyMotion, MotionConfig } from 'motion/react'
import { ROUTES } from './routes'
import { AppStateContext } from '@/lib/appState'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Grain } from '@/components/motion/Grain'
import { Cursor } from '@/components/motion/Cursor'
import { PageTransition } from '@/components/motion/PageTransition'
import { Preloader } from '@/components/motion/Preloader'
import { hasWebGL } from '@/lib/webgl'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RouteLoader } from '@/components/motion/RouteLoader'
import { BackToTop } from '@/components/motion/BackToTop'
import { shouldPreload } from '@/lib/preload'

const loadMotionFeatures = () => import('@/lib/motionFeatures').then((mod) => mod.domMax)

const HeroDev = lazy(() => import('@/pages/HeroDev'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function Site() {
  const location = useLocation()
  const [started, setStarted] = useState(() => !shouldPreload())
  // The preloader stays mounted through its curtain; `started` flips as the curtain begins to open.
  const [preloading, setPreloading] = useState(() => shouldPreload())
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()
  // Home on desktop: the loader is a HUD over the live 3D world instead of an opaque curtain.
  const hudLoader = location.pathname === '/' && desktop && !reduced && hasWebGL()
  return (
    <AppStateContext.Provider value={{ started }}>
      {preloading && <Preloader pathname={location.pathname} variant={hudLoader ? 'hud' : 'curtain'} onReveal={() => setStarted(true)} onDone={() => { setStarted(true); setPreloading(false) }} />}
      <Grain />
      <Cursor />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-amber focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      {/* Hidden while the HUD loader runs so the game-style intro owns the screen. */}
      <div className={`transition-opacity duration-slow ${hudLoader && !started ? 'pointer-events-none opacity-0' : 'opacity-100'}`}><Header /></div>
      <PageTransition>
        {(display) => (
          <main id="main" tabIndex={-1} className="outline-none">
            <Suspense fallback={<RouteLoader />}>
              <Routes location={display}>
                {ROUTES.map((r) => (
                  <Route key={r.path} path={r.path} element={<r.element />} />
                ))}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        )}
      </PageTransition>
      <Footer />
      <BackToTop />
    </AppStateContext.Provider>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      {/* Motion features (drag, layout) load after first paint; `strict` guards against the full `motion` import. */}
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <Routes>
              <Route path="/hero-dev" element={<Suspense fallback={null}><HeroDev /></Suspense>} />
              <Route path="*" element={<Site />} />
            </Routes>
          </BrowserRouter>
        </MotionConfig>
      </LazyMotion>
    </HelmetProvider>
  )
}
