// returns or updates the schedule
export async function schedule(state, keyStore, settings, data) {
    const backend = settings.get('backend');
    let schedule = backend.local.get('provider::schedule');
    if (data !== null) {
        schedule = data;
        backend.local.set('provider::schedule', schedule);
    }
    return {
        status: 'loaded',
        data: schedule,
    };
}
