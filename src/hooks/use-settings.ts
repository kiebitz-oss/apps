import { SettingsContext } from 'components/contexts';
import { useContext } from 'react';

interface KbSettings {
    get(key: string): string
}

export const useSettings = (): KbSettings => {
    return useContext(SettingsContext) as KbSettings;
};