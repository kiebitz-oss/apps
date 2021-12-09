import React from 'react';

export interface ListHeaderProps {}

export const ListHeader: React.FC<ListHeaderProps> = ({
    children,
    ...props
}) => {
    return <div {...props}>{children}</div>;
};
