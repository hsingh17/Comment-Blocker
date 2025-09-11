export interface Message {
  messageType: string;
}

export interface ContextMenuMessage extends Message {
  messageType: "context-menu";
  commentNode: HTMLElement;
}

function onContextMenu(ev: MouseEvent) {
  // const msg: ContextMenuMessage;
  const node = ev.target as HTMLElement;
  // if (node.tagName !== "span") {
  //   return;
  // }
  console.log(node, node.parentElement, node.closest("#body"));
}

document.addEventListener("contextmenu", onContextMenu);
