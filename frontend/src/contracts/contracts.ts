// Import ABIs
import WordleABI from "./abi/SimpleWordle.json";

export const contracts = {
    SimpleWordle: {
        address: "0xAD73a6e6a6f740ECCC8801EC87bc1591d0627544" as const,
        deploymentTxHash:
            "0x155e99e652e8682eb484eae8bf66fcd46f7d3a2360f1195a9251d3549e8d28ee",
        blockNumber: 22144040,
        abi: WordleABI,
    },
} as const;

// Type exports
export type ContractName = keyof typeof contracts;
export type Contracts = typeof contracts;

// Helper functions
export function getContract<T extends ContractName>(name: T): Contracts[T] {
    return contracts[name];
}

export function getContractAddress(name: ContractName): string {
    return contracts[name].address;
}

export function getContractABI(name: ContractName) {
    return contracts[name].abi;
}

// Re-export specific contract for convenience
export const WORDLE_ADDRESS =
    "0xAD73a6e6a6f740ECCC8801EC87bc1591d0627544" as const;
export const WORDLE_ABI = WordleABI;
