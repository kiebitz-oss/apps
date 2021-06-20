import { Slot, Vaccine } from '@/types';
import { SlotsByDay } from '@/hooks/useAvailableUserSlots';
import { SortingDirection } from './sort';

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

export type MultidimensionalTuple = [key: any, value: any | any[]];
export type SortingFunction = (t: any, t2: any) => 1 | 0 | -1;

export const mergeMultiDimensionalTupleMap = (
    tuple: MultidimensionalTuple,
    tuples: MultidimensionalTuple[],
    sorters: SortingFunction[]
): MultidimensionalTuple[] => {
    const [key, value] = tuple;
    const [sort, ...restSorters] = sorters;

    debugger;

    // An element that is equal or greater.
    const index = tuples.findIndex(([_key]) => {
        const sortingIndex = sort(_key, key);
        return sortingIndex !== -1;
    });

    const [_toBeUpdatedKey, _toBeUpdatedValue]: MultidimensionalTuple = tuples[index] ?? [undefined, undefined];
    const isUpdate = !!_toBeUpdatedKey && sort(_toBeUpdatedKey, key) === 0;

    const areValuesTuples =
        Array.isArray(value) &&
        value.length === 2 &&
        Array.isArray(_toBeUpdatedValue) &&
        _toBeUpdatedValue.length === 2;

    if (isUpdate) {
        const nextTuple: MultidimensionalTuple = [
            key,
            areValuesTuples
                ? // @ts-ignore
                  mergeMultiDimensionalTupleMap(value, [_toBeUpdatedValue], restSorters)
                : [_toBeUpdatedValue, ...value],
        ];
        tuples.splice(index, 1, nextTuple);
        return [...tuples];
    }

    if (index === -1) {
        return [...tuples, tuple];
    }

    tuples.splice(index, 0, tuple);
    return [...tuples];
};

export const updateOrInsertByFindIndex = <T>(
    nextItem: T,
    array: T[],
    sort: (t: T, t2: T) => -1 | 0 | 1,
    dir: SortingDirection = SortingDirection.ASCENDING
): T[] => {
    const insertionOrUpdateIndex = array.findIndex((t) => {
        // As if we're adding it to the beginning.
        const sortingIndex = sort(t, nextItem);
        return sortingIndex === 0 || dir === SortingDirection.ASCENDING ? sortingIndex === -1 : sortingIndex === 1;
    });

    // We insert if we couldn't find an index or the items are not equal.
    const toBeUpdated = array[insertionOrUpdateIndex];
    const isInsertion = insertionOrUpdateIndex === -1 || (toBeUpdated && sort(toBeUpdated, nextItem) !== 0);

    if (isInsertion) {
        if (insertionOrUpdateIndex === -1) {
            return [...array, nextItem];
        } else {
            array.splice(insertionOrUpdateIndex, 0, nextItem);
            return [...array];
        }
    } else {
        array.splice(insertionOrUpdateIndex, 1, nextItem);
        return [...array];
    }
};
