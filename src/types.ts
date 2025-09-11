export interface Message {
  messageType: string;
  data?: unknown;
}

export interface ContextMenuMessage extends Message {
  readonly messageType: "context-menu";
  data?: {
    comment: string;
    username: string;
    profilePictureUrl: string;
    videoId: string;
  };
}
