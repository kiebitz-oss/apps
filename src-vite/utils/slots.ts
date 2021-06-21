import { Slot, Vaccine } from '@/types';

export const getSlotFromOffer = (offer: any): Slot => {
    const vaccines: Vaccine[] = [];

    for (const [key, value] of Object.entries(Vaccine)) {
        if (offer[value]) {
            vaccines.push(Vaccine[key]);
        }
    }

    return {
        id: offer.id,
        date: new Date(`${offer.date} ${offer.time}`),
        vaccines,
        duration: offer.duration,
        slotData: offer.slotData,
        grants: offer.grants,
    };
};

export const getReadableVaccine = (vaccine: Vaccine) => {
    switch (vaccine) {
        case Vaccine.COMIRNATY_BIONTECH_PFIZER:
            return 'Comirnaty (BioNTech/Pfizer)';
        case Vaccine.VAXZEVRIA_ASTRAZENECA:
            return 'Vaxzevria® (AstraZeneca)';
        case Vaccine.JANSSEN_JOHNSON_AND_JOHNSON:
            return 'Janssen® (Johnson & Johnson)';
        case Vaccine.COVID_19_VACCINE_MODERNA_MODERNA:
            return 'COVID-19 Vaccine Moderna® (Moderna)';
        default:
            return 'getReadableVaccine...💩';
    }
};

export type MultidimensionalTuple = [key: any, value: any[]];
export type SortingFunction = (t: any, t2: any) => 1 | 0 | -1;

export const mergeMultiDimensionalTupleMap = (
    newTuples: MultidimensionalTuple[],
    tuples: MultidimensionalTuple[],
    sorters: SortingFunction[]
): MultidimensionalTuple[] => {
    const [sort, ...restSorters] = sorters;

    let nextTuples = [...tuples];

    for (const tuple of newTuples) {
        const [key, value] = tuple;

        // An element that is equal or greater.
        const index = nextTuples.findIndex(([_key]) => sort(_key, key) !== -1);

        const [_toBeUpdatedKey, _toBeUpdatedValue]: MultidimensionalTuple = tuples[index] ?? [undefined, undefined];
        const isUpdate = !!_toBeUpdatedKey && sort(_toBeUpdatedKey, key) === 0;

        if (isUpdate) {
            const updatedTuple: MultidimensionalTuple = [
                key,
                restSorters.length
                    ? // @ts-ignore
                      mergeMultiDimensionalTupleMap(value, _toBeUpdatedValue, restSorters)
                    : [..._toBeUpdatedValue, ...value],
            ];

            nextTuples.splice(index, 1, updatedTuple);
            nextTuples = [...nextTuples];
            continue;
        }

        if (index === -1) {
            nextTuples = [...nextTuples, tuple];
            continue;
        }

        nextTuples.splice(index, 0, tuple);
        nextTuples = [...nextTuples];
    }

    return nextTuples;
};
