import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Launch",
  description: "Launch a pump.fun coin. Pay pays you in SOL. Burn buys $POS.",
};

const LaunchLayout = ({ children }: { children: ReactNode }) => children;

export default LaunchLayout;
