import React from 'react';
import { TIconComponentProps } from './IconsComponent.types';

export const IconCheckCircle2 = ({ color, width, height, className }: TIconComponentProps) => (
    <svg
        width={width || '24'}
        height={height || '24'}
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM14.293 9.29297C14.6835 8.90245 15.3165 8.90247 15.707 9.29297C16.0976 9.68349 16.0976 10.3165 15.707 10.707L11.707 14.707C11.3165 15.0975 10.6835 15.0975 10.293 14.707L8.29297 12.707C7.90248 12.3165 7.90248 11.6835 8.29297 11.293C8.68349 10.9025 9.31651 10.9025 9.70703 11.293L11 12.5859L14.293 9.29297Z"
            fill={color || 'currentColor'}
        />
    </svg>
);
