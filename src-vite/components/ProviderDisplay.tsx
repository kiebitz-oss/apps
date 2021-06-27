import React from 'react';
import { FaExternalLinkAlt, FaRegUserCircle, FaWheelchair } from 'react-icons/fa';
import classNames from 'classnames';

export interface ProviderDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    desc?: string;
    street: string;
    zip: string;
    city: string;
    isAccessible: boolean;
    website?: string;
}

const ProviderDisplay: React.FC<ProviderDisplayProps> = (props) => {
    const { name, desc, street, zip, city, isAccessible, website } = props;
    return (
        <div className="mb-4 space-y-4">
            <div className="flex items-center">
                <FaRegUserCircle className="lg:text-4xl text-3xl text-brand-provider mr-4" />
                <h6 className="text-xl">{name}</h6>
            </div>
            <p className="text-gray-800">{desc}</p>
            <div>
                <p className="text-gray-800 font-semibold">{street}</p>
                <p className="text-gray-800 font-semibold">
                    {zip}, {city}
                </p>
            </div>
            <div className="flex items-center">
                <FaWheelchair className="text-xl text-brand-provider mr-2" />
                <p className={classNames(!isAccessible && 'text-red-500', 'text-gray-800')}>
                    {!isAccessible ? 'Nicht ' : ''}Barrierefrei
                </p>
            </div>
            {website ? (
                <div className="flex items-center">
                    <FaExternalLinkAlt className="text-xl text-brand-provider mr-2" />
                    <a
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        href={website}
                        rel="noreferrer noopener"
                    >
                        {website}
                    </a>
                </div>
            ) : null}
        </div>
    );
};

export default ProviderDisplay;
