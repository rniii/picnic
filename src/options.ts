declare const VERSION: string
declare const browser: typeof chrome

// @ts-expect-error
window.browser ??= chrome

const $ = <T extends HTMLElement>(q: string) => document.querySelector<T>(q)!

const renderUi = async () => {
  $("#version").textContent = `v${VERSION}`

  const currentTab = await browser.tabs.query({ active: true, currentWindow: true })
  const hostname = new URL(currentTab[0].url!).hostname
  const host = `https://${hostname}/*`

  if (await browser.permissions.contains({ origins: [host] })) {
    $("#status").textContent = `Running on ${hostname}`
    $("#grant").hidden = true
  } else {
    $("#status").textContent = "Not running on this website"
    $("#grant").hidden = false
  }

  $<HTMLButtonElement>("#grant").onclick = async () => {
    await browser.permissions.request({ origins: [host] })

    // I feel like this should be the browser's job, but on MV2 the "scripting" and "webRequest"
    // permissions are granted for *every website*, so we keep track of it to not modify random
    // websites
    const permissions = await browser.permissions.getAll()
    localStorage.setItem("hosts", permissions.origins?.join(",") ?? "")

    browser.runtime.reload()
  }
}

renderUi()
