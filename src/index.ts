const consoleStyle = ["color:mediumaquamarine", "color:currentColor"]

console.log(
  `%c picnic %cLoading ${VERSION}!`,
  ...consoleStyle,
)

declare const VERSION: string
