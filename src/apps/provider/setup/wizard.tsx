// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef } from 'react';
import {
    withActions,
    WithLoader,
    CenteredCard,
    CardContent,
    CardFooter,
    CardNav,
    A,
} from 'components';
import ProviderData from './provider-data';
import StoreSecrets from './store-secrets';
import Verify from './verify';
import { Trans, defineMessage } from '@lingui/macro';
import './wizard.scss';
import { useNavigate } from 'react-router-dom';

const pages = ['hi', 'enter-provider-data', 'verify', 'store-secrets'];

const wizardStepsMessages = {
    hi: defineMessage({
        id: 'wizard.steps.hi',
        message: 'Jetzt starten',
    }),
    'enter-provider-data': defineMessage({
        id: 'wizard.steps.enter-provider-data',
        message: 'Kontaktdaten eingeben',
    }),
    verify: defineMessage({
        id: 'wizard.steps.verify',
        message: 'Daten prüfen',
    }),
    'store-secrets': defineMessage({
        id: 'wizard.steps.store-secrets',
        message: 'Sicherungsdatei & Datenschlüssel',
    }),
};

const Hi: React.FC<any> = () => {
    return (
        <>
            <CardContent>
                <p>
                    <Trans id="wizard.hi">
                        Willkommen. Dieser Assistent führt Sie Schritt für
                        Schritt zur Terminverwaltung.
                    </Trans>
                </p>
            </CardContent>
            <CardFooter>
                <A
                    variant="success"
                    type="button"
                    href={`/provider/setup/enter-provider-data`}
                >
                    <Trans id="wizard.continue">Weiter</Trans>
                </A>
            </CardFooter>
        </>
    );
};

const Wizard: React.FC<any> = ({ page, status }) => {
    const pageRef = useRef(null);
    const navigate = useNavigate();

    const checkPage = () => {
        return true;
    };

    const index = pages.indexOf(page);

    const canShow = (_page) => {
        return pages.indexOf(_page) <= index;
    };

    if (!page) page = pages[0];

    // we always
    useEffect(() => {
        if (pageRef.current !== undefined)
            pageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
    });

    const renderLoaded = () => {
        const components = new Map([]);
        let i = 1;

        if (!checkPage()) return <div />;

        for (const p of pages)
            components.set(
                p,
                <a key={`${p}Link`} ref={p === page ? pageRef : undefined}>
                    <CardNav
                        key={p}
                        disabled={!canShow(p)}
                        onClick={() => {
                            if (canShow(p)) navigate(`/provider/setup/${p}`);
                        }}
                        active={page === p}
                    >
                        {i++}. <Trans id={wizardStepsMessages[p]} />
                    </CardNav>
                </a>
            );

        const populate = (p, component) => {
            const existingComponent = components.get(p);
            const newComponent = (
                <React.Fragment key={p}>
                    {existingComponent}
                    {component}
                </React.Fragment>
            );
            components.set(p, newComponent);
        };

        switch (page) {
            case 'hi':
                populate('hi', <Hi key="hiNotice" />);
                break;
            case 'enter-provider-data':
                populate(
                    'enter-provider-data',
                    <ProviderData key="enterProviderData" />
                );
                break;
            case 'store-secrets':
                populate(
                    'store-secrets',
                    <StoreSecrets key="storeSecrets" status={status} />
                );
                break;
            case 'verify':
                populate('verify', <Verify key="verify" />);
                break;
        }

        return <>{Array.from(components.values())}</>;
    };

    return (
        <CenteredCard className="kip-cm-wizard">
            <WithLoader resources={[]} renderLoaded={renderLoaded} />
        </CenteredCard>
    );
};

export default withActions(Wizard, []);
