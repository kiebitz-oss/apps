import { useSettings } from 'hooks';

export const useServiceName = (): string => {
    const settings = useSettings();

    return settings?.get('title') || 'ServiceName not set';
};
