"use client";

import { createContext, useContext, type ReactNode } from "react";

export type DashboardContextValue = {
  role: string;
  userName: string;
  userEmail?: string | null;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

const DashboardProvider = ({
  value,
  children,
}: {
  value: DashboardContextValue;
  children: ReactNode;
}) => {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }

  return context;
};

export { DashboardProvider, useDashboard };
