/**
 * Контекст для глобального управления всплывающими уведомлениями.
 * Позволяет вызывать `showToast` из любого компонента без пропсов.
 *
 * @module ToastContext
 */
import { createContext, ReactNode } from 'react';
import { ToastMessage } from 'primereact/toast';


export interface IToastMessageExt extends ToastMessage {
    /**
     * Отображение иконки рядом с Title
     * @default false
     */
    titleWithIcon?: boolean;
    /**
     * Заменяет стандартную иконку при severity = undefined. В остальных состояниях severity нельзя заменить icon.
     * @default icon(scan-face)
     */
    titleIcon?: ReactNode;
    /**
     * Добавить кнопку под блок текста detail
     */
    button?: {
        /**
         * Текст добавленной кнопки
         */
        label: string;
        /**
         * функция onClick для добавленной кнопки
         */
        onClick: () => void;
    };
}

export type IToast = {
    /**
     * Показывает уведомление.
     *
     * @param data - объект с параметрами уведомления (summary, detail, severity и т.д.)
     */
    showToast: (data: IToastMessageExt) => void;
    /**
     * Список активных уведомлений.
     */
    toasts: ToastMessage[];
    /**
     * Удаляет уведомление по ID.
     *
     * @param id - ID уведомления
     */
    onRemoveToastById: (id: string) => void;
    /**
     * Очищает все уведомления.
     */
    clearAllToasts: () => void;
};

/**
 * Глобальный контекст для работы с уведомлениями.
 */
export const ToastContext = createContext<IToast>({
    showToast: () => console.log('no context'),
    toasts: [{ id: 'no context' }],
    onRemoveToastById: () => console.log('no context'),
    clearAllToasts: () => console.log('no context'),
});
