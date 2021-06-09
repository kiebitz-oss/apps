// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserTokenData } from '../../../../kiebitz/user/token-data';

export async function tokenData(state, keyStore, settings) {
  return {
    status: 'loaded',
    data: await getUserTokenData()
  };
}

tokenData.actionName = 'tokenData';
