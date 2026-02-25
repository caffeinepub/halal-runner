import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScoreEntry {
    nickname: string;
    coins: bigint;
    score: bigint;
}
export interface backendInterface {
    getLeaderboard(limit: bigint): Promise<Array<ScoreEntry>>;
    submitScore(nickname: string, score: bigint, coins: bigint): Promise<void>;
}
