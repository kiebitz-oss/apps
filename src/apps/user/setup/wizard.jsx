// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState, useEffect, useRef } from 'react';
import {
    T,
    A,
    Button,
    withRouter,
    withActions,
    withSettings,
    WithLoader,
    CenteredCard,
    CardContent,
    CardFooter,
    Switch,
    Message,
    CardNav,
} from 'components';
import ContactData from './contact-data';
import StoreSecrets from './store-secrets';
import Verify from './verify';
import Finalize from './finalize';
import t from './translations.yml';
import './wizard.scss';

const pages = [
    'hi',
    'enter-contact-data',
    'verify',
    'finalize',
    'store-secrets',
];

const Hi = withSettings(({ settings }) => (
    <React.Fragment>
        <CardContent>
            <p>
                <T
                    t={t}
                    k="wizard.hi"
                    link={
                        <A
                            key="letUsKnow"
                            external
                            href={settings.get('supportEmail')}
                        >
                            <T t={t} k="wizard.letUsKnow" key="letUsKnow" />
                        </A>
                    }
                />
            </p>
        </CardContent>
        <CardFooter>
            <Button type="success" href={`/user/setup/enter-contact-data`}>
                <T t={t} k="wizard.continue" />
            </Button>
        </CardFooter>
    </React.Fragment>
));

const Wizard = ({ route, router, page, privacyManager }) => {
    const pageRef = useRef(null);

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
        const { app } = route.handler;
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
                            if (canShow(p))
                                router.navigateToUrl(`/user/setup/${p}`);
                        }}
                        active={page === p}
                    >
                        {i++}. <T t={t} k={`wizard.steps.${p}`} />
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

export default withActions(withRouter(Wizard), []);
