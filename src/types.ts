export interface Message {
  messageType: string;
  data?: unknown;
}

export interface ContextMenuMessage extends Message {
  readonly messageType: "context-menu";
  tabId?: number;
  data?: CommentInfo & UserInfo;
}

export interface BlockCommentMessage extends Message {
  readonly messageType: "block-comment";
  data: null;
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
  readonly commentId?: number;
  username: string;
}

export interface AuditableRecord {
  createdOn: Date;
}
