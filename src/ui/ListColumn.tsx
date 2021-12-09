import React from 'react';

export interface ListColumnProps {
    size?: 'md';
}

export const ListColumn: React.FC<ListColumnProps> = ({
    children,
    ...props
}) => {
    return <div {...props}>{children}</div>;
};
