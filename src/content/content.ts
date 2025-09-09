function onContextMenu(ev: MouseEvent) {
  browser.runtime.sendMessage({});
  console.log(ev.target);
}

document.addEventListener("contextmenu", onContextMenu);
