export interface Message {
  messageType: string;
  data: unknown;
}

export interface ContextMenuMessage extends Message {
  readonly messageType: "context-menu";
  data: {
    commentElement: HTMLElement;
    username: string;
    profilePictureUrl: string;
    video: string;
  };
}

function extractUserInfoFromBody(body: Element) {
  const usernameElement = body.querySelector(
    "#author-text"
  ) as HTMLAnchorElement;
  const profilePictureElement = body.querySelector("#img") as HTMLImageElement;
  const commentElementParent = body.querySelector("#content-text");
  const commentElement = commentElementParent?.querySelector(
    "span"
  ) as HTMLSpanElement;

  if (!usernameElement || !commentElement) {
    return;
  }

  const username = usernameElement.href?.substring(
    usernameElement.href?.lastIndexOf("/") + 1
  );
  const profilePictureUrl = profilePictureElement.src;

  return { username, profilePictureUrl, commentElement };
}

function onContextMenu(ev: MouseEvent) {
  const e = ev.target as HTMLElement;
  const body = e.closest("#body");

  if (!body) {
    return;
  }

  extractUserInfoFromBody(body);
}

document.addEventListener("contextmenu", onContextMenu);
