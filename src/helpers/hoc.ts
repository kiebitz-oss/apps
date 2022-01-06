// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

interface ElementClassWithNames extends JSX.ElementClass {
    displayName?: string;
    name?: string;
}

export const displayName = (
    WrappedComponent: ElementClassWithNames
): string => {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};
