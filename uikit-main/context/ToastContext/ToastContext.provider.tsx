/**
 * Кастомные уведомления на основе PrimeReact
 *
 * @module ToastProvider
 */
import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ToastContent } from 'uikit/ToastContent';
import { IconScanFace, IconX } from 'uikit/IconsComponent';
import { IToastMessageExt, ToastContext } from './ToastContext';

/**
 * Стандартные параметры уведомления.
 * Будут применены, если не переопределены при вызове `showToast`.
 */
const defaultDataToast: Pick<IToastMessageExt, 'life' | 'sticky' | 'titleWithIcon' | 'titleIcon' | 'closeIcon'> = {
    life: 3000,
    sticky: false,
    titleWithIcon: false,
    closeIcon: (
        <Button severity="secondary" className="icon-action">
            <IconX />
        </Button>
    ),
    titleIcon: <IconScanFace width="16" height="16" className="toast-content-header-icon" />,
};
/**
 * Провайдер контекста уведомлений.
 * Обеспечивает централизованное управление toast-сообщениями.
 *
 * @component
 * @param {React.ReactNode} children - дочерние компоненты, которым доступен контекст.
 */
export const ToastProvider: React.FC<any> = ({ children }) => {
    // Ссылка на компонент Toast из PrimeReact
    const toastRef = useRef<any>(null);
    // Локальное состояние для хранения списка активных уведомлений
    const [toasts, setToasts] = useState<IToastMessageExt[]>([]);
    /**
     * Показывает уведомление.
     *
     * @param {IToastMessageExt} data - параметры уведомления
     */
    const showToast = (data: IToastMessageExt) => {
        const getId = data.id || Date.now().toString();
        const newToast = { ...defaultDataToast, ...data, id: getId };
        const toastWithContent = {
            ...newToast,
            content: <ToastContent toast={newToast} />,
        };

        toastRef.current.show(toastWithContent);

        if (!toasts.find((item) => item.id === getId)) {
            setToasts((prevData) => [...prevData, toastWithContent]);
        } else {
            setToasts((prevData) => [
                ...prevData.map((item) => (item.id === getId ? { ...item, life: data.life } : item)),
            ]);
        }
    };

    /**
     * Очищает все уведомления.
     */
    const clearAllToasts = () => {
        toastRef.current.clear();
        setToasts([]);
    };

    /**
     * Удаляет уведомление по ID.
     *
     * @param {string} id - ID уведомления которое нужно удалить.
     */
    const onRemoveToastById = (id: string) => {
        if (toasts.filter((item) => item.id === id).length > 0) {
            setToasts((prevData) => {
                const editData = [...prevData.filter((item) => item.id !== id)];
                if (prevData.length !== editData.length) toastRef.current.remove(id);
                return editData;
            });
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, toasts, clearAllToasts, onRemoveToastById }}>
            <Toast ref={toastRef} onRemove={(toast: IToastMessageExt) => toast?.id && onRemoveToastById(toast.id)} />
            {children}
        </ToastContext.Provider>
    );
};
