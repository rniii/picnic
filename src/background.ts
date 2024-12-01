// @ts-expect-error
window.browser ??= chrome

const hosts = localStorage.getItem("hosts")?.split(",").filter(x => x) ?? []

if (hosts.length) {
  browser.scripting.registerContentScripts([{
    world: "MAIN",
    matches: hosts,
    id: "picnic",
    js: ["content.js"],
    runAt: "document_start",
  }])

  browser.webRequest.onHeadersReceived.addListener(
    (e) => {
      if (!e.responseHeaders?.some(h => h.name == "server" && h.value?.toLowerCase() == "mastodon"))
        return console.warn(`Not a mastodon server: ${e.url}`)

      const csp = e.responseHeaders?.find(h => h.name == "content-security-policy")
      if (csp)
        csp.value = csp.value?.replace("script-src ", "script-src 'unsafe-eval' ")
      return e
    },
    { urls: hosts, types: ["main_frame"] },
    ["blocking", "responseHeaders"],
  )
}
