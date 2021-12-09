// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { keys } from 'apps/provider/actions';
import {
    userSecret,
    backupData,
    queueData,
    tokenData,
    getAppointments,
    invitation,
    appointments,
    acceptedInvitation,
} from 'apps/user/actions';
import { withActions } from 'components';
import { useEffectOnce, useHarmonicIntervalFn } from 'react-use';
import { AcceptedInvitation } from './AcceptedInvitation';
import { DeletedInvitation } from './DeletedInvitation';
import { InvitationsList } from './InvitationsList';

const DashboardPage: React.FC<any> = ({
    userSecretAction,
    keysAction,
    backupDataAction,
    invitationAction,
    appointmentsAction,
    getAppointmentsAction,
    queueDataAction,
    tokenDataAction,
    invitation,
    appointments,
    acceptedInvitation,
    tokenData,
}) => {
    const refresh = () => {
        try {
            // we do this only once per timer interval...
            userSecretAction().then((us: any) =>
                tokenDataAction().then(() =>
                    keysAction().then((kd: any) =>
                        queueDataAction().then((qd: any) => {
                            getAppointmentsAction(qd.data, kd.data);
                            backupDataAction(us.data);
                            invitationAction();
                            appointmentsAction();
                        })
                    )
                )
            );
        } catch {
            refresh();
        }
    };

    useEffectOnce(refresh);
    useHarmonicIntervalFn(refresh, 10000);

    const invitations = appointments?.data.map((appointment) => appointment);

    if (invitation?.data) {
        for (const offer of invitation.data) {
            if (
                invitations.some(
                    (inv) => inv.provider.name === offer.provider.name
                )
            ) {
                continue;
            }

            invitations.push(offer);
        }
    }

    if (acceptedInvitation?.data) {
        const ai = invitations.find((inv) => {
            if (inv === null) {
                return false;
            }

            return inv.offers.some((offer: any) =>
                offer.slotData.some((sla: any) =>
                    acceptedInvitation.data.offer.slotData.some(
                        (slb: any) => slb.id === sla.id
                    )
                )
            );
        });

        if (ai === undefined) {
            return <DeletedInvitation />;
        }

        return <AcceptedInvitation offers={ai.offers} />;
    }

    return (
        <InvitationsList
            invitations={invitations}
            tokenData={tokenData?.data}
        />
    );
};

export default withActions(DashboardPage, [
    keys,
    invitation,
    appointments,
    queueData,
    tokenData,
    getAppointments,
    userSecret,
    backupData,
    tokenData,
    invitation,
    appointments,
    acceptedInvitation,
]);
