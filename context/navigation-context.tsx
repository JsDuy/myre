"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type NavigationContextType = {
  selectedIndex: number;
  setIndex: (index: number) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <NavigationContext.Provider
      value={{ selectedIndex, setIndex: setSelectedIndex }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context)
    throw new Error("useNavigation must be used within NavigationProvider");
  return context;
};
