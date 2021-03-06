// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { ReactChild } from 'react';

import './sidebar-container.scss';

interface SidebarContainerProps {
    active: boolean;
    content: ReactChild;
    sidebar: ReactChild;
}

export const SidebarContainer = ({
    active,
    content,
    sidebar,
}: SidebarContainerProps) => (
    <div className="kip-with-sidebar">
        <div className="kip-with-sidebar__sidebar">{active && sidebar}</div>
        <div className="kip-with-sidebar__content">{content}</div>
    </div>
);
