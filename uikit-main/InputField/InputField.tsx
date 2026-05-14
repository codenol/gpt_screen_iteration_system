/* eslint-disable react/react-in-jsx-scope */
import { forwardRef } from 'react';
import { InputText, InputTextProps } from 'primereact/inputtext';
import './InputField.scss';
import classNames from 'classnames';

type InputFieldProps = InputTextProps & {
    /**
     * Статус поля. Используется для визуального изменения инпут поля, тултипа/хинта. По умолчанию default.
     */
    status?: 'default' | 'warning' | 'error';

    /**
     * Позиционирование иконки в инпут поле. По умолчанию left.
     */
    iconPosition?: 'left' | 'right';

    /**
     * Наполнение подсказки, отображающееся под полем ввода. Может быть пустым, строкой или компонентом.
     */
    hint?: string | React.ReactNode;

    /**
     * Наполнение тултипа, отображается при наведении.
     */
    tooltip?: string;

    /**
     * Икнока, отображающаяся в инпут поле. Принимает SvgIcon с параметрами.
     */
    icon?: React.ReactNode;

    /**
     * Лейбл над полем ввода. Может быть пустым, простой строкой или полноценным компонентом.
     */
    label?: string | React.ReactNode;
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ status = 'default', iconPosition = 'left', hint, icon, className, disabled, label, ...props }, ref) => {
        const wrapperClass = classNames('app-input-wrapper', {
            [`status-${status}`]: status !== 'default',
            'status-disabled': disabled,
        });
        const inputClass = classNames('app-input p-inputtext', className, {
            'p-invalid': status === 'error',
            'p-warning': status === 'warning',
        });
        const iconWrapperClass = icon && iconPosition ? `p-input-icon-${iconPosition}` : '';

        return (
            <div className={wrapperClass.trim()}>
                {label && <label>{label}</label>}
                <span className={iconWrapperClass}>
                    {icon}
                    <InputText ref={ref} className={inputClass} disabled={disabled} {...props} />
                </span>
                {hint && <small className="app-input-hint">{hint}</small>}
            </div>
        );
    }
);

InputField.displayName = 'InputField';
