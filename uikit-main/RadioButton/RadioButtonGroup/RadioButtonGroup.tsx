import classNames from 'classnames';
import React, { ReactNode } from 'react';

import './radioButtonGroup.scss';

interface IRadioButtonProps {
    /**
     * Ориентация группы. Горизонтальная или вертикальная
     * @default 'horizontal'
     */
    variant?: 'horizontal' | 'vertical';
    /**
     * Дочерние компоненты
     */
    children: ReactNode;
}
export const RadioButtonGroup = ({ children, variant = 'horizontal' }: IRadioButtonProps) => {
    const base = 'radio-button-group';

    return <div className={classNames(base, { [`${base}-${variant}`]: variant })}>{children}</div>;
};
