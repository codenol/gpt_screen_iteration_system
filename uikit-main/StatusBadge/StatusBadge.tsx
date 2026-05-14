/**
 * Цветной бейдж со статусом
 *
 * @module StatusBadge
 */
import React, { ReactNode } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import cl from 'classnames';

import './statusBadge.scss';

export interface StatusBadgeProps {
    /**
     * Код статуса для определения цвета бейджа
     */
    code: string;
    /**
     * Статус для отображения
     */
    name: ReactNode;
    /**
     * Флаг состояния обновления
     */
    isUpdating?: boolean;
    /**
     * CSS-класс.
     */
    className?: string;
    /**
     * Отключает отображение имени в бейдже
     */
    isSmall?: boolean;
    /**
     * Айдишник для тестирования
     */
    testid?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ code, name, className, isSmall, isUpdating, testid }) => {
    // Функция для получения класса бейджа по коду статуса
    const getStatusStyle = (status) => {
        const style = {
            SELECTED: ['status-badge--in-process'],
            PROCESSING: ['status-badge--in-process', 'status-badge--animate'],
            DONE: ['status-badge--ok'],
            corrupt: ['status-badge--critical'],
            /* new object states */
            ok: ['status-badge--ok'],
            OK: ['status-badge--ok'],
            SUCCESS: ['status-badge--ok'],
            mumble: ['status-badge--warning'],
            Warning: ['status-badge--warning'],
            Critical: ['status-badge--critical'],
            FAILED: ['status-badge--critical'],
            Down: ['status-badge--down'],
            'N/A': ['status-badge--not-available'],
            InProcess: ['status-badge--in-process', 'status-badge--animate'],
            New: ['status-badge--new'],
            NEW: ['status-badge--new'],
            new: ['status-badge--in-process'],
            change: ['status-badge--warning'],
            delete: ['status-badge--critical'],
        };
        return style[status];
    };

    return isUpdating ? (
        <>
            <span className={cl('status-badge', className)} data-testid={testid}>
                <Tooltip target=".custom-target-icon" />
                <ProgressSpinner
                    className="custom-target-icon"
                    style={{ width: '20px', height: '20px' }}
                    strokeWidth="8"
                    animationDuration="2s"
                    data-pr-tooltip="Выполняется операция"
                />
            </span>
        </>
    ) : (
        <span
            className={cl(
                'status-badge',
                isSmall ? 'status-badge--small' : ' smooth-corners',
                getStatusStyle(code),
                className
            )}
            data-testid={testid}
        >
            {isSmall ? null : name}
        </span>
    );
};
