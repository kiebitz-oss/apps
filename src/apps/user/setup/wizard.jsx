// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { useState, useEffect, useRef} from "react";
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
    CardNav
} from "components";
import ContactData from "./contact-data";
import StoreSecrets from "./store-secrets";
import Verify from "./verify";
import Finalize from "./finalize";
import t from "./translations.yml";
import "./wizard.scss";

const pages = ["hi", "enter-contact-data", "verify", "store-secrets", "finalize"];

const Hi = withSettings(({type, settings}) => <React.Fragment>
    <CardContent>
        <p>
            <T t={t} k="wizard.hi" link={<A key="letUsKnow" external href={settings.get("supportEmail")} ><T t={t} k="wizard.letUsKnow" key="letUsKnow"/></A>} />
        </p>
    </CardContent>
    <CardFooter>
        <Button type="success" href={`/setup/${type}/enter-contact-data`}><T t={t} k="wizard.continue" /></Button>
    </CardFooter>
</React.Fragment>)

const Wizard = ({route, router, page, type, privacyManager}) => {

    const pageRef = useRef(null)

    const checkPage = () => {
        return true
    }

    const canShow = (_page) => {
        return true
    }

    if (!page)
        page = pages[0]

    // we always 
    useEffect(() => {
        if (pageRef.current !== undefined)
            pageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })        
    })

    const renderLoaded = () => {
        const { app } = route.handler;
        const components = new Map([]);
        let i = 1;

        if (!checkPage()) return <div />;

        for (const p of pages)
            components.set(
                p,
                <a key={`${p}Link`} ref={p === page ? pageRef: undefined}>
                <CardNav
                    key={p}
                    disabled={!canShow(p)}
                    onClick={() => {
                        if (canShow(p))
                            router.navigateToUrl(`/setup/${type}/${p}`);
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
            case "hi":
                populate(
                    "hi",
                    <Hi
                        key="hiNotice"
                        type={type}
                    />
                );
                break;
            case "enter-contact-data":
                populate(
                    "enter-contact-data",
                    <ContactData
                        key="enterContactData"
                        type={type}
                    />
                );
                break;
            case "store-secrets":
                populate(
                    "store-secrets",
                    <StoreSecrets
                        key="storeSecrets"
                        type={type}
                    />
                );
                break;
            case "verify":
                populate(
                    "verify",
                    <Verify
                        key="verify"
                        type={type}
                    />
                );
                break;
            case "finalize":
                populate(
                    "finalize",
                    <Finalize
                        key="finalize"
                        type={type}
                    />
                );
                break;
        }

        return (
            <React.Fragment>{Array.from(components.values())}</React.Fragment>
        );
    };

    return (
        <CenteredCard className="kip-cm-wizard">
            <WithLoader
                resources={[]}
                renderLoaded={renderLoaded}
            />
        </CenteredCard>
    );

}

export default withActions(withRouter(Wizard), []);
