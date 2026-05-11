import React, { createContext, useContext, ReactNode } from 'react';

export interface CalendarData {
  ref_ad: string;
  ref_bs: string;
  years: Record<number, number[]>;
}

interface NepaliCalendarContextType {
  data: CalendarData;
}

const NepaliCalendarContext = createContext<NepaliCalendarContextType | undefined>(undefined);

export const useNepaliCalendarContext = () => {
  const context = useContext(NepaliCalendarContext);
  if (!context) {
    throw new Error('useNepaliCalendarContext must be used within a NepaliCalendarProvider');
  }
  return context;
};

interface NepaliCalendarProviderProps {
  data: CalendarData;
  children: ReactNode;
}

export const NepaliCalendarProvider: React.FC<NepaliCalendarProviderProps> = ({ data, children }) => {
  return (
    <NepaliCalendarContext.Provider value={{ data }}>
      {children}
    </NepaliCalendarContext.Provider>
  );
};
