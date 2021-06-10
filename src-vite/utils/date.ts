import { getDaysInMonth } from 'date-fns';

export const parseDate = (dateValue: string) => {
    const [dayString, monthString, yearString] = dateValue.split('.');
    const [day, month, year] = [dayString, monthString, yearString].map(parseFloat);
    const indexedMonth = month - 1;
    if (indexedMonth < 0 || indexedMonth > 11) throw new Error('Invalid date');

    const indexedYear = year > 1999 ? year : year - 1900;
    const daysInMonth = getDaysInMonth(new Date(indexedYear, indexedMonth));
    if (day > daysInMonth || day === 0) throw new Error('Invalid date');

    const actualBirthDate = new Date(indexedYear, indexedMonth, day);
    if (isNaN(actualBirthDate.getTime())) throw new Error('Invalid date');
    return {
        year: yearString,
        month: monthString,
        day: dayString,
    };
};
