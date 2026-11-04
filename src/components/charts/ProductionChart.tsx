import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PRODUCTION, PRODUCTION_SERIES } from '@/data/projects'
import { CHART } from '@/config/motion'
import { token } from '@/lib/theme'

interface Props { animate: boolean }

const TooltipBox = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-steel bg-coal/95 p-3 font-body text-sm text-bone shadow-amber-glow">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-1 flex items-center gap-2 tabular-nums">
          <span className="inline-block h-2 w-2" style={{ background: p.color }} aria-hidden="true" />
          {p.name}: {p.value.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

/**
 * Coal/Ore vs Over Burden, 2019-20 → 2025-26 Estd. Recharts animates bars from
 * the baseline and draws the line via stroke-dash on mount, so the chart is
 * mounted only once it scrolls into view (see CompletedProjects).
 */
export default function ProductionChart({ animate }: Props) {
  const c = { bone: token('bone'), steel: token('steel'), amber: token('amber'), safety: token('safety'), muted: 'rgb(var(--c-bone) / 0.6)' }
  return (
    <div className="h-[380px] w-full md:h-[460px]" role="img" aria-label="Bar chart of coal/ore in million tons and over burden in million BCM per year from 2019-20 to 2025-26 estimated">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={PRODUCTION} margin={{ top: 16, right: 8, left: -8, bottom: 0 }} barGap={4}>
          <CartesianGrid stroke={c.steel} vertical={false} />
          <XAxis dataKey="year" tick={{ fill: c.bone, fontSize: 12, fontFamily: 'Manrope Variable' }} axisLine={{ stroke: c.steel }} tickLine={false} />
          <YAxis tick={{ fill: c.muted, fontSize: 12, fontFamily: 'Manrope Variable' }} axisLine={false} tickLine={false} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: 'rgb(var(--c-amber) / 0.08)' }} />
          <Legend wrapperStyle={{ fontFamily: 'Manrope Variable', fontSize: 12, color: c.bone, paddingTop: 12 }} />
          <Bar dataKey="coal" name={PRODUCTION_SERIES.coal} fill={c.bone} fillOpacity={0.85} isAnimationActive={animate} animationDuration={CHART.barDuration} animationEasing="ease-out" />
          <Bar dataKey="ob" name={PRODUCTION_SERIES.ob} fill={c.amber} isAnimationActive={animate} animationBegin={CHART.barStagger * 3} animationDuration={CHART.barDuration} animationEasing="ease-out" />
          <Line type="monotone" dataKey="ob" name="Over Burden trend" stroke={c.safety} strokeWidth={2} dot={{ r: 3, fill: c.safety, strokeWidth: 0 }} isAnimationActive={animate} animationBegin={CHART.lineDelay} animationDuration={CHART.lineDuration} legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
