// Import ABIs
import WordleABI from "./abi/SimpleWordle.json";

export const contracts = {
    SimpleWordle: {
        address: "0x58496dF0e6eBb54680c4DA82cf0B8B9097E31A2F" as const,
        deploymentTxHash:
            "0x45c985f1fcfb2fea9b2e8c9efc590c0059d9e4b872111019cba9abbbadb890a5",
        blockNumber: 22131856,
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
    "0x58496dF0e6eBb54680c4DA82cf0B8B9097E31A2F" as const;
export const WORDLE_ABI = WordleABI;
