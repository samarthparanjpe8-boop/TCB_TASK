/** Normalize to UTC midnight for the given calendar day (YYYY-MM-DD in UTC). */
export function utcDayStart(isoDate) {
    const d = new Date(`${isoDate}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime()))
        throw new Error("Invalid date");
    return d;
}
