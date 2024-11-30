(window as any).browser ??= chrome

browser.webRequest.onHeadersReceived.addListener(
  (e) => {
    const csp = e.responseHeaders!.find(h => h.name == "content-security-policy")

    csp && (csp.value = csp.value!.replace("script-src ", "$& 'unsafe-eval' "))
    console.log(csp)
    return e
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking", "responseHeaders"]
)
