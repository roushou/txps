export type ChainConfig = {
  name: string;
  tps: number;
  color: string;
  speed: number;
  glow: number;
  enabled: boolean;
};

const DEFAULT_SPEED = 5;

export const CHAINS: ChainConfig[] = [
  {
    name: "Bitcoin",
    tps: 7,
    color: "#F7931A",
    speed: DEFAULT_SPEED,
    glow: 2,
    enabled: true,
  },
  {
    name: "Ethereum",
    tps: 20,
    color: "#627EEA",
    speed: DEFAULT_SPEED,
    glow: 3,
    enabled: true,
  },
  {
    name: "Base",
    tps: 180,
    color: "#0052FF",
    speed: DEFAULT_SPEED,
    glow: 2,
    enabled: true,
  },
  {
    name: "BSC",
    tps: 200,
    color: "#F0B90B",
    speed: DEFAULT_SPEED,
    glow: 3,
    enabled: false,
  },
  {
    name: "Solana",
    tps: 1000,
    color: "#14F195",
    // color: "#DC1FFF",
    speed: DEFAULT_SPEED,
    glow: 2,
    enabled: true,
  },
  {
    name: "Tron",
    tps: 150,
    color: "#FF0013",
    speed: DEFAULT_SPEED,
    glow: 2,
    enabled: false,
  },
  {
    name: "Avalanche",
    tps: 90,
    color: "#E84142",
    speed: DEFAULT_SPEED,
    glow: 2,
    enabled: false,
  },
  {
    name: "Near",
    tps: 100000,
    color: "#00C08B",
    speed: DEFAULT_SPEED,
    glow: 1,
    enabled: false,
  },
  {
    name: "Sui",
    tps: 50,
    color: "#6FBCF0",
    speed: DEFAULT_SPEED,
    glow: 1,
    enabled: false,
  },
  {
    name: "Aptos",
    tps: 50,
    color: "#4ECDC4",
    speed: DEFAULT_SPEED,
    glow: 1,
    enabled: false,
  },
  {
    name: "Polygon",
    tps: 190,
    color: "#8247E5",
    speed: DEFAULT_SPEED,
    glow: 4,
    enabled: false,
  },
  {
    name: "Arbitrum",
    tps: 50,
    color: "#28A0F0",
    speed: DEFAULT_SPEED,
    glow: 1,
    enabled: false,
  },
  {
    name: "TON",
    tps: 20,
    color: "#0088CC",
    speed: DEFAULT_SPEED,
    glow: 1,
    enabled: false,
  },
];
