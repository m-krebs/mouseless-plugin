import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Mouseless",
    description: "For a mouseless future, but on chrome",
    permissions: ["storage", "scripting", "tabs"],
    host_permissions: ["*://*/*"],
  },
});
