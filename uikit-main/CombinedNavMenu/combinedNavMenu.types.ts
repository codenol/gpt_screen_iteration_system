import { BreadcrumbsRoute } from 'use-react-router-breadcrumbs';

export type TCombinedNavMenuItem = BreadcrumbsRoute & {
    label: string;
    icon: string;
    iconSize?: string;
    to?: string;
    target?: string;
    children?: TCombinedNavMenuItem[];
    badge?: string | JSX.Element;
    disabled?: boolean;
    path?: string;
    relative?: string;
};

export type TCombinedNavSubmenuItem = {
    label: string;
    url: string;
    subsystemName: string;
    visible?: boolean;
    disabled?: boolean;
    target?: string;
    isHomePage?: boolean;
};

export enum ELayoutModes {
    short = 'short',
    standard = 'standard',
}

export enum EThemes {
    light = 'light',
    dark = 'dark',
}
