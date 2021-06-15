export const getReadableTimeFromDate = (date: Date, locale?: string, options?: Intl.DateTimeFormatOptions): string => {
    return date.toLocaleTimeString(locale ?? 'de-DE', options);
};

export const getReadableTimeFromTimestamp = (
    timestamp: number,
    locale?: string,
    options?: Intl.DateTimeFormatOptions
): string => getReadableTimeFromDate(new Date(timestamp), locale, options);

export const getReadableDateFromDate = (date: Date, locale?: string, options?: Intl.DateTimeFormatOptions): string => {
    return date.toLocaleDateString(locale ?? 'de-DE', options);
};

export const getReadableDateFromTimestamp = (
    timestamp: number,
    locale?: string,
    options?: Intl.DateTimeFormatOptions
): string => getReadableDateFromDate(new Date(timestamp), locale, options);
