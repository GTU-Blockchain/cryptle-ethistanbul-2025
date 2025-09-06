import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { porto } from "porto/wagmi";
import { embeddedWalletConnector } from "./wagmi-embedded-connector";
import { RISE_TESTNET, RISE_RPC_URL } from "@/config/chain";
import { appConfig } from "@/config/app";
import { riseTestnetConfig } from "rise-wallet";

// Re-export for backward compatibility
export const riseTestnet = RISE_TESTNET;

// Build connectors array based on config
const connectors = appConfig.wallet.embeddedOnly
    ? [
          embeddedWalletConnector({
              name: "Browser Wallet",
              shimDisconnect: true,
          }),
          porto(riseTestnetConfig),
      ]
    : [
          injected(),
          porto(riseTestnetConfig),
          embeddedWalletConnector({
              name: "Browser Wallet",
              shimDisconnect: true,
          }),
      ];

// Create wagmi config
export const wagmiConfig = createConfig({
    chains: [RISE_TESTNET],
    connectors,
    transports: {
        [RISE_TESTNET.id]: http(RISE_RPC_URL),
    },
    ssr: true, // Enable SSR support
});
