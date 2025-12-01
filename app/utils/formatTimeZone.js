import { format, add } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const formatWithTimezone = (
    date,
    formatStr = 'HH:mm',
    timeZone = 'America/Sao_Paulo',
    addHours = 3
) => {
    if (!date) return null;
    const zonedDate = toZonedTime(date, timeZone);

    const adjustedDate = add(zonedDate, { hours: addHours });

    return format(adjustedDate, formatStr);
};
