import React from 'react';
import clsx from 'clsx';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: string;
    as?: 'section' | 'div';
}

export const Box: React.FC<BoxProps> = ({
    children,
    className,
    variant,
    as,
    ...props
}) => {
    const Element = as || 'section';

    return (
        <Element className={clsx('box', variant, className)} {...props}>
            {children}
        </Element>
    );
};
