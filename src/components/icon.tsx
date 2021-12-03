// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import classnames from 'helpers/classnames';

type IconProps = {
    icon: string;
    iconClasses?: string;
};

export const Icon: React.FC<IconProps> = ({ icon, iconClasses }) => (
    <i className={classnames('fas', `fa-${icon}`, iconClasses)} />
);
