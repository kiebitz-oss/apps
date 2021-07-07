import settings, { Settings } from 'helpers/settings';

// @ts-ignore
import staticSettings from '../../../src/web/static/settings.json';

for (const key in staticSettings) {
    settings.set(key, staticSettings[key]);
}

export { Settings };
export default settings;
