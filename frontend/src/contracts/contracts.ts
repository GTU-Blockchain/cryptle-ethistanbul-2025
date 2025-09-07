// Import ABIs
import WordleABI from "./abi/SimpleWordle.json";

export const contracts = {
    SimpleWordle: {
        address: "0x918E6F1c285303C446F882189b05b24df6895ba9" as const,
        deploymentTxHash:
            "0xd88c7ef8373b575c83b601129cf997f5d4fef2c285831d80aacfaad20903b51d",
        blockNumber: 22146801,
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
    "0x918E6F1c285303C446F882189b05b24df6895ba9" as const;
export const WORDLE_ABI = WordleABI;
