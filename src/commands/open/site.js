const Command = require('@netlify/cli-utils')
const openBrowser = require('../../utils/open-browser')

class OpenAdminCommand extends Command {
  async run() {
    const { api, site } = this.netlify
    await this.authenticate()

    const siteId = site.id

    if (!siteId) {
      this.warn(`No Site ID found in current directory.
Run \`netlify link\` to connect to this folder to a site`)
      return false
    }

    await this.config.runHook('analytics', {
      eventName: 'command',
      payload: {
        command: "open:site",
      },
    });

    let siteData
    let url
    try {
      siteData = await api.getSite({ siteId })
      url = siteData.ssl_url || siteData.url
      this.log(`Opening "${siteData.name}" site url:`)
      this.log(`> ${url}`)
    } catch (e) {
      if (e.status === 401 /* unauthorized*/) {
        this.warn(`Log in with a different account or re-link to a site you have permission for`)
        this.error(`Not authorized to view the currently linked site (${siteId})`)
      }
      this.error(e)
    }

    await openBrowser(url)
    this.exit()
  }
}

OpenAdminCommand.description = `Opens current site url in browser`

OpenAdminCommand.examples = ['netlify open:site']

module.exports = OpenAdminCommand
