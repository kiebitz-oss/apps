// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserAppointmentsTokenDataWithSignedToken } from '../../../../kiebitz/user/queue';

export async function submitToQueue(state, keyStore, settings, contactData, queueData, queue, userSecret) {
  try {
    keyStore.set({ status: 'submitting' });
    const tokenData = getUserAppointmentsTokenDataWithSignedToken(contactData, queueData, queue, userSecret);

    return {
      data: tokenData,
      status: 'succeeded'
    };
  } catch (error) {
    return {
      status: 'failed',
      error
    };
  }
}

submitToQueue.reset = () => ({ status: 'initialized' });

submitToQueue.actionName = 'submitToQueue';
