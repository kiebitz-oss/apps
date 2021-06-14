import settings, { Settings } from 'helpers/settings';
import Fixtures from 'testing/fixtures';

// @ts-ignore
import staticSettings from '../../../src/web/static/settings.json';

for (const key in staticSettings) {
    settings.set(key, staticSettings[key]);
}

settings.update(new Settings([['fixtures', Fixtures]]));

export { Settings };
export default settings;
