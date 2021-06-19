import { byDateAscSorter, byDateDescSorter } from '../../utils/sort';

describe('sort', () => {
    describe('byDateSorter', () => {
        const unsortedTimes = [{ date: '11:00' }, { date: '08:00' }, { date: '12:00' }, { date: '10:00' }];
        const ascendingTimes = [{ date: '08:00' }, { date: '10:00' }, { date: '11:00' }, { date: '12:00' }];

        it('sorts correctly', () => {
            expect(unsortedTimes.sort(byDateAscSorter('date'))).toStrictEqual(ascendingTimes);

            expect(unsortedTimes.sort(byDateDescSorter('date'))).toStrictEqual(ascendingTimes.reverse());
        });
    });
});
