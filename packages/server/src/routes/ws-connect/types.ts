export interface WebSocketParams {
    Params: {
      playerId: string;
    };
  }
  
  export type Message = {
    topic: "test" | "clients__update" | "room__outcome" | "rat__death" | "chat__message"
    message: string;
    timestamp: number;
  }