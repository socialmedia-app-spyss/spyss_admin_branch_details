export const isPanchangaMonth = (value: string | null): value is string =>
  value !== null && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export const getPanchangaMonthRange = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1))
    .toISOString()
    .slice(0, 10);

  return {
    start: `${month}-01`,
    nextMonth,
  };
};
