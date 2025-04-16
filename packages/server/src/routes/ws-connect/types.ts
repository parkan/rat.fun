export interface WebSocketParams {
    Params: {
      playerId: string;
    };
  }
  
  export type Message = {
    topic: string;
    message: string;
  }