import { Link } from 'react-router-dom'
import { FOOTER_QUICK_LINKS, SITE } from '@/data/nav'
import { FOOTER_CONTACT } from '@/data/contact'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { StrataDivider } from '@/components/motion/StrataDivider'

const Social = ({ label }: { label: string }) => {
  const paths: Record<string, string> = {
    Facebook: 'M14 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H11v8H8v-8H6v-3h2V8.5A3.5 3.5 0 0 1 11.5 5H14z',
    Twitter: 'M22 5.8c-.7.3-1.5.5-2.3.6a4 4 0 0 0 1.7-2.2c-.8.5-1.6.8-2.5 1A4 4 0 0 0 12 8.9 11.3 11.3 0 0 1 3.4 4.6a4 4 0 0 0 1.2 5.3c-.6 0-1.3-.2-1.8-.5a4 4 0 0 0 3.2 3.9c-.6.2-1.2.2-1.8.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 17.9 11.3 11.3 0 0 0 8.1 19.7c7.4 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.3 2-2.1z',
    Instagram: 'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 7.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8zM17.3 7.3a1 1 0 1 1-2.1 0 1 1 0 0 1 2.1 0zM8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 1.7A3.3 3.3 0 0 0 4.7 8v8A3.3 3.3 0 0 0 8 19.3h8a3.3 3.3 0 0 0 3.3-3.3V8A3.3 3.3 0 0 0 16 4.7z',
    Youtube: 'M22.5 7.2a2.8 2.8 0 0 0-2-2C18.8 4.8 12 4.8 12 4.8s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.5 4.8a2.8 2.8 0 0 0 2 2c1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2c.5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8zM9.8 15.1V8.9l5.7 3.1z',
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[label]} />
    </svg>
  )
}

export function Footer() {
  const C = FOOTER_CONTACT
  return (
    <footer className="relative overflow-hidden bg-ink" aria-labelledby="footer-heading">
      <StrataDivider lines={5} seed={23} amber />
      <div className="mx-auto max-w-[1440px] px-gutter pb-10 pt-section-y">
        <Link to="/contact-us/" className="group block" data-cursor="Open">
          <SplitText
            as="p"
            text={C.bigLine}
            className="footer-line font-display text-[clamp(3.2rem,12vw,13rem)] uppercase leading-[0.9] tracking-[0.01em] text-outline transition-colors duration-base group-hover:text-amber"
          />
        </Link>

        <div className="mt-16 grid gap-12 border-t border-steel/60 pt-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <img src={SITE.logo} alt={SITE.title} width={179} height={70} className="h-10 w-auto" loading="lazy" />
            <h2 id="footer-heading" className="mt-6 font-body text-eyebrow uppercase text-amber">About Us</h2>
            <p className="mt-3 max-w-measure-narrow font-body text-sm leading-relaxed text-bone/70">{C.about}</p>
            <ul className="mt-6 flex gap-3" aria-label="Social">
              {C.social.map((s) => (
                <li key={s.label}>
                  {/* TODO(client): replace '#' with the real profile URL */}
                  <a href={s.href} aria-label={s.label} className="grid h-10 w-10 place-items-center border border-steel text-bone/70 transition-colors duration-fast hover:border-amber hover:text-amber">
                    <Social label={s.label} />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="nav" className="lg:col-span-3" aria-labelledby="footer-quick-links">
            <h2 id="footer-quick-links" className="font-body text-eyebrow uppercase text-amber">Quick Links</h2>
            <ul className="mt-4 space-y-2">
              {FOOTER_QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="font-body text-sm text-bone/75 transition-colors duration-fast hover:text-amber">{l.label}</Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="lg:col-span-3">
            <h2 className="font-body text-eyebrow uppercase text-amber">{C.contactInformation.heading}</h2>
            <address className="mt-4 font-body text-sm not-italic leading-relaxed text-bone/75">
              <p>{C.contactInformation.address}</p>
              <p className="mt-3">Email: <a href={`mailto:${C.contactInformation.email}`} className="hover:text-amber">{C.contactInformation.email}</a></p>
              <p>Phone: <a href={C.contactInformation.phoneHref} className="hover:text-amber">{C.contactInformation.phone}</a></p>
            </address>
          </Reveal>

          <Reveal className="lg:col-span-2">
            <h2 className="font-body text-eyebrow uppercase text-amber">{C.regdOffice.heading}</h2>
            <address className="mt-4 font-body text-sm not-italic leading-relaxed text-bone/75">
              <p>{C.regdOffice.address}</p>
              <p className="mt-3">Phone: <a href={C.regdOffice.phoneHref} className="hover:text-amber">{C.regdOffice.phone}</a></p>
            </address>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-steel/60 pt-6 font-body text-xs text-bone/50 md:flex-row md:items-center md:justify-between">
          <p>{C.copyright}</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left uppercase tracking-[0.2em] text-bone/60 transition-colors duration-fast hover:text-amber md:text-right">
            Scroll to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
