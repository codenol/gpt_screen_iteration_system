import React, { Fragment } from 'react';
import { Button } from 'primereact/button';
import { IToastMessageExt } from 'uikit/context/ToastContext/ToastContext';
import { IconAlertTriangle, IconCheckCircle2, IconInfo, IconXCircle } from 'uikit/IconsComponent';

const TOAST_CONFIG = {
    error: { icon: <IconXCircle className="toast-content-header-icon" width="16" height="16" />, style: 'danger' },
    warn: {
        icon: <IconAlertTriangle className="toast-content-header-icon" width="16" height="16" />,
        style: 'warning',
    },
    info: { icon: <IconInfo className="toast-content-header-icon" width="16" height="16" />, style: 'info' },
    success: {
        icon: <IconCheckCircle2 className="toast-content-header-icon" width="16" height="16" />,
        style: 'success',
    },
} as const;

interface IToastContentProps {
    toast: IToastMessageExt;
}

export const ToastContent = ({ toast }: IToastContentProps) => {
    const base = 'toast-content';

    return (
        <div className={base}>
            <div className={`${base}-header`}>
                {toast?.titleWithIcon ? (
                    toast?.severity ? (
                        TOAST_CONFIG[toast.severity].icon
                    ) : (
                        toast.titleIcon
                    )
                ) : (
                    <Fragment />
                )}
                <span className={`${base}-header-title toast-text-base`}>{toast?.summary}</span>
            </div>
            {toast?.detail && <div className={`${base}-detail toast-text-base`}>{toast?.detail}</div>}
            {toast?.button && (
                <Button
                    className={`${base}-button`}
                    severity={TOAST_CONFIG[toast.severity ? toast.severity : 'info'].style}
                    onClick={() => toast.button?.onClick()}
                >
                    {toast.button.label}
                </Button>
            )}
        </div>
    );
};
