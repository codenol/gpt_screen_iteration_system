import React from 'react';
import { TIconComponentProps } from './IconsComponent.types';

export const IconX = ({ color, width, height, className }: TIconComponentProps) => (
    <svg
        width={width || '24'}
        height={height || '24'}
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M17.293 5.29309C17.6835 4.90258 18.3165 4.90257 18.707 5.29309C19.0974 5.68362 19.0975 6.31667 18.707 6.70715L13.4141 12.0001L18.707 17.2931C19.0974 17.6836 19.0975 18.3167 18.707 18.7072C18.3166 19.0976 17.6835 19.0975 17.293 18.7072L12 13.4142L6.70703 18.7072C6.31655 19.0976 5.6835 19.0975 5.29297 18.7072C4.90244 18.3166 4.90244 17.6836 5.29297 17.2931L10.5859 12.0001L5.29297 6.70715C4.90244 6.31663 4.90244 5.68362 5.29297 5.29309C5.68349 4.90258 6.31651 4.90257 6.70703 5.29309L12 10.5861L17.293 5.29309Z"
            fill={color || 'currentColor'}
        />
    </svg>
);
