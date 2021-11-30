import { useSettings } from 'hooks';

export const useBackend = () => {
    const settings = useSettings();

    return settings.get('backend');
};
