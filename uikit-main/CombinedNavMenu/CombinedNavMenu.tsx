import React, { useMemo, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'primereact/menu';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import classNames from 'classnames';

import { TCombinedNavMenuItem, TCombinedNavSubmenuItem, ELayoutModes, EThemes } from './combinedNavMenu.types';

import { SvgIcon } from '../SvgIcon';

import './combinedNavMenu.scss';

export interface CombinedNavMenuProps {
    model: TCombinedNavMenuItem[];
    currentSubsystem: string;
    defaultHomePage?: string;
    submenuModel?: TCombinedNavSubmenuItem[];
    isSubmenuLoading?: boolean;
    layoutMode?: ELayoutModes;
    onChangeLayoutMode?: (newLayoutMode: ELayoutModes) => void;
    theme?: EThemes;
    onChangeTheme?: (newTheme: EThemes) => void;
    addThemeQueryParams?: boolean;
    userAvatarElement?: JSX.Element;
}

export const CombinedNavMenu = (props: CombinedNavMenuProps) => {
    const {
        model,
        submenuModel,
        currentSubsystem,
        defaultHomePage = '',
        layoutMode = ELayoutModes.standard,
        onChangeLayoutMode,
        theme,
        onChangeTheme,
        userAvatarElement,
        addThemeQueryParams = false,
        isSubmenuLoading = false,
    } = props;

    const subsystemsMenuRef = useRef<Menu>(null);

    const mainPageUrl = useMemo(() => {
        const pageUrl = submenuModel?.find((submenuModelItem) => submenuModelItem.isHomePage);
        if (pageUrl) return pageUrl.url;
        return defaultHomePage;
    }, [defaultHomePage, submenuModel]);

    const submenuModelItemTemplate = (data, component) => (
        <div
            className={classNames(
                data.subsystemName === currentSubsystem && 'combined-nav-menu-sidebar-current-subsystems'
            )}
        >
            {component.element}
        </div>
    );

    const submenuModelWithTemplates = useMemo(
        () =>
            submenuModel?.map((submenuModelItem) => {
                const itemUrl = new URL(submenuModelItem.url);
                if (addThemeQueryParams && theme) {
                    itemUrl.searchParams.append('theme', theme);
                }
                return {
                    ...submenuModelItem,
                    template: submenuModelItemTemplate,
                    url: itemUrl.toString(),
                };
            }),
        [submenuModel]
    );

    return (
        <div className="combined-nav-menu-container flex h-full">
            <div className="combined-nav-menu-sidebar flex h-full">
                <div className="combined-nav-menu-sidebar-top-container">
                    <div className="combined-nav-menu-sidebar-item-container combined-nav-menu-sidebar-product-status-container">
                        <div className="combined-nav-menu-sidebar-product-status">
                            <SvgIcon name="lock-keyhole" size={12} viewBox="0 0 12 12" />
                        </div>
                    </div>
                    {submenuModel && !!submenuModel.length && (
                        <div className="combined-nav-menu-sidebar-item-container combined-nav-menu-sidebar-subsystems-container">
                            <div className="combined-nav-menu-sidebar-subsystems">
                                <Button
                                    className="combined-nav-menu-sidebar-subsystems-btn"
                                    onClick={(event) => {
                                        subsystemsMenuRef.current?.toggle(event);
                                    }}
                                >
                                    <SvgIcon name="layout-grid" size={20} viewBox="0 0 20 20" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="combined-nav-menu-sidebar-bottom-container">
                    <div className="combined-nav-menu-sidebar-item-container combined-nav-menu-sidebar-theme-switcher-container">
                        <div className="combined-nav-menu-sidebar-theme-switcher">
                            <Button
                                className="combined-nav-menu-sidebar-theme-switcher-btn"
                                onClick={() => {
                                    if (!onChangeTheme) return;
                                    if (theme === EThemes.light) onChangeTheme(EThemes.dark);
                                    else onChangeTheme(EThemes.light);
                                }}
                            >
                                <SvgIcon
                                    name={theme === EThemes.light ? 'sun' : 'moon'}
                                    size={20}
                                    viewBox="0 0 20 20"
                                />
                            </Button>
                        </div>
                    </div>
                    {!!userAvatarElement && (
                        <div className="combined-nav-menu-sidebar-user-avatar-container">{userAvatarElement}</div>
                    )}
                </div>
            </div>
            <div className="combined-nav-menu flex flex-column justify-content-between h-full">
                {
                    <Link to={mainPageUrl} className="layout-logo">
                        {layoutMode === ELayoutModes.short ? (
                            <SvgIcon name="logo-min" style={{ width: 'auto', height: '100%' }} viewBox="0 0 32 24" />
                        ) : (
                            <SvgIcon
                                name={'logo-genom'}
                                style={{ width: '146px', color: 'var(--sidebar-logo-text-default)' }}
                                viewBox="0 0 146 24"
                            />
                        )}
                    </Link>
                }

                <AppSubmenu items={model} style={{ overflowY: 'scroll' }} className="layout-menu h-full" />

                <div className="layout-menu-bottom combined-nav-menu-toggle-container">
                    <ul className="layout-menu">
                        <li>
                            {!!onChangeLayoutMode && (
                                <button
                                    type="button"
                                    className="combined-nav-menu-toggle-btn"
                                    onClick={() => {
                                        if (layoutMode === 'short') return onChangeLayoutMode(ELayoutModes.standard);
                                        return onChangeLayoutMode(ELayoutModes.short);
                                    }}
                                >
                                    <SvgIcon
                                        name="chevron-left"
                                        size={16}
                                        style={layoutMode === 'short' ? { transform: 'rotate(180deg)' } : {}}
                                        viewBox="0 0 16 16"
                                    />
                                    <span>Свернуть</span>
                                </button>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
            <Menu
                className="combined-nav-menu-sidebar-subsystems-container"
                model={submenuModelWithTemplates}
                popup
                ref={subsystemsMenuRef}
                id="popup_menu_left"
                style={{
                    width: '160px',
                }}
            />
            <Tooltip
                target={'.combined-nav-menu-sidebar-product-status'}
                content={'Функционал находится в разработке'}
                position="right"
                style={{
                    maxWidth: '280px',
                }}
            />
            {isSubmenuLoading && (
                <Tooltip
                    target={'.combined-nav-menu-sidebar-subsystems'}
                    content={'Загружается информация о модулях'}
                    position="right"
                    style={{
                        maxWidth: '280px',
                    }}
                />
            )}
        </div>
    );
};

type TAppSubmenuProps = {
    items: TCombinedNavMenuItem[];
    style?: React.CSSProperties;
    className?: string;
};

const AppSubmenu = ({ items, style, className }: TAppSubmenuProps) => (
    <ul style={style} className={className}>
        {items.map((item, i) => (
            <MenuItem item={item} key={i} />
        ))}
    </ul>
);

const MenuItem = ({ item }: { item: TCombinedNavMenuItem }) => {
    if (item.to) {
        return (
            <li>
                <CustomLink to={item.to} target={item.target} label={item.label} layoutMode={ELayoutModes.standard}>
                    <MenuItemContent item={item} />
                </CustomLink>
            </li>
        );
    }

    return (
        <li>
            <MenuItemContent item={item} isDivider={true} />
            {item.children?.length ? <AppSubmenu className="text-left" items={item.children} /> : null}
        </li>
    );
};

const MenuItemContent = ({ item, isDivider = false }) => {
    let badge;
    if (item.badge && typeof item.badge === 'string') {
        badge = <span className="menuitem-badge">{item.badge}</span>;
    } else {
        badge = item.badge;
    }

    return (
        <>
            {item.icon && !isDivider && (
                <SvgIcon name={item.icon} size={item.iconSize || '1.125rem'} className="flex-shrink-0" />
            )}

            <span className={classNames('menuitem-label', isDivider && 'menuitem-label-with-divider')}>
                <span>{item.label}</span>
                {isDivider && <hr />}
            </span>

            {badge}
        </>
    );
};

function CustomLink({ children, ...props }) {
    return (
        <Button
            style={{
                padding: 0,
                background: 'transparent',
                border: 'none',
                width: '100%',
            }}
            tooltip={props.layoutMode === ELayoutModes.short ? props.label : false}
        >
            <NavLink
                className={({ isActive }) =>
                    isActive ? 'router-link router-link-active router-link-exact-active' : 'router-link'
                }
                data-pr-tooltip={props.label}
                to={props.to}
                {...props}
            >
                {children}
            </NavLink>
        </Button>
    );
}
