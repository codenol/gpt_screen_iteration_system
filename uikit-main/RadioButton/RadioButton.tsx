import React, { useMemo } from 'react';
import classNames from 'classnames';
import { RadioButton as RadioButtonPR, RadioButtonProps } from 'primereact/radiobutton';
import { IconInfo } from 'uikit/IconsComponent';
import { Tooltip, TooltipProps } from 'primereact/tooltip';
import { propsToDataAttributes } from './radioButton.helpers';

interface IRadioButtonProps extends RadioButtonProps {
    /**
     * Текст справа от RadioButton
     */
    label?: string;
    /**
     * Добавление иконки после текста для вывода информации через tooltip.
     * @description для отображения подсказки по клику нужно передать event:'focus'.
     */
    infoIcon?: TooltipProps & {
        /**
         * Текст подсказки.
         */
        tooltip: string;
    };
}

export const RadioButton = (props: IRadioButtonProps) => {
    const base = 'radio-button';
    const { value, label, infoIcon } = props;
    // Уникальный класс для иконки что бы target в Tooltip корректно отрабатывал
    const iconClass = `${base}-icon-${value}`;

    // Формирование data-attributes для Tooltip от primeReact
    const dataAttributes = useMemo(() => {
        if (!infoIcon) return null;

        const attributes = propsToDataAttributes(infoIcon, 'pr');

        if (Object.keys(attributes).length <= 0) return null;

        return attributes;
    }, [infoIcon]);

    return (
        <div className={base}>
            <Tooltip target={`.${iconClass}`} />
            <RadioButtonPR inputId={value} value={value} {...props} />
            {label && (
                <label className={`${base}-label`} htmlFor={value}>
                    {label}
                </label>
            )}
            {infoIcon && dataAttributes && (
                <IconInfo
                    className={classNames(`${base}-icon ${iconClass}`, {
                        [`${base}-icon-event-focus`]: infoIcon?.event === 'focus',
                    })}
                    width="16"
                    height="16"
                    data-pr-position="top"
                    {...dataAttributes}
                />
            )}
        </div>
    );
};
