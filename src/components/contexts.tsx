// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';

// we define contexts separately to avoid circular imports (e.g. settings->store->settings)
export const SettingsContext = React.createContext(null);
export const StoreContext = React.createContext(null);
