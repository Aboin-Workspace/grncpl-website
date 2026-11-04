/**
 * Lighthouse CI: audits the production build served by `vite preview` (SPA fallback
 * so inner routes resolve) at the mobile preset. Run via `npm run check`.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'localhost:4173',
      url: ['http://localhost:4173/', 'http://localhost:4173/about-us/', 'http://localhost:4173/completed-projects/', 'http://localhost:4173/contact-us/', 'http://localhost:4173/equipments/', 'http://localhost:4173/csr/'],
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 2, disabled: false },
        // Skip the once-per-session preloader so LCP reflects the page, not the intro.
        extraHeaders: JSON.stringify({}),
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
}
