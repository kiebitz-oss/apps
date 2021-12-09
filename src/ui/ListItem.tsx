import React from 'react';

export interface ListItemProps {}

export const ListItem: React.FC<ListItemProps> = ({ children, ...props }) => {
    return <div {...props}>{children}</div>;
};
