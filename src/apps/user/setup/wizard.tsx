// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { withActions, CenteredCard, CardNav } from 'components';
import { useParams } from 'react-router-dom';
// import './wizard.scss';
import { Trans } from '@lingui/react';

const Wizard: React.FC<{ page: string; titles: string[] }> = ({
    children,
    titles,
}) => {
    const pages = React.Children.toArray(children);
    const { page } = useParams();

    let idx =
        Object.keys(titles).findIndex((t) => {
            return t === page;
        }) || 0;

    idx = idx === -1 ? 0 : idx;

    return (
        <CenteredCard className="kip-cm-wizard">
            <CardNav>
                <Trans id={Object.values(titles)[idx]} /> ({idx + 1}/
                {pages.length})
            </CardNav>

            {pages[idx]}
        </CenteredCard>
    );
};

export default withActions(Wizard, []);
