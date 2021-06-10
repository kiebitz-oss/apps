import classNames from 'classnames';
import React, { FC } from 'react';

export interface HeroTitleProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    desc?: string;
}

export const HeroTitle: FC<HeroTitleProps> = (props) => {
    const { title, desc, className, ...divProps } = props;
    return (
        <div className={classNames('max-w-xl 2xl:pt-16 pt-8 pb-4 text-center px-4', className)} {...divProps}>
            <h1 className="2xl:text-6xl text-4xl font-bold text-black">{title}</h1>
            {desc ? <p className="mt-4 text-xl text-gray-500">{desc}</p> : null}
        </div>
    );
};
