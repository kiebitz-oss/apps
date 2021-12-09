import React from 'react';

export interface ListProps {}

export const List: React.FC<ListProps> = ({ children, ...props }) => {
    return <div {...props}>{children}</div>;
};
