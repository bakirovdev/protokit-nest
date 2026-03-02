import * as FilterTypes from "../types";

export const SearchFilterTypeEnum = {
  BETWEEN_DATE: FilterTypes.BetweenDate,
  LIKE: FilterTypes.Like,
  EQUAL: FilterTypes.Equal,
  IN: FilterTypes.In
} as const;


export type SearchFilterTypeEnum = typeof SearchFilterTypeEnum[keyof typeof SearchFilterTypeEnum];