import React, { FC } from 'react';
import { FaRegHeart } from 'react-icons/fa';

const Header: FC = () => {
    return (
        <div className="flex items-center justify-center w-screen p-2 text-white bg-brand-user">
            <FaRegHeart className="mr-2" /> <span>Gemeinsam schneller impfen</span>
        </div>
    );
};

export default Header;
