// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * Карточка с хлебными крошками.
 * Обёртка над 'primereact/breadcrumb'.
 *
 * @module GenomeBreadCrumbs
 */
import React from 'react';
import { Link } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

import { BreadCrumb } from 'primereact/breadcrumb';
import type { BreadcrumbsRoute } from 'use-react-router-breadcrumbs';

import './genomeBreadCrumbs.scss';

export interface GenomeBreadCrumbsProps {
    /**
     * Список роутов.
     */
    router: BreadcrumbsRoute<string>[];
    /**
     * Элменент в правом конце карточки.
     */
    action?: string | JSX.Element | JSX.Element[];
    /**
     * Список путей, которые будут пропущены при формировании крошек.
     */
    excludePaths?: string[];
    /**
     * Проп для изменения стандартной ссылки на главную страницу.
     */
    home?: MenuItem;
}

/**
 * Кастомный компонент хлебных крошек внутри карточки.
 */
export const GenomeBreadCrumbs = (props: GenomeBreadCrumbsProps) => {
    const { router, action, excludePaths = [], home = { visible: false, separator: false } } = props;

    // Получение списка хлебных крошек на основе роутера
    const breadcrumbs = useBreadcrumbs(router, { excludePaths: ['/', ...excludePaths] });
    // Формирование модели, подходящей для primereact/breadcrumb
    const breadcrumbsModel: object[] = breadcrumbs.map(({ breadcrumb, match }) => ({
        label: breadcrumb,
        url: match.pathname,
        template: (item) => tmpLinKBreadCrumb(item),
    }));

    // Шаблон отдельных элементов хлебной крошки
    const tmpLinKBreadCrumb = (item: { url: string; label: string }) => (
        <Link className="p-menuitem-link" to={item.url}>
            <span className="p-menuitem-text">{item.label}</span>
        </Link>
    );

    return (
        <div
            style={{
                display: 'flex',
                background: 'var(--breadcrumbs-background-default)',
                width: '100%',
                alignItems: 'center',
                borderRadius: 3,
                width: 'fit-content',
                border: 'solid 1px var(--breadcrumbs-border-default)',
                borderRadius: '16px',
            }}
        >
            <BreadCrumb
                style={{
                    padding:
                        'var(--spacing-spacer-800) var(--spacing-spacer-1000) var(--spacing-spacer-800) var(--spacing-spacer-1200)',
                }}
                model={breadcrumbsModel}
                home={home}
                separatorIcon={<div />}
                className={'flex-grow-1'}
            />
            {action}
        </div>
    );
};
