// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import { keys } from 'apps/provider/dashboard/actions';
import {
    tokenData,
    invitationData,
    confirmOffers,
    acceptedInvitation,
} from './actions';
import {
    withSettings,
    withActions,
    ButtonIcon,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    WithLoader,
    T,
    A,
    Message,
} from 'components';
import t from './translations.yml';
import './appointments.scss';

const ProviderDetails = ({ data }) => {
    return (
        <div className="kip-provider-details">
            <ul>
                <li>{data.json.name}</li>
                <li>{data.json.street}</li>
                <li>{data.json.zip_code}</li>
                <li>{data.json.city}</li>
            </ul>
        </div>
    );
};

const AcceptedInvitation = ({ data }) => {
    const d = new Date(data.offer.date);
    return (
        <div className="kip-accepted-invitation">
            <Card>
                <CardHeader>
                    <h2>
                        <T t={t} k="invitation-accepted.title" />
                    </h2>
                </CardHeader>
                <CardContent>
                    <ProviderDetails data={data.invitationData.provider} />
                    <p className="kip-appointment-date">
                        {d.toLocaleDateString()} ·{' '}
                        <u>{d.toLocaleTimeString()}</u>
                    </p>
                </CardContent>
                <CardFooter>
                    <Button type="warning">
                        <T t={t} k="cancel-appointment" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const NoInvitations = ({ tokenData }) => {
    return (
        <div className="kip-no-invitations">
            <Card>
                <CardHeader>
                    <h2>
                        <T t={t} k="no-invitations.title" />
                    </h2>
                </CardHeader>
                <CardContent>
                    <p className="kip-no-invitations-text">
                        <T t={t} k="no-invitations.notice" />
                    </p>
                </CardContent>
                <CardFooter>
                    <p>
                        <ButtonIcon icon="circle-notch fa-spin" /> &nbsp;
                        <T t={t} k="no-invitations.update-notice" />
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

async function toggleOffers(state, keyStore, settings, offer) {
    if (offer === null) return { data: [] };
    if (state.data.find(i => i === offer.id) !== undefined) {
        state.data = state.data.filter(i => i !== offer.id);
    } else {
        state.data.push(offer.id);
    }
    return { data: state.data };
}

toggleOffers.init = function() {
    return { data: [] };
};

const InvitationDetails = withActions(
    ({
        data,
        tokenData,
        toggleOffers,
        toggleOffersAction,
        acceptedInvitation,
        acceptedInvitationAction,
        confirmOffers,
        confirmOffersAction,
    }) => {
        const [confirming, setConfirming] = useState(false);
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
            if (initialized) return;
            setInitialized(true);
            toggleOffersAction(null);
        });

        const toggle = offer => {
            toggleOffersAction(offer);
        };

        const doConfirmOffers = () => {
            const selectedOffers = [];
            // we add the selected offers in the order the user chose
            for (const offerID of toggleOffers.data) {
                const offer = data.offers.find(offer => offer.id === offerID);
                selectedOffers.push(offer);
            }
            setConfirming(true);
            const p = confirmOffersAction(selectedOffers, data, tokenData.data);
            p.then(() => acceptedInvitationAction());
            p.finally(() => setConfirming(false));
        };

        if (acceptedInvitation.data !== null) {
            return <AcceptedInvitation data={acceptedInvitation.data} />;
        }

        let content;
        if (data === null || data.offers === null)
            return <NoInvitations data={tokenData} />;

        const offers = data.offers.map(offer => {
            const d = new Date(offer.date);
            const selected = toggleOffers.data.includes(offer.id);
            let pref;
            if (selected) pref = toggleOffers.data.indexOf(offer.id) + 1;
            return (
                <tr
                    key={offer.id}
                    className={selected ? `kip-selected kip-pref-${pref}` : ''}
                    onClick={() => toggle(offer)}
                >
                    <td>{selected ? pref : '-'}</td>
                    <td>
                        {d.toLocaleDateString()} · {d.toLocaleTimeString()}
                    </td>
                </tr>
            );
        });

        return (
            <F>
                <div className="kip-invitation-details">
                    <Card>
                        <CardHeader>
                            <h2>
                                <T t={t} k="invitation-received.title" />
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <ProviderDetails data={data.provider} />
                            <p>
                                <T t={t} k="appointments-notice" />
                            </p>
                            <hr />
                            <table className="bulma-table bulma-is-striped bulma-is-fullwidth">
                                <thead>
                                    <tr>
                                        <th>
                                            <T
                                                t={t}
                                                k="appointment-preference"
                                            />
                                        </th>
                                        <th>
                                            <T t={t} k="appointment-date" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{offers}</tbody>
                            </table>
                            <Button
                                waiting={confirming}
                                onClick={doConfirmOffers}
                                disabled={
                                    confirming ||
                                    Object.keys(toggleOffers.data).length === 0
                                }
                                type="success"
                            >
                                <T t={t} k="confirm-appointment" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </F>
        );
    },
    [toggleOffers, confirmOffers, acceptedInvitation]
);

const Appointments = withActions(
    ({ settings, invitationData, tokenData }) => {
        let content;
        const render = () => {
            return (
                <InvitationDetails
                    tokenData={tokenData}
                    data={invitationData.data}
                />
            );
        };
        return (
            <WithLoader
                resources={[tokenData, invitationData]}
                renderLoaded={render}
            />
        );
    },
    [tokenData, invitationData]
);

export default Appointments;
