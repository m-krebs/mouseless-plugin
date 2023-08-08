const presets = {
  conf: {
    blacklist: "",
    chars: ";alskdjfiwoe",
    search_engine: "",
    custom_search_engine: "",
  },
  keys: {
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
    scroll_down: "<Alt>j",
    scroll_down_fast: "<Alt><Shift>J",
    scroll_left: "<Alt><Shift>H",
    scroll_right: "<Alt><Shift>L",
    scroll_top: "<Alt>g",
    scroll_up: "<Alt>k",
    scroll_up_fast: "<Alt><Shift>K",
    search: "<Alt>s",
  },
};

chrome.storage.sync.get().then((sync) => {
  for (const elem of document.querySelectorAll("input, textarea, select")) {
    const [section, name] = elem.getAttribute("data-value")?.split(".");
    (elem as HTMLInputElement).value = sync[section]?.[name] || presets[section][name];
    if (name === "search_engine") {
  document.getElementById("custom_search")!.style.display = "block";
    }
  }
});

const search = document.querySelector("select");
console.log(search.value);
if (search.value === "custom") {
}

document.querySelector("select").onchange = (event) => {
  if (event.target.value === "custom") {
    document.getElementById("custom_search").style.display = "block";
  } else {
    document.getElementById("custom_search").style.display = "none";
  }
};

document.querySelector("form").onsubmit = (event) => {
  event.preventDefault();
  for (const elem of document.querySelectorAll("input, textarea, select")) {
    const [section, name] = elem.getAttribute("data-value")?.split(".");
    presets[section][name] = elem.value;
  }
  chrome.storage.sync.set(presets);
};
