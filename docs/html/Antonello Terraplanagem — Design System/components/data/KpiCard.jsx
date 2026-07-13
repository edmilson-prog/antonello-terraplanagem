import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconTile } from '../surfaces/IconTile.jsx';
import { Sparkline } from './Sparkline.jsx';

/**
 * KpiCard — a headline metric tile: uppercase label, big value (optionally mono),
 * amber icon in the corner, a footnote (with optional trend), and an optional sparkline.
 */
export function KpiCard({ label, value, unit, icon, mono = false, trend, foot, spark, warn = false, className = '', ...rest }) {
  const ic = typeof icon === 'string' ? <Icon name={icon} size={17} /> : icon;
  return (
    <div className={['atp-kpi', warn ? 'atp-kpi--warn' : '', className].filter(Boolean).join(' ')} {...rest}>
      <div className="atp-kpi__top">
        <span className="atp-kpi__label">{label}</span>
        <IconTile size="md" tone="amber" className="atp-kpi__ic">{ic}</IconTile>
      </div>
      <div className={mono ? 'atp-kpi__val atp-kpi__val--mono' : 'atp-kpi__val'}>
        {value}
        {unit != null && <span className="atp-kpi__u">{unit}</span>}
      </div>
      <div className="atp-kpi__foot">
        {trend && (
          <span className={`atp-trend atp-trend--${trend.dir}`}>
            <Icon name="arrow-up-right" size={13} style={trend.dir === 'down' ? { transform: 'rotate(90deg)' } : undefined} />
            {trend.value}
          </span>
        )}
        {foot}
      </div>
      {spark != null && (Array.isArray(spark)
        ? <Sparkline points={spark} className="atp-kpi__spark" />
        : <span className="atp-kpi__spark">{spark}</span>)}
    </div>
  );
}
