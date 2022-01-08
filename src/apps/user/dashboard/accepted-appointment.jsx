import React from 'react';

import { CardContent, CardFooter, Button, Modal } from 'components';

const AcceptedInvitation = () => {
    const [showDelete, setShowDelete] = useState(false);

    const doDelete = () => {
        setShowDelete(false);
        cancelInvitationAction(acceptedInvitation.data, tokenData.data).then(
            () => {
                // we reload the appointments
                invitationAction();
                acceptedInvitationAction();
            }
        );
    };

    const {
        offer,
        invitation: invitationData,
        slotData,
    } = acceptedInvitation.data;
    const currentOffer = offers.find((of) => of.id == offer.id);
    let currentSlotData;

    if (currentOffer !== undefined)
        currentSlotData = currentOffer.slotData.find(
            (sl) => sl.id === slotData.id
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
                    <T t={t} k="invitation-accepted.changed" />
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
                save={<T t={t} k="invitation-accepted.delete.confirm" />}
                cancel={<T t={t} k="invitation-accepted.delete.cancel" />}
                title={<T t={t} k="invitation-accepted.delete.title" />}
                className="kip-appointment-overview"
            >
                <p>
                    <T t={t} k="invitation-accepted.delete.notice" />
                </p>
            </Modal>
        );

    return (
        <F>
            <CardContent>
                {notice}
                <div className="kip-accepted-invitation">
                    <h2>
                        <T t={t} k="invitation-accepted.title" />
                    </h2>
                    <ProviderDetails data={invitationData.provider} />
                    <OfferDetails offer={currentOffer} />
                    <p className="kip-appointment-date">
                        {d.toLocaleDateString()} ·{' '}
                        <u>{d.toLocaleTimeString()}</u>
                    </p>
                    <p className="kip-booking-code">
                        <span>
                            <T t={t} k={'invitation-accepted.booking-code'} />
                        </span>
                        {userSecret.data.slice(0, 4)}
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="warning" onClick={() => setShowDelete(true)}>
                    <T t={t} k="cancel-appointment" />
                </Button>
            </CardFooter>
        </F>
    );
};
