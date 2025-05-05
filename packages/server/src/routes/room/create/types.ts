export type CreateRoomBody = {
    signature: string;
    roomPrompt: string;
    roomLevel: number;
}

export type Room = {
    id: string,
    prompt: string;
    balance: number;
}