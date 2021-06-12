import React, { FC } from 'react';
import { Entity } from '../types';
import classnames from 'classnames';

export interface DefaultHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    entity: Entity;
}

const DefaultHeader: FC<DefaultHeaderProps> = (props) => {
    const { entity, children } = props;
    return (
        <div
            className={classnames(
                'flex items-center justify-center w-screen p-2 text-white',
                entity === 'provider' ? 'bg-brand-provider' : 'bg-brand-user'
            )}
        >
            {children}
        </div>
    );
};

export default DefaultHeader;
