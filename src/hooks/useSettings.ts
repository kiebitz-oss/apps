import { SettingsContext } from 'components/contexts';
import { useContext } from 'react';

export const useSettings = () => {
    return useContext(SettingsContext);
};
