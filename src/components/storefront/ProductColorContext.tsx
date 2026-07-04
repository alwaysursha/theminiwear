"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ProductColorContextValue = {
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
};

const ProductColorContext = createContext<ProductColorContextValue>({
  selectedColor: null,
  setSelectedColor: () => {},
});

export function ProductColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const value = useMemo(
    () => ({ selectedColor, setSelectedColor }),
    [selectedColor],
  );
  return (
    <ProductColorContext.Provider value={value}>
      {children}
    </ProductColorContext.Provider>
  );
}

export function useProductColor() {
  return useContext(ProductColorContext);
}
