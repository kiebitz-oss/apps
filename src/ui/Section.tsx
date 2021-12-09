import React from 'react';
import clsx from 'clsx';

type SectionProps = React.HTMLAttributes<HTMLElement>;

export const Section: React.FC<SectionProps> = ({
    children,
    className,

    ...props
}) => {
    return (
        <section className={clsx('section', className)} {...props}>
            {children}
        </section>
    );
};
