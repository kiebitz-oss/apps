import React from 'react';
import clsx from 'clsx';

type TagProps = React.ComponentProps<'p'>;

export const Tag: React.FC<TagProps> = ({ children, className, ...props }) => {
    return (
        <span className={clsx('tag', className)} {...props}>
            {children}
        </span>
    );
};
