// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';

import Settings from './settings';
import { keys } from 'apps/provider/actions';
import { formatDuration } from 'helpers/format';
import {
    tokenData,
    userSecret,
    invitationData,
    confirmOffers,
    acceptedInvitation,
} from 'apps/user/actions';
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
                <li>{data.json.zipCode}</li>
                <li>{data.json.city}</li>
                {data.json.accessible && (
                    <li>
                        <T t={t} k="provider-details.accessible" />
                    </li>
                )}
            </ul>
            {data.json.description && (
                <Message type="info">{data.json.description}</Message>
            )}
        </div>
    );
};

const AcceptedInvitation = withActions(
    ({ data, userSecret }) => {
        const d = new Date(data.offer.timestamp);
        return (
            <F>
                <CardContent>
                    <div className="kip-accepted-invitation">
                        <h2>
                            <T t={t} k="invitation-accepted.title" />
                        </h2>
                        <ProviderDetails data={data.invitationData.provider} />
                        <p className="kip-appointment-date">
                            {d.toLocaleDateString()} ·{' '}
                            <u>{d.toLocaleTimeString()}</u>
                        </p>
                        <p className="kip-booking-code">
                            <span>
                                <T
                                    t={t}
                                    k={'invitation-accepted.booking-code'}
                                />
                            </span>
                            {userSecret.data.slice(0, 4)}
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="warning">
                        <T t={t} k="cancel-appointment" />
                    </Button>
                </CardFooter>
            </F>
        );
    },
    [userSecret]
);

const NoInvitations = ({ tokenData }) => {
    return (
        <F>
            <CardContent>
                <div className="kip-no-invitations">
                    <h2>
                        <T t={t} k="no-invitations.title" />
                    </h2>
                    <p className="kip-no-invitations-text">
                        <T t={t} k="no-invitations.notice" />
                    </p>
                </div>
            </CardContent>
            <Message type="info">
                <ButtonIcon icon="circle-notch fa-spin" /> &nbsp;
                <T t={t} k="no-invitations.update-notice" />
            </Message>
        </F>
    );
};

async function toggleOffers(state, keyStore, settings, offer) {
    if (offer === null) return { data: [] };
    if (state.data.find(i => i === offer.slotData[0].id) !== undefined) {
        state.data = state.data.filter(i => i !== offer.slotData[0].id);
    } else {
        state.data.push(offer.slotData[0].id);
    }
    return { data: state.data };
}

toggleOffers.init = function() {
    return { data: [] };
};

toggleOffers.actionName = 'toggleOffers';

const PropertyTags = ({ appointment }) => {
    const props = Object.entries(appointment)
        .filter(([k, v]) => v === true)
        .map(([k, v]) => <PropertyTag key={k} property={k} />)
        .filter(p => p !== undefined);
    return <F>{props}</F>;
};

const PropertyTag = withSettings(({ settings, property }) => {
    const lang = settings.get('lang');
    const properties = settings.get('appointmentProperties');
    for (const [category, values] of Object.entries(properties)) {
        const prop = values.values[property];
        if (prop !== undefined) {
            return (
                <span key={property} className={`kip-tag kip-is-${property}`}>
                    {prop[lang]}
                </span>
            );
        }
    }
});
const InvitationDetails = withSettings(
    withActions(
        ({
            data,
            tokenData,
            settings,
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
                    const offer = data.offers.find(
                        offer => offer.slotData[0].id === offerID
                    );
                    selectedOffers.push(offer);
                }
                setConfirming(true);
                const p = confirmOffersAction(
                    selectedOffers,
                    data,
                    tokenData.data
                );
                p.then(() => acceptedInvitationAction());
                p.finally(() => setConfirming(false));
            };

            if (acceptedInvitation.data !== null) {
                return <AcceptedInvitation data={acceptedInvitation.data} />;
            }

            let content;
            if (data === null || data.offers === null)
                return <NoInvitations data={tokenData} />;

            const properties = settings.get('appointmentProperties');

            // to do: use something better than the index i for the key?
            const offers = data.offers
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((offer, i) => {
                    const d = new Date(offer.timestamp);
                    const selected = toggleOffers.data.includes(
                        offer.slotData[0].id
                    );
                    let pref;
                    if (selected)
                        pref =
                            toggleOffers.data.indexOf(offer.slotData[0].id) + 1;
                    return (
                        <tr
                            key={offer.slotData[0].id}
                            className={
                                selected ? `kip-selected kip-pref-${pref}` : ''
                            }
                            onClick={() => toggle(offer)}
                        >
                            <td>{selected ? pref : '-'}</td>
                            <td>
                                {d.toLocaleString(undefined, {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td>
                                {formatDuration(offer.duration, settings, t)}
                            </td>
                            <td>
                                <PropertyTags appointment={offer} />
                            </td>
                        </tr>
                    );
                });

            return (
                <F>
                    <CardContent>
                        <div className="kip-invitation-details">
                            <h2>
                                <T t={t} k="invitation-received.title" />
                            </h2>
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
                                        <th>
                                            <T t={t} k="appointment-duration" />
                                        </th>
                                        <th>
                                            <T t={t} k="appointment-vaccine" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{offers}</tbody>
                            </table>
                        </div>
                    </CardContent>
                    <CardFooter>
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
                    </CardFooter>
                </F>
            );
        },
        [toggleOffers, confirmOffers, acceptedInvitation]
    )
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
