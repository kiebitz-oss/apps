// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import classnames from 'classnames'

type IconProps = {
    icon: string;
    iconClasses?: string;
};

export const Icon = ({ icon, iconClasses }: IconProps) => (
    <i className={classnames('fas', `fa-${icon}`, iconClasses)} />
);
