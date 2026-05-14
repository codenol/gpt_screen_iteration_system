import React from 'react';
import type { ArrayFieldTemplateProps } from '@rjsf/utils';
import { getTemplate } from '@rjsf/utils';
import { Button } from 'primereact/button';
import { IconInfoCircle } from '../../../IconsComponent';

export const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
    const ArrayFieldItemTemplat = getTemplate<'ArrayFieldItemTemplate'>('ArrayFieldItemTemplate', props.registry);

    const tooltip = props.schema.description;

    const hideAdd = props.uiSchema?.['ui:options']?.hideAdd;

    return (
        <div id={props.idSchema.$id}>
            <div style={{ marginBottom: '1rem' }}>
                {props.title}
                {tooltip ? (
                    <Button
                        tabIndex={-1}
                        severity="info"
                        type="button"
                        tooltip={tooltip}
                        className="icon-action"
                        style={{ marginLeft: '4px' }}
                    >
                        <IconInfoCircle />
                    </Button>
                ) : null}
            </div>
            {props.items.map(({ key, ...itemProps }) => (
                <ArrayFieldItemTemplat key={key} {...itemProps} />
            ))}
            <div className="flex align-items-start">
                {props.canAdd && !hideAdd && (
                    <Button icon="pi pi-plus" label="Добавить" onClick={props.onAddClick} disabled={props.disabled} />
                )}
            </div>
        </div>
    );
};
