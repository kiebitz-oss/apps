import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    type: 'success' | 'warn' | 'error';
    icon?: ReactNode;
}

const Alert: FC<AlertProps> = (props) => {
    const { type, children, className, ...divProps } = props;

    if (type !== 'success') {
        throw new Error('Alert types `warn` and `error` are not implemented yet.');
    }

    return (
        <div
            className={classNames(
                'p-4',
                'bg-brand-user-light-2',
                'text-brand-user-dark text-center text-2xl font-semibold',
                className
            )}
            {...divProps}
        >
            {children}
        </div>
    );
};

export default Alert;
