export const getReadableTimeFromTimestamp = (
    timestamp: number,
    locale?: string,
    options?: Intl.DateTimeFormatOptions
): string => {
    return new Date(timestamp).toLocaleTimeString(locale ?? 'de-DE', options);
};

export const getReadableDateFromTimestamp = (
    timestamp: number,
    locale?: string,
    options?: Intl.DateTimeFormatOptions
): string => {
    return new Date(timestamp).toLocaleDateString(locale ?? 'de-DE', options);
};
