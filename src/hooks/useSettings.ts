import { SettingsContext } from 'contexts';
import { useContext } from 'react';

export const useSettings = () => {
    return useContext(SettingsContext);
};
