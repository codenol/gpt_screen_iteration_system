import React, { Fragment } from 'react';

import { Checkbox as CheckboxPrime, CheckboxProps } from 'primereact/checkbox';
import classNames from 'classnames';
import { IconMinus } from 'uikit/IconsComponent';

interface ICheckboxProps extends CheckboxProps {
    /**
     * Включает состояние indeterminate у checkbox
     */
    indeterminate?: boolean;
    /**
     * label checkbox
     * @description обязательно вместе с ним нужно передавать inputId
     */
    label?: string;
    /**
     * Включает статус warning у checkbox
     */
    warning?: boolean;
}
export const Checkbox = (props: ICheckboxProps) => {
    const base = 'checkbox';
    const { indeterminate, warning, className, checked, label, inputId } = props;
    const indeterminateStatus = indeterminate && !checked;

    return (
        <div className={base}>
            <CheckboxPrime
                inputId={inputId}
                {...props}
                className={classNames(className, {
                    [`${base}-warning`]: warning,
                    [`${base}-indeterminate`]: indeterminateStatus,
                })}
            />
            {label && inputId && (
                <label htmlFor={inputId} className={`${base}-label`}>
                    {label}
                </label>
            )}
            {indeterminateStatus ? (
                <IconMinus className={`${base}-icon-indeterminate`} width="16" height="16" />
            ) : (
                <Fragment />
            )}
        </div>
    );
};
