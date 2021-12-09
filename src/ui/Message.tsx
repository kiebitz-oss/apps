// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import clsx from 'clsx';
import React from 'react';
import { Variant } from 'types/Variant';

type MessageProps = {
    className?: string;
    waiting?: boolean;
    variant?: Variant;
};

export const Message: React.FC<MessageProps> = ({
    children,
    className,
    variant,
}) => <div className={clsx('message', variant, className)}>{children}</div>;
