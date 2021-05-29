// generate and return the (local) verified provider data (if it exists)
export async function verifiedProviderData(state, keyStore, settings) {
    const backend = settings.get('backend');
    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock();
        let providerData = backend.local.get('provider::data::verified');
        return {
            status: providerData !== null ? 'loaded' : 'failed',
            data: providerData,
        };
    } finally {
        backend.local.unlock();
    }
}
