import React from 'react';

export const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20"></div>
        </div>
    );
};
