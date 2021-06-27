import React from 'react';

export interface FeatureHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    desc?: string;
}

const FeatureHeading: React.FC<FeatureHeadingProps> = (props) => {
    const { title, desc } = props;
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto 2xl:w-1/4 lg:w-1/2 p-8 space-y-4">
                <h1 className="lg:text-4xl text-3xl font-semibold">{title}</h1>
                <p className="text-xl">{desc}</p>
            </div>
        </div>
    );
};

export default FeatureHeading;
