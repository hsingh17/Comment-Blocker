///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Globals
///////////////////////////////////////////////////////////////////////////

import type { ContextMenuMessage } from "../types";

///////////////////////////////////////////////////////////////////////////
const EMOJI_REGEX = /\p{Emoji}/u;

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
function isEmoji(text: string) {
  return EMOJI_REGEX.test(text);
}

function extractComment(commentElement: HTMLSpanElement): string {
  let comment = "";
  for (const node of commentElement.childNodes) {
    const child = node as HTMLElement;
    if (child.textContent) {
      comment += child.textContent;
      continue;
    }

    const img = child.querySelector("img");
    if (img?.alt) {
      if (isEmoji(img.alt)) {
        comment += img.alt;
      } else {
        comment += ":" + img.alt + ": ";
      }
    }
  }

  return comment;
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
  const comment = extractComment(commentElement);

  return { username, profilePictureUrl, comment };
}

function onMouseDown(ev: MouseEvent) {
  // Not right click
  if (ev.button !== 2) {
    return;
  }

  const message: ContextMenuMessage = {
    messageType: "context-menu"
  };
  const e = ev.target as HTMLElement;
  const body = e.closest("#body");

  if (!body) {
    browser.runtime.sendMessage(message);
    return;
  }

  const info = extractUserInfoFromBody(body);
  const videoId = e.baseURI.substring(e.baseURI.lastIndexOf("?") + 1);
  if (!info) {
    browser.runtime.sendMessage(message);
    return;
  }

  message.data = {
    comment: info.comment,
    username: info.username,
    profilePictureUrl: info.profilePictureUrl,
    videoId: videoId
  };

  browser.runtime.sendMessage(message);
}

document.addEventListener("mousedown", onMouseDown);
