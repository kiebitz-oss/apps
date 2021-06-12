import React, { FC } from 'react';
import DefaultHeader from '../components/DefaultHeader';
import { Entity } from '../types';
import { FaRegHeart } from 'react-icons/fa';

export interface DefaultLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    entity: Entity;
}

const DefaultLayout: FC<DefaultLayoutProps> = (props) => {
    const { entity, children } = props;

    return (
        <>
            <DefaultHeader entity={entity}>
                {/* TODO: Update text when serving app to another entity than `user`. */}
                <FaRegHeart className="mr-2" /> <span>Gemeinsam schneller impfen</span>
            </DefaultHeader>
            <div className="container w-full min-h-screen 2xl:pt-24 pt-12 mx-auto">{children}</div>
        </>
    );
};

export default DefaultLayout;
