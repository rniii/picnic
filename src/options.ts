declare const VERSION: string
declare const browser: typeof chrome

(window as any).browser ??= chrome

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
  }
}

renderUi()
