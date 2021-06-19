export type SortingFunction = (a: any, b: any) => number;

export enum SortingDirection {
    ASCENDING = 'asc',
    DESCENDING = 'desc',
}

export const byNumericAscSorter =
    (key: string): SortingFunction =>
    (a: any, b: any): number => {
        if (a[key] === b[key]) return 0;
        return a[key] < b[key] ? -1 : 1;
    };

export const byNumericDescSorter =
    (key: string): SortingFunction =>
    (a: any, b: any): number => {
        if (a[key] === b[key]) return 0;
        return a[key] > b[key] ? -1 : 1;
    };

export const byDateAscSorter =
    (key: string): SortingFunction =>
    (a: any, b: any): number => {
        // TODO: Add type guard.
        const dateA: Date = a[key] as Date;
        const dateB: Date = b[key] as Date;

        if (dateA.getTime() === dateB.getTime()) return 0;
        return dateA < dateB ? -1 : 1;
    };

export const byDateDescSorter =
    (key: string): SortingFunction =>
    (a: any, b: any): number => {
        // TODO: Add type guard.
        const dateA: Date = a[key] as Date;
        const dateB: Date = b[key] as Date;

        if (dateA.getTime() === dateB.getTime()) return 0;
        return dateA > dateB ? -1 : 1;
    };

export const byDateSorter = (
    key: string,
    direction: SortingDirection = SortingDirection.ASCENDING
): SortingFunction => {
    return direction === SortingDirection.ASCENDING ? byDateAscSorter(key) : byDateDescSorter(key);
};

export const byNumericSorter = (
    key: string,
    direction: SortingDirection = SortingDirection.ASCENDING
): SortingFunction => {
    return direction === SortingDirection.ASCENDING ? byNumericAscSorter(key) : byNumericDescSorter(key);
};
