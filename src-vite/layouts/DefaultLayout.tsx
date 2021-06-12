import React, { FC } from 'react';
import DefaultHeader from '../components/DefaultHeader';
import { Entity } from '../types';
import { FaRegHeart } from 'react-icons/fa';
import DefaultNavigationBar from '../components/DefaultNavigationBar';

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
            <DefaultNavigationBar>LOGO</DefaultNavigationBar>
            <div className="bg-brand-user-light-2 min-h-screen">{children}</div>
        </>
    );
};

export default DefaultLayout;
