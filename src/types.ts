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
}

export interface BlockUserMessage extends Message {
  readonly messageType: "block-user";
  data: UserInfo;
}

export interface CheckBlockedUsersMessage extends Message {
  readonly messageType: "check-blocked-users";
  data: string[];
}

export interface CheckBlockedUsersResponse {
  username: string;
  blocked: boolean;
}

export interface NavigateToNewVideoMessage extends Message {
  readonly messageType: "navigate-new-video";
  data: Set<string>;
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
