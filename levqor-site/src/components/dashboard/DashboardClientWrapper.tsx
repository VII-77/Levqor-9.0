"use client";

import { ReactNode } from "react";
import { LevqorBrainProvider } from "@/components/brain";

interface DashboardClientWrapperProps {
  children: ReactNode;
}

export default function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  return (
    <LevqorBrainProvider initialState="neural">
      {children}
    </LevqorBrainProvider>
  );
}
