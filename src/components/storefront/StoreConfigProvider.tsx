"use client";

import { createContext, useContext, useEffect } from "react";
import { setRuntimeStoreCurrency } from "@/lib/currency";

const StoreConfigContext = createContext({ currency: "CAD" });

export function StoreConfigProvider({
  currency,
  children,
}: {
  currency: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    setRuntimeStoreCurrency(currency);
  }, [currency]);

  return (
    <StoreConfigContext.Provider value={{ currency }}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreCurrency() {
  return useContext(StoreConfigContext).currency;
}
