// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#browser_support
if (typeof browser === "undefined") {
  // @ts-expect-error Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Globals
///////////////////////////////////////////////////////////////////////////

import type { BlockUserMessage, ContextMenuMessage, Message } from "../types";

///////////////////////////////////////////////////////////////////////////
const EMOJI_REGEX = /\p{Emoji}/u;

let SELECTED_ELEMENT: HTMLDivElement | null;
let COMMENT_ELEMENTS: Element[] | null;

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

function extractUserInfoFromBodyElement(body: Element | null) {
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
  bodyElement: HTMLDivElement | null
) {
  browser.runtime.sendMessage(message);
  SELECTED_ELEMENT = bodyElement;
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
  const body = e.closest("#body") as HTMLDivElement;
  const info = extractUserInfoFromBodyElement(body);
  const url = new URL(e.baseURI);
  const videoPath = url.pathname;
  let videoId;

  if (videoPath.indexOf("shorts")) {
    videoId = videoPath.substring(videoPath.lastIndexOf("/") + 1);
  } else if (url.searchParams.has("v")) {
    videoId = url.searchParams.get("v");
  }

  if (!info || !videoId) {
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

function removeBodyElement(bodyElement: HTMLDivElement | null) {
  if (!bodyElement) {
    return;
  }

  const threadElement = bodyElement.closest("ytd-comment-thread-renderer");
  const replies = bodyElement.closest("#replies");

  // If the current element is contained with a div with id "replies",
  // this is a reply comment so just remove the reply only. Otherwise remove the entire thread.
  if (replies) {
    bodyElement.remove();
  } else {
    threadElement?.remove();
  }
}

function removeAllCommentsFromUsers(usernames: Set<string>) {
  if (!COMMENT_ELEMENTS) {
    return;
  }

  for (const content of COMMENT_ELEMENTS) {
    const body = content.querySelector("#body") as HTMLDivElement;
    const info = extractUserInfoFromBodyElement(body);
    console.log(info?.username);

    if (info?.username && usernames.has(info?.username)) {
      removeBodyElement(body);
    }
  }
}

function assignPageBodyElements() {
  const comments = document.querySelector("#comments");
  const contents = comments?.querySelector("#contents");
  if (!contents) {
    return;
  }

  COMMENT_ELEMENTS = Array.of(...contents.querySelectorAll("#body"));
  console.log(COMMENT_ELEMENTS);
}

function attachListenerToReplyButtons() {
  const replies = document.querySelectorAll(
    "#replies"
  ) as NodeListOf<HTMLDivElement>;

  console.log(replies);

  for (const reply of replies) {
    reply.addEventListener("click", (e) => {
      console.log("clicked", e);
    });
  }
}
function attachObserverToYtApp() {
  const target = document.querySelector("ytd-app");
  if (!target) {
    return;
  }

  const observer = new MutationObserver(() => {
    //TODO
  });
  observer.observe(target, {
    subtree: true
  });
}

function handleNavigateToNewVideo() {
  assignPageBodyElements();
  attachListenerToReplyButtons();
  attachObserverToYtApp();
}

function handleMessage(message: Message) {
  if (message.messageType === "block-comment") {
    removeBodyElement(SELECTED_ELEMENT);
  } else if (message.messageType === "block-user") {
    const username = (message as BlockUserMessage).data.username;
    removeAllCommentsFromUsers(new Set([username]));
  } else if (message.messageType === "navigate-new-video") {
    handleNavigateToNewVideo();
  }
}

document.addEventListener("mousedown", onMouseDown);
browser.runtime.onMessage.addListener(handleMessage);
