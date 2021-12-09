import React from 'react';
import clsx from 'clsx';

type TextProps = React.ComponentProps<'p'>;

export const Text: React.FC<TextProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <p className={clsx('text', className)} {...props}>
            {children}
        </p>
    );
};
