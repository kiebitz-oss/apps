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
    Button,
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    T,
    A,
    Message,
} from 'components';
import t from './translations.yml';
import './appointments.scss';

const ProviderDetails = ({ data }) => {
    return (
        <div className="kip-provider-details">
            <p>
                {data.json.name} · {data.json.street} · {data.json.zip_code} ·{' '}
                {data.json.city}
            </p>
        </div>
    );
};

async function toggleOffers(state, keyStore, settings, offer) {
    if (state.data[offer.id] === true) {
        delete state.data[offer.id];
    } else state.data[offer.id] = true;
    return { data: state.data };
}

toggleOffers.init = function() {
    return { data: {} };
};

const AcceptedInvitation = ({ data }) => {
    return (
        <Card>
            <CardHeader>
                <h2>
                    <T t={t} k="invitation-accepted.title" />
                </h2>
            </CardHeader>
            <CardContent>Accepted</CardContent>
        </Card>
    );
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

        const toggle = offer => {
            toggleOffersAction(offer);
        };

        const doConfirmOffers = () => {
            const selectedOffers = data.offers.filter(
                offer => toggleOffers.data[offer.id] === true
            );
            setConfirming(true);
            confirmOffersAction(
                selectedOffers,
                data,
                tokenData.data
            ).finally(() => setConfirming(false));
        };

        if (acceptedInvitation.data !== null) {
            return <AcceptedInvitation data={acceptedInvitation.data} />;
        }

        const offers = data.offers.map(offer => {
            const d = new Date(offer.date);
            const selected = toggleOffers.data[offer.id] === true;
            return (
                <tr
                    key={offer.id}
                    className={selected ? 'kip-selected' : ''}
                    onClick={() => toggle(offer)}
                >
                    <td>
                        <input readOnly type="checkbox" checked={selected} />
                    </td>
                    <td>
                        {d.toLocaleDateString()} {d.toLocaleTimeString()}
                    </td>
                </tr>
            );
        });
        return (
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
                        <table className="bulma-table bulma-is-striped">
                            <thead>
                                <tr>
                                    <th>
                                        <T t={t} k="appointment-accept" />
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
        );
    },
    [toggleOffers, confirmOffers, acceptedInvitation]
);

const Appointments = withActions(
    ({ settings, invitationData, tokenData, keys }) => {
        let content;
        if (invitationData !== undefined && invitationData.status === 'loaded')
            content = (
                <InvitationDetails
                    tokenData={tokenData}
                    data={invitationData.data}
                />
            );
        return <div className="kip-appointments">{content}</div>;
    },
    [tokenData, invitationData, keys]
);

export default Appointments;
