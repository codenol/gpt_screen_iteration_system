import React, { memo } from 'react';
import './index.scss';
import { Button } from 'primereact/button';
import { IconInfoCircle } from '../../../IconsComponent';

interface InfoCircleProps {
    tooltip?: string;
    link?: boolean;
    tooltipOptions?: any;
}

const InfoCircle = (props: InfoCircleProps) => {
    const { tooltip, tooltipOptions, link } = props;
    return (
        <div className="flex align-items-center p-button-icon-only info-circle-wrapper">
            <Button className="icon-action" tabIndex={-1} link={link} tooltip={tooltip} tooltipOptions={tooltipOptions}>
                <IconInfoCircle />
            </Button>
        </div>
    );
};

export default memo(InfoCircle);
