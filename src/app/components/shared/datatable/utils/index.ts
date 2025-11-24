import type { Row } from '@tanstack/react-table';

export const dateRangeFilter = (
  row: Row<any>,
  columnId: string,
  value: any
) => {
  const dateValue = row.getValue(columnId);
  const { from, to } = value || {};

  if (!from && !to) return true;
  if (!dateValue) return false;

  const rowDate = new Date(dateValue as string | number);

  if (to) {
    return rowDate >= from && rowDate <= to;
  }

  return rowDate >= from;
};
