export interface Message {
  messageType: string;
  data?: unknown;
}

export interface ContextMenuMessage extends Message {
  readonly messageType: "context-menu";
  data?: CommentInfo & UserInfo;
}

export interface CommentInfo {
  comment: string;
  videoId: string;
}

export interface UserInfo {
  username: string;
  profilePictureUrl: string;
}
