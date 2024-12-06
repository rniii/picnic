import { define, devs, re, replace } from "picnic"

const MAX_INTERACTIONS = 8

export default define({
  name: "picnic/filter-notifications",
  authors: [devs.rini],
  patches: [
    {
      query: '="NOTIFICATIONS_UPDATE_NOOP"',
      patch: replace(
        re`const \i=\i().getIn(["settings","notifications"`,
        "if($self.filterNotification(arguments[0]))return;$&",
      ),
    },
    {
      query: '"notificationGroups/processNew"',
      patch: replace(
        re`if("all"===\i?\i[\(\i\).type]`,
        "if($self.filterNotification($1))return;$&"
      )
    }
  ],

  filterNotification(notification: any) {
    if (
      ["favourite", "reblog", "reaction"].includes(notification.type)
      && notification.status.favourites_count + notification.status.reblogs_count
        > MAX_INTERACTIONS
    ) {
      return true
    }

    return false
  },
})
