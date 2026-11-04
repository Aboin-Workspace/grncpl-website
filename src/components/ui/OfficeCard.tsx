import type { Office } from '@/data/contact'

export function OfficeCard({ office }: { office: Office }) {
  return (
    <article className="border border-steel/70 bg-coal p-6 md:p-8">
      <h2 className="font-display text-display-sm uppercase text-bone">{office.name}</h2>
      <address className="mt-4 space-y-2 font-body text-base not-italic leading-relaxed text-bone/80">
        <p>{office.address}</p>
        <p>Email: <a href={`mailto:${office.email}`} className="text-amber hover:text-safety">{office.email}</a></p>
        <p>Phone: <a href={office.phoneHref} className="text-amber hover:text-safety">{office.phone}</a></p>
      </address>
    </article>
  )
}
