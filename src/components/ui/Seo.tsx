import { Helmet } from 'react-helmet-async'
import { SITE } from '@/data/nav'
import { ORGANIZATION_JSON_LD, LOCAL_BUSINESS_JSON_LD, SEO, SEO_404 } from '@/data/seo'

interface Props {
  /** Exact slug, e.g. '/about-us/'. Use '404' for the not-found page. */
  path: string
  image?: string
  localBusiness?: boolean
}

export function Seo({ path, image = SITE.logoRemote, localBusiness = false }: Props) {
  const meta = path === '404' ? SEO_404 : SEO[path] ?? SEO['/']
  const canonical = `${SITE.baseUrl}${path === '404' ? '' : path}`
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.title} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />
      {path === '404' && <meta name="robots" content="noindex" />}
      <script type="application/ld+json">{JSON.stringify(ORGANIZATION_JSON_LD)}</script>
      {localBusiness && <script type="application/ld+json">{JSON.stringify(LOCAL_BUSINESS_JSON_LD)}</script>}
    </Helmet>
  )
}
