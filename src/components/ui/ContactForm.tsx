import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, m } from 'motion/react'
import { CONTACT, OFFICES } from '@/data/contact'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Please enter a valid phone number'),
  message: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters)'),
})
type Values = z.infer<typeof schema>

const field = 'w-full border-b border-steel bg-transparent px-0 py-3 font-body text-base text-bone placeholder:text-bone/55 focus:border-amber focus:outline-none'

export function ContactForm() {
  const F = CONTACT.form
  const reduced = useReducedMotion()
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onBlur' })

  // Netlify Forms: the static copy of this form in index.html registers it at build time;
  // submissions POST url-encoded to the site root and show up under Forms → "contact" in Netlify.
  const onSubmit = async (values: Values) => {
    setFailed(false)
    const body = new URLSearchParams({ 'form-name': 'contact', ...values }).toString()
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      if (!res.ok) throw new Error(String(res.status))
      setSent(true)
    } catch {
      setFailed(true)
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {sent ? (
          <m.div key="ok" initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }} role="status" className="border border-amber/60 p-8">
            <m.svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" className="text-amber" strokeWidth="2" aria-hidden="true">
              <m.circle cx="24" cy="24" r="22" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 0.8, ease: 'easeOut' }} />
              <m.path d="M14 25l7 7 13-14" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: reduced ? 0 : 0.5, duration: reduced ? 0 : 0.5, ease: 'easeOut' }} />
            </m.svg>
            <h3 className="mt-6 font-display text-display-sm uppercase text-bone">{F.success.title}</h3>
            <p className="mt-2 font-body text-bone/75">{F.success.body}</p>
          </m.div>
        ) : (
          <m.form key="form" name="contact" method="POST" data-netlify="true" netlify-honeypot="company" exit={{ opacity: 0 }} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <input type="hidden" name="form-name" value="contact" />
            <p className="hidden" aria-hidden="true"><label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label></p>
            {(['name', 'email', 'phone'] as const).map((k) => (
              <div key={k}>
                <label htmlFor={`cf-${k}`} className="font-body text-eyebrow uppercase text-bone/60">{F.fields[k]}</label>
                <input
                  id={`cf-${k}`}
                  type={k === 'email' ? 'email' : k === 'phone' ? 'tel' : 'text'}
                  autoComplete={k === 'name' ? 'name' : k === 'email' ? 'email' : 'tel'}
                  className={field}
                  aria-invalid={!!errors[k]}
                  aria-describedby={errors[k] ? `cf-${k}-err` : undefined}
                  {...register(k)}
                />
                {errors[k] && <p id={`cf-${k}-err`} className="mt-1 font-body text-sm text-safety">{errors[k]?.message}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="cf-message" className="font-body text-eyebrow uppercase text-bone/60">{F.fields.message}</label>
              <textarea id="cf-message" rows={5} className={field} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-err' : undefined} {...register('message')} />
              {errors.message && <p id="cf-message-err" className="mt-1 font-body text-sm text-safety">{errors.message.message}</p>}
            </div>
            <MagneticButton type="submit" disabled={isSubmitting} className="btn-sweep bg-amber px-8 py-4 font-body text-sm font-bold uppercase tracking-[0.18em] text-ink disabled:opacity-60">
              {isSubmitting ? 'Sending…' : F.submit}
            </MagneticButton>
            {failed && (
              <p role="alert" className="font-body text-sm text-safety">
                {F.error} <a href={`mailto:${OFFICES[0].email}`} className="underline">{OFFICES[0].email}</a>
              </p>
            )}
          </m.form>
        )}
      </AnimatePresence>
    </div>
  )
}
