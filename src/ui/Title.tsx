import React from 'react';
import clsx from 'clsx';

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Title: React.FC<TitleProps> = ({
    children,
    level = 1,
    className,
    ...props
}) => {
    switch (level) {
        case 1:
            return (
                <h1 className={clsx('h1', className)} {...props}>
                    {children}
                </h1>
            );

        case 2:
            return (
                <h2 className={clsx('h2', className)} {...props}>
                    {children}
                </h2>
            );

        case 3:
            return (
                <h3 className={clsx('h3', className)} {...props}>
                    {children}
                </h3>
            );

        case 4:
            return (
                <h4 className={clsx('h4', className)} {...props}>
                    {children}
                </h4>
            );

        case 5:
            return (
                <h5 className={clsx('h5', className)} {...props}>
                    {children}
                </h5>
            );

        case 6:
            return (
                <h6 className={clsx('h6', className)} {...props}>
                    {children}
                </h6>
            );
    }
};
