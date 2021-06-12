import React from 'react';

interface DefaultNavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const DefaultNavigationBar: React.FC<DefaultNavigationBarProps> = (props) => {
    const { children } = props;

    return <div className="bg-white p-4">{children}</div>;
};

export default DefaultNavigationBar;
