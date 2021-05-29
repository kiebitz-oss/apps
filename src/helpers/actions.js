// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export function markAsLoading(state, keyStore) {
    if (state !== undefined) {
        if (state.status === 'updating' || state.status === 'loading')
            return false;
        else if (state.status === 'loaded')
            keyStore.set({ status: 'updating', data: state.data });
        else keyStore.set({ status: 'loading' });
    } else {
        keyStore.set({ status: 'loading' });
    }
    return true;
}
