import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';

export interface ButtonDropItem {
  label: string;
  icon?: string;
  command?: () => void;
}

export interface ButtonDropProps {
  label: string;
  items?: ButtonDropItem[];
  variant?: 'standard' | 'outline';
  icon?: string;
  disabled?: boolean;
  onAction?: (action: string) => void;
  'data-semantic-node-id'?: string;
  'data-semantic-role'?: string;
  'data-semantic-widget-type'?: string;
  'data-semantic-feature-id'?: string;
}

export const ButtonDrop: React.FC<ButtonDropProps> = ({
  label,
  items = [],
  variant = 'standard',
  icon,
  disabled = false,
  onAction,
  ...semanticAttrs
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = (item: ButtonDropItem) => {
    setOpen(false);
    item.command?.();
    onAction?.(item.label);
  };

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-block' }}
      {...semanticAttrs}
    >
      <Button
        label={label}
        icon={icon || (items.length > 0 ? 'pi pi-chevron-down' : undefined)}
        iconPos="right"
        disabled={disabled}
        className={variant === 'outline' ? 'p-button-outlined' : ''}
        onClick={() => items.length > 0 && setOpen(!open)}
        data-semantic-node-id={semanticAttrs['data-semantic-node-id']}
        data-semantic-role={semanticAttrs['data-semantic-role']}
      />

      {open && items.length > 0 && (
        <div
          data-semantic-node-id={semanticAttrs['data-semantic-node-id'] ? `${semanticAttrs['data-semantic-node-id']}.dropdown` : undefined}
          data-semantic-role="toolbar"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            minWidth: '180px',
            background: 'var(--drawer-background-default, #fff)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 1100,
            overflow: 'hidden',
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--drawer-text-default, #333)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover, #f3f4f6)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {item.icon && <i className={item.icon} style={{ fontSize: '1rem' }} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
