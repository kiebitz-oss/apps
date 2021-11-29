// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useRef } from 'react';
import {
    A,
    Button,
    withActions,
    withSettings,
    WithLoader,
    CenteredCard,
    CardContent,
    CardFooter,
    CardNav,
} from 'components';
import ContactData from './contact-data';
import StoreSecrets from './store-secrets';
import Verify from './verify';
import Finalize from './finalize';
import { Trans } from '@lingui/macro';
import './wizard.scss';
import { useNavigate } from 'react-router-dom';

const pages = [
    'hi',
    'enter-contact-data',
    //    'verify',
    'finalize',
    'store-secrets',
];

const Hi = withSettings(({ settings }) => (
    <React.Fragment>
        <CardContent>
            <p>
                <Trans
                    id="wizard.hi"
                    values={{
                        link: (
                            <A
                                key="letUsKnow"
                                external
                                href={settings.get('supportEmail')}
                            >
                                <Trans id="wizard.letUsKnow" key="letUsKnow" />
                            </A>
                        ),
                    }}
                />
            </p>
        </CardContent>
        <CardFooter>
            <Button type="success" href={`/user/setup/enter-contact-data`}>
                <Trans id="wizard.continue" />
            </Button>
        </CardFooter>
    </React.Fragment>
));

const Wizard = ({ page }) => {
    const pageRef = useRef(null);
    const navigate = useNavigate();

    const checkPage = () => {
        return true;
    };

    const index = pages.indexOf(page);

    const canShow = _page => {
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
                            if (canShow(p)) navigate(`/user/setup/${p}`);
                        }}
                        active={page === p}
                    >
                        {i++}. <Trans id={`wizard.steps.${p}`} />
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
            case 'enter-contact-data':
                populate(
                    'enter-contact-data',
                    <ContactData key="enterContactData" />
                );
                break;
            case 'store-secrets':
                populate('store-secrets', <StoreSecrets key="storeSecrets" />);
                break;
            case 'verify':
                populate('verify', <Verify key="verify" />);
                break;
            case 'finalize':
                populate('finalize', <Finalize key="finalize" />);
                break;
        }

        return (
            <React.Fragment>{Array.from(components.values())}</React.Fragment>
        );
    };

    return (
        <CenteredCard className="kip-cm-wizard">
            <WithLoader resources={[]} renderLoaded={renderLoaded} />
        </CenteredCard>
    );
};

export default withActions(Wizard, []);
