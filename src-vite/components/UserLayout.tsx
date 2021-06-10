import React, { FC } from 'react';
import Header from './Header';

export const UserLayout: FC = ({ children }) => {
    return (
        <>
            <Header />
            <div className="container w-full min-h-screen 2xl:pt-24 pt-12 mx-auto">{children}</div>
        </>
    );
};
