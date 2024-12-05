import { withErrorBoundary } from "components/ErrorBoundary"
import MarkdownIt from "markdown-it"
import { define, devs, re, replace } from "picnic"
import sanitize from "sanitize-html"
import { useSelector } from "./common/react-redux"

const md = MarkdownIt()
  .set({ linkify: true, html: true })
  .disable(["table", "code"])

md.linkify.set({ fuzzyEmail: false, fuzzyLink: false })
md.linkify.add("@", {
  validate: new RegExp(`^${md.linkify.re.src_email_name}(?:@${md.linkify.re.src_host_strict})?`, "i"),
  normalize(match) {
    match.text = "@" + match.text.split("@")[1]
    match.url = "/" + match.url
  },
})
md.linkify.add("#", {
  validate: new RegExp(`^${md.linkify.re.src_pseudo_letter}*`),
  normalize(match) {
    match.url = "/tags/" + match.url.replace(/^#/, "")
  },
})
md.linkify.add("xmpp:", "mailto:")
md.core.ruler.after("linkify", "shorten_links", (state) => {
  for (const block of state.tokens) {
    if (block.type != "inline")
      continue

    let foundLink = false
    for (const token of block.children!) {
      if (token.type == "text" && foundLink) {
        token.content = token.content.replace(/^https?:\/\/(www\.)?|xmpp:/, "")
        if (token.content.length > 30)
          token.content = token.content.slice(0, 30) + "…"
      } else if (token.type == "link_open") {
        if (token.attrGet("href")?.match(/^[a-z]/))
          token.attrSet("class", "unhandled-link")
        foundLink = true
      } else {
        foundLink = false
      }
    }
  }

  return false
})

const sanitizeOpts: sanitize.IOptions = {
  allowedSchemes: "http https dat dweb ipfs ipns ssb gopher xmpp magnet gemini"
    .split(" "),
  allowedTags: "p br span a abbr del s pre blockquote code b strong u sub sup i em h1 h2 h3 h4 h5 ul ol li ruby rt rp"
    .split(" "),
  allowedClasses: { "*": [/^(h|p|u|dt|e)-/] },
  allowedAttributes: {
    a: ["href", "rel", "class", "title", "translate", "target"],
    abbr: ["title"],
    span: ["class", "translate"],
    blockquote: ["cite"],
    ol: ["start", "reversed"],
    li: ["value"],
  },
  transformTags: {
    a: sanitize.simpleTransform("a", {
      target: "_blank",
      rel: "nofollow noopener noreferrer",
    }),
  },
}

const Preview = (props: { text: string }) => {
  const contentType = useSelector(state => state.getIn(["compose", "content_type"]))

  let html: string

  if (contentType == "text/markdown") {
    html = sanitize(md.render(props.text), sanitizeOpts)
  } else if (contentType == "text/html") {
    html = sanitize(props.text, sanitizeOpts)
  } else {
    // plaintext?
    return (
      <div className="status__content">
        <div className="status__content__text">{props.text}</div>
      </div>
    )
  }

  return (
    <div className="status__content">
      <div
        className="status__content__text"
        dangerouslySetInnerHTML={{ __html: html }}
      >
      </div>
    </div>
  )
}

export default define({
  name: "picnic/markdown-preview",
  description: "Adds a preview of the post's markdown or HTML.",
  authors: [devs.rini],
  patches: [
    {
      query: 'className:"compose-form"',
      patch: replace(
        re`disabled:!this.canSubmit()}))))]})`,
        "$&,$self.renderPreview(this.props)",
      ),
    },
  ],

  renderPreview: withErrorBoundary(Preview),
})
