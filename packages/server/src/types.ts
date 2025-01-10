export type Message = {
    role: 'system' | 'user' | 'function';
    content: string;
    name?: string; // Optional name property
}