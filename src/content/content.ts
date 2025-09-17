// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support
if (typeof browser === "undefined") {
  // @ts-expect-error Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Globals
///////////////////////////////////////////////////////////////////////////

import type { ContextMenuMessage, Message } from "../types";

///////////////////////////////////////////////////////////////////////////
const EMOJI_REGEX = /\p{Emoji}/u;

let SELECTED_ELEMENT: Element | null;

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

function extractUserInfoFromBody(body: Element | null) {
  if (!body) {
    return;
  }

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

function sendMessageAndSetSelected(
  message: Message,
  selectedElement: Element | null
) {
  browser.runtime.sendMessage(message);
  SELECTED_ELEMENT = selectedElement;
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
  const info = extractUserInfoFromBody(body);
  const url = new URL(e.baseURI);
  const videoId = url.searchParams.get("v");

  if (!info) {
    sendMessageAndSetSelected(message, null);
    return;
  }

  message.data = {
    comment: info.comment,
    username: info.username,
    profilePictureUrl: info.profilePictureUrl,
    videoId: videoId!
  };

  sendMessageAndSetSelected(message, body);
}

function removeCurrentlySelectedComment() {
  if (!SELECTED_ELEMENT) {
    return;
  }

  const threadElement = SELECTED_ELEMENT.closest("ytd-comment-thread-renderer");
  const replies = SELECTED_ELEMENT.closest("#replies");

  // If the current element is contained with a div with id "replies",
  // this is a reply comment so just remove the reply only. Otherwise remove the entire thread.
  if (replies) {
    SELECTED_ELEMENT.remove();
  } else {
    threadElement?.remove();
  }
}

function handleMessage(message: Message) {
  if (message.messageType === "block-comment") {
    removeCurrentlySelectedComment();
  }
}

document.addEventListener("mousedown", onMouseDown);
browser.runtime.onMessage.addListener(handleMessage);
