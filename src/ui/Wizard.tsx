// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';

export interface WizardProps {
    step: string;
}

export const Wizard: React.FC<WizardProps> = ({ children, step }) => {
    const pages = React.Children.toArray(children);

    const steps = pages.map((page) => {
        // @ts-expect-error we use the opject to set the step-name
        return page.type?.step;
    });

    // const titles = pages.map((page) => {
    //     // @ts-expect-error we use the opject to set the title
    //     return page.type?.title;
    // });

    let idx = steps.findIndex((t) => {
        return t === step;
    });

    idx = idx === -1 ? 0 : idx;

    return pages[idx];
};
