const sendMessage = (action: string, href = "") => {
  chrome.runtime.sendMessage({ action: action, href: href });
};
sendMessage("css");

let blacklisted = false;

const config = {
  blacklist: "",
  characters: ";alskdjfiwoe",
  search_engine: "google",
  custom_search_engine: "",
};

const keys = {
  blobs_click: "Enter",
  blobs_focus: "Tab",
  blobs_show: ";",
  change_tab_left: "<Alt>p",
  change_tab_right: "<Alt>n",
  clipboard_copy: "<Shift>Enter",
  clipboard_paste: "<Alt>p",
  duplicate_tab: "<Alt>u",
  elem_deselect: "Escape",
  history_back: "<Alt>h",
  history_forward: "<Alt>l",
  middle_click: "<Alt>Enter",
  move_tab_left: "<Alt><Shift>P",
  move_tab_right: "<Alt><Shift>N",
  new_tab: "<Ctrl>Enter",
  new_window: "<Alt>w",
  private_window: "<Alt><Shift>W",
  reload: "<Ctrl>;",
  scroll_bottom: "<Alt><Shift>G",
  scroll_top: "<Alt>g",
  scroll_down: "<Alt>j",
  scroll_down_fast: "<Alt><Shift>J",
  scroll_left: "<Alt><Shift>H",
  scroll_right: "<Alt><Shift>L",
  scroll_up: "<Alt>k",
  scroll_up_fast: "<Alt><Shift>K",
  search: "<Alt>s",
};

const bindKeys = async () => {
  const sync = await chrome.storage.sync.get();
  for (const name of Object.keys(keys)) {
    const hotkey = sync.keys[name] ?? keys[name as keyof typeof keys];
    let sum = 0;
    for (const mod of hotkey.match(/<[a-zA-Z]+>/g) ?? []) {
      switch (mod.substring(1, mod.length - 1).toLowerCase()) {
        case "shift":
          sum++;
          break;
        case "ctrl":
          sum += 2;
          break;
        case "alt":
          sum += 4;
          break;
        case "meta":
          sum += 8;
          break;
      }
    }
    (keys as any)[name] = `${hotkey.replace(/<.*?>/g, "").trim()}${sum}`;
  }
  for (const [key, value] of Object.entries(
    (sync.conf as typeof config) ?? config
  ))
    (config as any)[key] = value;
  for (let link of config.blacklist.split("\n")) {
    link = link.trim();
    if (link.length && new RegExp(link).test(location.href)) {
      blacklisted = true;
      break;
    }
  }
};
bindKeys();
chrome.storage.onChanged.addListener(bindKeys);

const interpretKey = (event: KeyboardEvent) => {
  let sum = 0;
  if (event.shiftKey) sum++;
  if (event.ctrlKey) sum += 2;
  if (event.altKey) sum += 4;
  if (event.metaKey) sum += 8;
  return `${event.key}${sum}`;
};

const createKey = (n: number) => {
  if (n === 0) return config.characters[0];
  let str = "";
  const base = config.characters.length;
  for (let i = n; 0 < i; i = Math.floor(i / base)) {
    str += config.characters[i % base];
  }
  return str;
};

const blobList = {
  blobs: new Map<string, HTMLElement>(),
  container: document.createElement("div"),
  keyInput: document.createElement("input"),
  init: () => {
    blobList.keyInput.type = "text";
    blobList.keyInput.className = "mlKeyInput";
    blobList.keyInput.oninput = (event) => {
      (event.target as HTMLElement).style.width = `${
        (event.target as HTMLInputElement).value.length + 1
      }ch !important`;
    };
    blobList.keyInput.onkeydown = (event) => {
      switch (interpretKey(event)) {
        case keys.blobs_click:
          blobList.click();
          break;
        case keys.blobs_focus:
          blobList.focus();
          break;
        case keys.clipboard_copy:
          blobList.clipboardCopy();
          break;
        case keys.clipboard_paste:
          blobList.clipboardPaste();
          break;
        case keys.new_tab:
          blobList.clickNewTab(true);
          break;
        case keys.middle_click:
          blobList.clickNewTab(false);
          break;
        case keys.new_window:
          blobList.newWindow();
          break;
        case keys.private_window:
          blobList.privateWindow();
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    blobList.keyInput.onblur = () => {
      blobList.hideBlobs();
    };
    blobList.container.className = "mlContainer";
    document.body.append(blobList.container);
  },
  loadBlobs: () => {
    blobList.container.replaceChildren(blobList.keyInput);
    blobList.container.style.display = "block";
    blobList.keyInput.focus();
    let count = 0;
    for (const linkElem of document.querySelectorAll<HTMLElement>(
      `a, button, input, select, textarea, summary, [role='button'] ${
        location.host === "www.youtube.com"
          ? ", tp-yt-paper-tab, yt-chip-cloud-chip-renderer"
          : ""
      }`
    )) {
      if (
        linkElem.style.display === "none" ||
        linkElem.style.visibility === "hidden"
      )
        continue;
      const rect = linkElem.getBoundingClientRect();
      if (rect.top === 0 && rect.left === 0) continue;
      if (
        0 <= rect.top &&
        0 <= rect.left &&
        rect.bottom <= (innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (innerWidth || document.documentElement.clientWidth)
      ) {
        const key = createKey(count++);
        const blobElem = document.createElement("div");
        blobElem.innerText = key.toUpperCase();
        blobElem.className = "mlBlob";
        blobElem.style.top = `${rect.top}px`;
        blobElem.style.left = `${rect.left}px`;
        blobList.container.append(blobElem);
        blobList.blobs.set(key, linkElem);
      }
    }
  },
  hideBlobs: () => {
    blobList.keyInput.value = "";
    blobList.keyInput.blur();
    blobList.container.style.display = "none";
    blobList.blobs.clear();
  },
  click: () => {
    const blob = blobList.blobs.get(blobList.keyInput.value);
    if (!blob) return;
    if (
      location.host === "www.reddit.com" &&
      ["comments", "body"].includes(blob.getAttribute("data-click-id")!)
    ) {
      location.href = (blob as HTMLAnchorElement).href;
    } else {
      blobList.hideBlobs();
      blob.tagName === "INPUT" &&
      ![
        "button",
        "checkbox",
        "color",
        "file",
        "hidden",
        "image",
        "radio",
        "reset",
        "submit",
      ].includes((blob as HTMLInputElement).type)
        ? blob.focus()
        : blob.click();
    }
  },
  clickNewTab: (active: boolean) => {
    const blob = blobList.blobs.get(blobList.keyInput.value);
    if (!blob) return;
    blobList.hideBlobs();
    const link = (blob as HTMLAnchorElement).href;
    blob.tagName === "A" && link
      ? sendMessage(active ? "openTabActive" : "openTab", link)
      : blobList.click();
  },
  clipboardCopy: () => {
    const blob = blobList.blobs.get(blobList.keyInput.value);
    if (!blob) return;
    const link = (blob as HTMLAnchorElement).href;
    if (!link) return;
    navigator.clipboard.writeText(link);
    blobList.hideBlobs();
  },
  clipboardPaste: async () => {
    const blob = blobList.blobs.get(blobList.keyInput.value);
    if (!blob) return;
    (blob as HTMLInputElement).value += await navigator.clipboard.readText();
    blob.focus();
    blobList.hideBlobs();
  },
  search: async () => {
    const text = document.getSelection()!.toString();
    if (text) {
      const storage = await chrome.storage.sync.get();
      const searchEngineString = storage.conf["search_engine"] || "google";
      let searchString;
      if (searchEngineString === "custom") {
        searchString = storage.conf["custom_search_engine"].replace(
          "{{{s}}}",
          encodeURIComponent(text)
        );
      } else {
        searchString = searchEngine[searchEngineString].search(text);
      }
      window.open(searchString);
    }
  },
  newWindow: (windowType?: string) => {
    const blob = blobList.blobs.get(blobList.keyInput.value);
    if (!blob) return;
    blobList.hideBlobs();
    const link = (blob as HTMLAnchorElement).href;
    if (blob.tagName === "A" && link)
      sendMessage(windowType || "newWindow", link);
  },
  privateWindow: () => {
    blobList.newWindow("privateWindow");
  },
  focus: () => {
    const blob = blobList.blobs.get(blobList.keyInput.value);
    if (!blob) return;
    blobList.hideBlobs();
    blob.focus();
  },
  scroll: (speed: number, top: boolean) => {
    window.scrollBy({
      behavior: "smooth",
      left: top ? 0 : speed,
      top: top ? speed : 0,
    });
  },
};
blobList.init();

const isValidElem = (elem: HTMLElement) => {
  switch (elem.tagName) {
    case "TEXTAREA":
    case "SELECT":
    case "CANVAS":
    case "INPUT":
      return true;
  }
  return elem.contentEditable.toLocaleLowerCase() === "true";
};

const searchEngine: { [key: string]: any } = {
  google: createSearchString("https://google.com/search?q={{{s}}}"),
  duckduckgo: createSearchString("https://duckduckgo.com?q={{{s}}}"),
  bing: createSearchString("https://bing.com/search?q={{{s}}}"),
  yahoo: createSearchString("https://search.yahoo.com/search?p={{{s}}}"),
  yandex: createSearchString("https://yandex.com/search?text={{{s}}}"),
  ecosia: createSearchString("https://ecosia.org/search?q={{{s}}}"),
};

function createSearchString(baseUrl: string): {
  search: (query: string) => string;
} {
  return {
    search: (query: string) => {
      return baseUrl.replace("{{{s}}}", encodeURIComponent(query));
    },
  };
}

window.onkeydown = (event) => {
  if (blacklisted) return;
  const active = document.activeElement as HTMLInputElement;
  const hotkey = interpretKey(event);
  if (isValidElem(active)) {
    if (hotkey === keys.elem_deselect) active.blur();
    return;
  }
  switch (hotkey) {
    case keys.blobs_show:
      blobList.loadBlobs();
      break;
    case keys.elem_deselect:
      active.blur();
      break;
    case keys.scroll_up:
      blobList.scroll(-100, true);
      break;
    case keys.scroll_down:
      blobList.scroll(100, true);
      break;
    case keys.scroll_up_fast:
      blobList.scroll(-500, true);
      break;
    case keys.scroll_down_fast:
      blobList.scroll(500, true);
      break;
    case keys.scroll_left:
      blobList.scroll(-100, false);
      break;
    case keys.scroll_right:
      blobList.scroll(100, false);
      break;
    case keys.scroll_top:
      scroll(0, 0);
      break;
    case keys.scroll_bottom:
      scroll(0, document.body.scrollHeight - window.innerHeight);
      break;
    case keys.history_forward:
      history.forward();
      break;
    case keys.history_back:
      history.back();
      break;
    case keys.search:
      blobList.search();
      break;
    case keys.change_tab_left:
      sendMessage("changeTabLeft");
      break;
    case keys.change_tab_right:
      sendMessage("changeTabRight");
      break;
    case keys.move_tab_left:
      sendMessage("moveTabLeft");
      break;
    case keys.move_tab_right:
      sendMessage("moveTabRight");
      break;
    case keys.duplicate_tab:
      sendMessage("duplicateTab");
      break;
    case keys.reload:
      sendMessage("css");
      break;
    default:
      return;
  }
  event.preventDefault();
};
