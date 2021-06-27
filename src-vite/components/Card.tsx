import React from 'react';
import classNames from 'classnames';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = (props) => {
    const { children, className, ...divProps } = props;
    return (
        <div className={classNames('bg-white lg:px-8 px-6 py-12 shadow-md', className)} {...divProps}>
            {children}
        </div>
    );
};

export default Card;
