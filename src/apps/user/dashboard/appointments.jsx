// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useEffect, useState, Fragment as F } from 'react';
import { formatDuration } from 'helpers/time';
import classNames from 'helpers/classnames';
import {
    tokenData,
    userSecret,
    invitation,
    appointments,
    confirmOffers,
    cancelInvitation,
    confirmDeletion,
    acceptedInvitation,
} from 'apps/user/actions';
import {
    withSettings,
    withActions,
    ButtonIcon,
    Button,
    Modal,
    CardContent,
    CardFooter,
    WithLoader,
    Message,
} from 'components';
import { Trans } from '@lingui/macro';
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
                        <Trans id="provider-details.accessible">
                            (barrierefreier Zugang)
                        </Trans>
                    </li>
                )}
            </ul>
            {data.json.description && (
                <Message type="info">{data.json.description}</Message>
            )}
        </div>
    );
};

const OfferDetails = withSettings(({ settings, offer }) => {
    const lang = settings.get('lang');
    const notices = [];
    const properties = settings.get('appointmentProperties');
    for (const [category, values] of Object.entries(properties)) {
        for (const [k, v] of Object.entries(values.values)) {
            if (
                (offer[k] === true ||
                    (offer.properties !== undefined &&
                        offer.properties[category] === k)) &&
                v.notice !== undefined &&
                v.infosUrl !== undefined &&
                v.anamnesisUrl !== undefined
            )
                notices.push(
                    <F key="k">
                        <p>{v.notice[lang]}</p>
                        <p>
                            <Trans id="offer-notice-text">
                                Bitte füllen Sie nach Möglichkeit{' '}
                                <a target="_blank" href={v.anamnesisUrl[lang]}>
                                    die Anamnese- und Einwilligungserklärung
                                </a>{' '}
                                sowie{' '}
                                <a target="_blank" href={v.infosUrl[lang]}>
                                    das Aufklärungsmerkblatt
                                </a>{' '}
                                für den Impfstoff <strong>{v[lang]}</strong> aus
                                und bringen Sie diese unterschrieben mit zur
                                Impfung (falls Sie keine Möglichkeit haben die
                                Dokumente zu drucken können Sie diese auch vor
                                Ort ausfüllen).
                            </Trans>
                        </p>
                    </F>
                );
        }
    }

    return <div className="kip-offer-details">{notices}</div>;
});

const InvitationDeleted = withActions(
    ({ confirmDeletionAction, acceptedInvitationAction }) => {
        return (
            <F>
                <Message type="danger">
                    <Trans id="invitation-accepted.deleted">
                        Der Termin wurde vom Arzt gelöscht. Sorry! Du kannst
                        zurück zur Terminvergabe gehen, um neue Terminvorschläge
                        zu erhalten.
                    </Trans>
                </Message>
                <CardFooter>
                    <Button
                        type="warning"
                        onClick={() =>
                            confirmDeletionAction().then(
                                acceptedInvitationAction
                            )
                        }
                    >
                        <Trans id="invitation-accepted.confirm-deletion">
                            Zurück zur Terminvergabe
                        </Trans>
                    </Button>
                </CardFooter>
            </F>
        );
    },
    [confirmDeletion, acceptedInvitation]
);

const AcceptedInvitation = withActions(
    ({
        tokenData,
        acceptedInvitation,
        acceptedInvitationAction,
        cancelInvitation,
        invitationAction,
        cancelInvitationAction,
        offers,
        userSecret,
    }) => {
        const [showDelete, setShowDelete] = useState(false);

        const doDelete = () => {
            setShowDelete(false);
            cancelInvitationAction(
                acceptedInvitation.data,
                tokenData.data
            ).then(() => {
                // we reload the appointments
                invitationAction();
                acceptedInvitationAction();
            });
        };

        const {
            offer,
            invitation: invitationData,
            slotData,
        } = acceptedInvitation.data;
        const currentOffer = offers.find(of => of.id == offer.id);
        let currentSlotData;

        if (currentOffer !== undefined)
            currentSlotData = currentOffer.slotData.find(
                sl => sl.id === slotData.id
            );

        let notice;
        let changed = false;
        for (const [k, v] of Object.entries(currentOffer)) {
            if (
                k === 'open' ||
                k === 'slotData' ||
                k === 'properties' ||
                k === 'slots'
            )
                continue;
            if (offer[k] !== v) {
                changed = true;
                break;
            }
        }
        if (changed)
            notice = (
                <F>
                    <Message type="danger">
                        <Trans id="invitation-accepted.changed">
                            Details Deines Termins haben sich geändert!
                        </Trans>
                    </Message>
                </F>
            );
        const d = new Date(currentOffer.timestamp);

        let modal;

        if (showDelete)
            return (
                <Modal
                    onSave={doDelete}
                    onClose={() => setShowDelete(false)}
                    onCancel={() => setShowDelete(false)}
                    saveType="danger"
                    save={
                        <Trans id="invitation-accepted.delete.confirm">
                            Bestätigen
                        </Trans>
                    }
                    cancel={
                        <Trans id="invitation-accepted.delete.cancel">
                            Abbrechen
                        </Trans>
                    }
                    title={
                        <Trans id="invitation-accepted.delete.title">
                            Termin absagen
                        </Trans>
                    }
                    className="kip-appointment-overview"
                >
                    <p>
                        <Trans id="invitation-accepted.delete.notice">
                            Willst du den Termin wirklich absagen?
                        </Trans>
                    </p>
                </Modal>
            );

        return (
            <F>
                <CardContent>
                    {notice}
                    <div className="kip-accepted-invitation">
                        <h2>
                            <Trans id="invitation-accepted.title">
                                Termin bestätigt!
                            </Trans>
                        </h2>
                        <ProviderDetails data={invitationData.provider} />
                        <OfferDetails offer={currentOffer} />
                        <p className="kip-appointment-date">
                            {d.toLocaleDateString()} ·{' '}
                            <u>{d.toLocaleTimeString()}</u>
                        </p>
                        <p className="kip-booking-code">
                            <span>
                                <Trans id={'invitation-accepted.booking-code'}>
                                    Buchungscode zur Vorlage: Bitte notieren!
                                </Trans>
                            </span>
                            {userSecret.data.slice(0, 4)}
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="warning" onClick={() => setShowDelete(true)}>
                        <Trans id="cancel-appointment">Termin absagen</Trans>
                    </Button>
                </CardFooter>
            </F>
        );
    },
    [userSecret, acceptedInvitation, cancelInvitation, invitation, tokenData]
);

const NoInvitations = ({ tokenData }) => {
    let createdAt;

    if (tokenData.createdAt !== undefined)
        createdAt = new Date(tokenData.createdAt);

    let content;

    // in the first 10 minutes since the creation of the token we show a 'please wait'
    // message, as it can take some time for appointments to show up...
    if (
        createdAt !== undefined &&
        new Date(createdAt.getTime() + 1000 * 60 * 10) > new Date()
    ) {
        content = (
            <F>
                <Message type="success">
                    <Trans id="no-invitations.please-wait">
                        Deine Daten wurden im System gespeichert. Falls Termine
                        in deiner Nähe verfügbar sind, werden diese in wenigen
                        Minuten hier angezeigt.
                    </Trans>
                </Message>
            </F>
        );
    } else {
        content = (
            <F>
                <Message type="warning">
                    <Trans id="no-invitations.notice">
                        Im Moment sind scheinbar keine Termine in Deiner
                        Umgebung verfügbar, oder leider bereits ausgebucht.
                        Bitte schau ab jetzt regelmäßig hier vorbei. Sobald neue
                        Termine in Deiner Nähe verfügbar sind, werden sie Dir
                        hier angezeigt.
                    </Trans>
                </Message>
            </F>
        );
    }
    return (
        <F>
            <CardContent>
                <div className="kip-no-invitations">{content}</div>
            </CardContent>
            <Message type="info">
                <ButtonIcon icon="circle-notch fa-spin" /> &nbsp;
                <Trans id="no-invitations.update-notice">
                    Diese Seite wird automatisch aktualisiert...
                </Trans>
            </Message>
        </F>
    );
};

async function toggleOffers(state, keyStore, settings, offer, offers) {
    if (offer === null) return { data: [] };
    if (state.data.find(i => i === offer.id) !== undefined) {
        state.data = state.data.filter(i => i !== offer.id);
    } else {
        state.data.push(offer.id);
    }
    // we remove non-existing offers
    state.data = state.data.filter(i =>
        offers.map(offer => offer.id).includes(i)
    );
    return { data: state.data };
}

toggleOffers.init = function() {
    return { data: [] };
};

toggleOffers.actionName = 'toggleOffers';

const PropertyTags = ({ appointment }) => {
    let props;
    props = Object.entries(appointment.properties)
        .map(([, v]) => <PropertyTag key={v} property={v} />)
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
            userSecret,
            toggleOffers,
            toggleOffersAction,
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
                toggleOffersAction(offer, data.offers);
            };

            const doConfirmOffers = () => {
                const selectedOffers = [];
                // we add the selected offers in the order the user chose
                for (const offerID of toggleOffers.data) {
                    const offer = data.offers.find(
                        offer => offer.id === offerID
                    );
                    selectedOffers.push(offer);
                }
                setConfirming(true);
                const p = confirmOffersAction(
                    selectedOffers,
                    data,
                    tokenData.data
                );
                p.then(() => {
                    acceptedInvitationAction();
                });
                p.finally(() => {
                    setConfirming(false);
                    toggleOffersAction(null);
                });
            };

            let content;

            const properties = settings.get('appointmentProperties');
            // to do: use something better than the index i for the key?
            const offers = data.offers
                .filter(offer => offer.slotData.some(sl => sl.open))
                .filter(a => new Date(a.timestamp) > new Date())
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((offer, i) => {
                    const d = new Date(offer.timestamp);
                    const selected = toggleOffers.data.includes(offer.id);
                    let pref;
                    if (selected)
                        pref = toggleOffers.data.indexOf(offer.id) + 1;
                    return (
                        <tr
                            key={offer.id}
                            className={classNames(`kip-pref-${pref}`, {
                                'kip-selected': selected,
                                'kip-failed': false,
                            })}
                            onClick={() => toggle(offer)}
                        >
                            <td>{selected ? pref : '-'}</td>
                            <td>
                                {d.toLocaleString('de-DE', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td>{formatDuration(offer.duration)}</td>
                            <td>
                                <PropertyTags appointment={offer} />
                            </td>
                        </tr>
                    );
                });

            let offerDetails;

            if (offers.length === 0)
                offerDetails = (
                    <Message type="warning">
                        <Trans id="no-offers-anymore">
                            Alle Terminangebote sind bereits abgelaufen. Bitte
                            hab' etwas Geduld, du wirst voraussichtlich neue
                            Angebote erhalten.
                        </Trans>
                    </Message>
                );
            else
                offerDetails = (
                    <table className="bulma-table bulma-is-striped bulma-is-fullwidth">
                        <thead>
                            <tr>
                                <th>
                                    <Trans id="appointment-preference">
                                        Rang
                                    </Trans>
                                </th>
                                <th>
                                    <Trans id="appointment-date">Datum</Trans>
                                </th>
                                <th>
                                    <Trans id="appointment-duration">
                                        Dauer
                                    </Trans>
                                </th>
                                <th>
                                    <Trans id="appointment-vaccine">
                                        Impfstoff
                                    </Trans>
                                </th>
                            </tr>
                        </thead>
                        <tbody>{offers}</tbody>
                    </table>
                );

            return (
                <F>
                    <CardContent>
                        <div className="kip-invitation-details">
                            <ProviderDetails data={data.provider} />
                            <p>
                                <Trans id="appointments-notice">
                                    Bitte wähle alle für Dich passenden Termine
                                    aus und bestätige anschließend Deine
                                    Auswahl. Beachte bitte, dass du pünktlich
                                    zum Termin erscheinst. Die angegebene Dauer
                                    entspricht dem maximal zu erwartenden
                                    Zeitbedarf.
                                </Trans>
                            </p>
                            {offerDetails}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            waiting={confirming}
                            onClick={doConfirmOffers}
                            disabled={
                                confirming ||
                                Object.keys(
                                    toggleOffers.data.filter(id =>
                                        data.offers.find(of => of.id === id)
                                    )
                                ).length === 0
                            }
                            type="success"
                        >
                            <Trans id="confirm-appointment">
                                Terminauswahl bestätigen
                            </Trans>
                        </Button>
                    </CardFooter>
                </F>
            );
        },
        [toggleOffers, confirmOffers, acceptedInvitation, userSecret]
    )
);

const filterInvitations = invitation => {
    if (invitation.offers === null) return false;
    const expired = true;
    let noOpenSlots = false;

    if (noOpenSlots) {
        return false;
    }

    return true;
};

const Appointments = withActions(
    ({ settings, invitation, appointments, acceptedInvitation, tokenData }) => {
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
            if (initialized) return;
            setInitialized(true);
        });

        const render = () => {
            let invitations = [];

            if (appointments !== undefined && appointments.data !== null)
                for (const appointment of appointments.data)
                    invitations.push(appointment);

            if (invitation !== undefined && invitation.data !== null)
                for (const offer of invitation.data) {
                    if (
                        invitations.some(
                            inv => inv.provider.name === offer.provider.name
                        )
                    )
                        continue;
                    invitations.push(offer);
                }

            if (
                acceptedInvitation !== undefined &&
                acceptedInvitation.data !== null
            ) {
                const ai = invitations.find(inv => {
                    if (inv === null) return false;
                    return inv.offers.some(offer =>
                        offer.slotData.some(sla =>
                            acceptedInvitation.data.offer.slotData.some(
                                slb => slb.id === sla.id
                            )
                        )
                    );
                });
                if (ai === undefined) return <InvitationDeleted />;
                return <AcceptedInvitation offers={ai.offers} />;
            }

            // we only show relevant invitations
            invitations = invitations.filter(inv =>
                filterInvitations(inv, acceptedInvitation)
            );

            if (invitations.length === 0)
                return <NoInvitations tokenData={tokenData.data} />;

            const details = invitations.map(data => (
                <InvitationDetails
                    tokenData={tokenData}
                    data={data}
                    key={data.provider.signature}
                />
            ));

            return <F>{details}</F>;
        };
        return (
            <WithLoader
                resources={[tokenData, invitation, appointments]}
                renderLoaded={render}
            />
        );
    },
    [tokenData, invitation, appointments, acceptedInvitation]
);

export default Appointments;
