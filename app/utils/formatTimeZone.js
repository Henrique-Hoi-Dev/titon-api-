import { format, add } from 'date-fns';
import * as dateFnsTz from 'date-fns-tz';

export const formatWithTimezone = (date, formatStr = 'HH:mm', timeZone = 'America/Sao_Paulo', addHours = 3) => {
    if (!date) return null;
    const zonedDate = dateFnsTz.utcToZonedTime(date, timeZone);

    const adjustedDate = add(zonedDate, { hours: addHours });

    return format(adjustedDate, formatStr);
};
