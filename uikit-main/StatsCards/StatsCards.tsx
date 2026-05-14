import React, { ReactNode } from 'react';

export interface MetricItem {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
}

export interface StatsCardsProps {
  metrics?: MetricItem[];
  density?: 'compact' | 'standard' | 'analytics';
  showTrend?: boolean;
  drillTargets?: boolean;
  onDrill?: (metric: MetricItem) => void;
  'data-semantic-node-id'?: string;
  'data-semantic-role'?: string;
  'data-semantic-widget-type'?: string;
  'data-semantic-feature-id'?: string;
}

const trendIcons: Record<string, string> = {
  up: '\u25B2',
  down: '\u25BC',
  neutral: '\u25C6',
};

const trendColors: Record<string, string> = {
  up: 'var(--green-500, #22c55e)',
  down: 'var(--red-500, #ef4444)',
  neutral: 'var(--cool-gray-500, #6b7280)',
};

export const StatsCards: React.FC<StatsCardsProps> = ({
  metrics = [],
  density = 'standard',
  showTrend = true,
  drillTargets = false,
  onDrill,
  ...semanticAttrs
}) => {
  const gap = density === 'compact' ? '12px' : '16px';
  const padding = density === 'compact' ? '12px 16px' : '16px 24px';

  return (
    <div
      {...semanticAttrs}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${density === 'compact' ? '180px' : '220px'}, 1fr))`,
        gap,
      }}
    >
      {metrics.map((metric, i) => (
        <div
          key={i}
          data-semantic-node-id={semanticAttrs['data-semantic-node-id'] ? `${semanticAttrs['data-semantic-node-id']}.metrics` : undefined}
          data-semantic-role="metric_summary"
          onClick={() => drillTargets && onDrill?.(metric)}
          style={{
            padding,
            borderRadius: '12px',
            background: 'var(--drawer-background-default, #fff)',
            border: '1px solid var(--surface-border, #e5e7eb)',
            cursor: drillTargets ? 'pointer' : 'default',
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={(e) => drillTargets && (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
          onMouseLeave={(e) => drillTargets && (e.currentTarget.style.boxShadow = 'none')}
        >
          <div
            data-semantic-node-id={semanticAttrs['data-semantic-node-id'] ? `${semanticAttrs['data-semantic-node-id']}.trends` : undefined}
            data-semantic-role="data_display"
            style={{
              fontSize: density === 'compact' ? '0.75rem' : '0.8125rem',
              color: 'var(--cool-gray-500, #6b7280)',
              marginBottom: '4px',
              fontWeight: 500,
            }}
          >
            {metric.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontSize: density === 'analytics' ? '1.75rem' : density === 'compact' ? '1.25rem' : '1.5rem',
                fontWeight: 700,
                color: 'var(--drawer-text-default, #333)',
              }}
            >
              {metric.value}
            </span>
            {showTrend && metric.trend && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: trendColors[metric.trend],
                  fontWeight: 600,
                }}
              >
                {trendIcons[metric.trend]} {metric.trendValue}
              </span>
            )}
          </div>
          {metric.description && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--cool-gray-400, #9ca3af)',
                marginTop: '4px',
              }}
            >
              {metric.description}
            </div>
          )}
          {drillTargets && (
            <div
              data-semantic-node-id={semanticAttrs['data-semantic-node-id'] ? `${semanticAttrs['data-semantic-node-id']}.drill_targets` : undefined}
              data-semantic-role="secondary_controls"
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary-color, #3b82f6)',
                marginTop: '8px',
                fontWeight: 500,
              }}
            >
              View details &rarr;
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
