// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { getUserSecret, initUserSecret, setUserSecret } from '../../../../kiebitz/user/user-secret';

export async function userSecret(state, keyStore, settings, data) {
  if (data !== undefined) {
    setUserSecret(data);
  }

  data = getUserSecret();

  if (data === null) {
    return {
      status: 'failed'
    };
  }

  return {
    status: 'loaded',
    data
  };
}

userSecret.init = (keyStore, settings) => {
  const data = initUserSecret();

  return {
    status: 'loaded',
    data
  };
};

userSecret.actionName = 'userSecret';
