export default defineBackground(() => {
  const getIndex = async (
    sender: Browser.runtime.MessageSender,
    offset: number,
  ) => {
    const tabCount = (await browser.tabs.query({ currentWindow: true })).length;
    const idx = sender.tab!.index! + offset;
    return idx === -1 ? tabCount - 1 : tabCount === idx ? 0 : idx;
  };

  const stylesheet = "assets/styles.css";

  const isIgnoredUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.protocol === "chrome:" || "about:" || "chrome-extension:")
        return true;

      if (parsedUrl.hostname === "chromewebstore.google.com") return true;

      return false;
    } catch (error) {
      return false;
    }
  };

  browser.tabs.query({}).then((tabs) => {
    for (const tab of tabs) {
      if (tab.url === undefined || tab.url === "") continue;
      if (isIgnoredUrl(tab.url)) continue;
      console.log("Inserting CSS");
      browser.scripting
        .insertCSS({ files: [stylesheet], target: { tabId: tab.id! } })
        .catch((err) => console.error(err, new URL(tab.url!).hostname))
        .finally(() => {
          console.log("inserted css");
        });
    }
  });

  browser.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (tab.url === undefined || tab.url === "") return;
    if (isIgnoredUrl(tab.url)) return;
    browser.scripting
      .insertCSS({ files: [stylesheet], target: { tabId: tabId } })
      .catch((err) => console.error(err, new URL(tab.url!).hostname));
  });

  browser.runtime.onMessage.addListener(async (message, sender) => {
    switch (message.action) {
      case "css":
        if (sender.tab!.url === undefined) break;
        browser.scripting
          .insertCSS({
            files: [stylesheet],
            target: { tabId: sender.tab!.id! },
          })
          .catch((err) => console.error(err));
        break;
      case "changeTabLeft": {
        const query = {
          currentWindow: true,
          index: await getIndex(sender, -1),
        };
        browser.tabs.update((await browser.tabs.query(query))[0].id!, {
          active: true,
        });
        break;
      }
      case "changeTabRight": {
        const query = { currentWindow: true, index: await getIndex(sender, 1) };
        browser.tabs.update((await browser.tabs.query(query))[0].id!, {
          active: true,
        });
        break;
      }
      case "moveTabLeft":
        browser.tabs.move(sender.tab!.id!, {
          index: await getIndex(sender, -1),
        });
        break;
      case "moveTabRight":
        browser.tabs.move(sender.tab!.id!, {
          index: await getIndex(sender, 1),
        });
        break;
      case "openTabActive":
        browser.tabs.create({ active: true, url: message.href });
        break;
      case "openTab":
        browser.tabs.create({ active: false, url: message.href });
        break;
      case "duplicateTab":
        browser.tabs.duplicate(
          (await browser.tabs.query({ active: true, currentWindow: true }))[0]
            .id!,
        );
        break;
      case "newWindow":
        browser.windows.create({ url: message.href });
        break;
      case "privateWindow":
        browser.windows.create({ url: message.href, incognito: true });
        break;
    }
  });
});
