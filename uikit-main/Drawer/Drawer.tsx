import React, { ReactNode, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';

export interface DrawerProps {
  title?: ReactNode;
  content?: ReactNode;
  actions?: ReactNode;
  width?: string;
  visible?: boolean;
  onClose?: () => void;
  onAction?: (action: string) => void;
  'data-semantic-node-id'?: string;
  'data-semantic-role'?: string;
  'data-semantic-widget-type'?: string;
  'data-semantic-feature-id'?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  title,
  content,
  actions,
  width = '480px',
  visible = false,
  onClose,
  onAction,
  ...semanticAttrs
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible && onClose) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <>
      <div
        ref={overlayRef}
        className="drawer-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
        }}
      />
      <div
        className="drawer-panel"
        {...semanticAttrs}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width,
          height: '100vh',
          zIndex: 1001,
          background: 'var(--drawer-background-default, #fff)',
          color: 'var(--drawer-text-default, #333)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        <div
          data-semantic-node-id={semanticAttrs['data-semantic-node-id'] ? `${semanticAttrs['data-semantic-node-id']}.header` : undefined}
          data-semantic-role="details_overlay"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--surface-border, #e5e7eb)',
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{title}</h2>
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-rounded"
            onClick={onClose}
            aria-label="Close drawer"
          />
        </div>

        <div
          data-semantic-node-id={semanticAttrs['data-semantic-node-id'] ? `${semanticAttrs['data-semantic-node-id']}.content` : undefined}
          data-semantic-role="details_overlay"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
          }}
        >
          {content}
        </div>

        {actions && (
          <div
            data-semantic-node-id={semanticAttrs['data-semantic-node-id'] ? `${semanticAttrs['data-semantic-node-id']}.actions` : undefined}
            data-semantic-role="toolbar"
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              padding: '16px 24px',
              borderTop: '1px solid var(--surface-border, #e5e7eb)',
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </>
  );
};
