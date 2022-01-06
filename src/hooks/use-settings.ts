import { SettingsContext } from 'components/contexts';
import Settings from 'helpers/settings';
import { useContext } from 'react';

export const useSettings = (): Settings => {
    return useContext(SettingsContext)! as Settings;
};
