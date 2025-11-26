import type { ChainConfig } from "./constants";

export type Lane = {
  chain: ChainConfig;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: "vertical" | "horizontal";
  accumulator: number;
  totalTx: number;
};
