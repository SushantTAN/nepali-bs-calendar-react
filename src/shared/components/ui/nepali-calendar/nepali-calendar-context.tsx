import React, { createContext, useContext, useMemo, ReactNode } from 'react';

import { createNepaliDateUtils, type NepaliDateUtils } from './nepali-date-utils';

export interface CalendarData {
  ref_ad: string;
  ref_bs: string;
  years: Record<number, number[]>;
}

interface NepaliCalendarContextType {
  data: CalendarData;
  dateUtils: NepaliDateUtils;
}

const NepaliCalendarContext = createContext<NepaliCalendarContextType | undefined>(undefined);

export const useNepaliCalendarContext = () => {
  const context = useContext(NepaliCalendarContext);
  if (!context) {
    throw new Error('useNepaliCalendarContext must be used within a NepaliCalendarProvider');
  }
  return context;
};

export const useNepaliDateUtils = () => {
  return useNepaliCalendarContext().dateUtils;
};

interface NepaliCalendarProviderProps {
  data: CalendarData;
  children: ReactNode;
}

export const NepaliCalendarProvider: React.FC<NepaliCalendarProviderProps> = ({ data, children }) => {
  const dateUtils = useMemo(() => createNepaliDateUtils(data), [data]);

  const value = useMemo(() => ({ data, dateUtils }), [data, dateUtils]);

  return (
    <NepaliCalendarContext.Provider value={value}>
      {children}
    </NepaliCalendarContext.Provider>
  );
};
