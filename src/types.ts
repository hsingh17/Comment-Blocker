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
  profilePictureUrl?: string;
}

export interface UserRecord extends UserInfo, AuditableRecord {
  blockedInd: "Y" | "N";
}

export interface CommentRecord extends CommentInfo, AuditableRecord {
  commentId: number;
  username: string;
}

export interface AuditableRecord {
  createdOn?: Date;
}
