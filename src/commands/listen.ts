import { GluegunCommand, GluegunToolbox, print } from 'gluegun'
import { Client, Message } from 'discord.js'
import { loadRecruit, loadRecruits, shortAddr } from '../lib/utils'
import { ethers, utils } from 'ethers'

const command: GluegunCommand = {
  name: 'listen',
  run: async (toolbox) => {
    const { banner, print } = toolbox

    banner()

    const discord = new Client({
      intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
      partials: ['MESSAGE', 'CHANNEL'],
    })

    discord.on('messageCreate', async (message) => {
      parseCommand(message, toolbox)
    })

    discord.on('ready', () => {
      print.spin('Waiting for commands...')
    })

    discord.login(process.env.DISCORD_TOKEN)
  },
}

const parseCommand = async (message: Message, toolbox: GluegunToolbox) => {
  try {
    if (message.content.startsWith('!ping')) {
      print.info(`PING: ${new Date().toUTCString()}`)
      message.reply('pong!')
      return
    }

    if (message.content.startsWith('!info')) {
      const id = message.content.split(' ')[1]
      const recruit = await loadRecruit(parseInt(id))
      message.reply(`
      \`${shortAddr(recruit.address)}\` - \`${recruit.id}\`
      ETH: \`${utils.formatEther(recruit.ethBalance)}\`
      MAGIC: \`${utils.formatEther(recruit.magicBalance)}\`
      🌟: \`${recruit.loot.starlight}\` | 💎: \`${
        recruit.loot.shards
      }\` | 🔒: \`${recruit.loot.locks}\`
      `)
    }

    if (message.content.startsWith('!list')) {
      const id = message.content.split(' ')[1]
      const recruit = await loadRecruit(parseInt(id))
      toolbox.marketplace.listItems(recruit)
    }

    if (message.content.startsWith('!sell')) {
      const id = message.content.split(' ')[1]
      const recruit = await loadRecruit(parseInt(id))
      toolbox.magic.sell(recruit)
    }

    if (message.content.startsWith('!eth')) {
      const count = parseInt(message.content.split(' ')[1]) || 5
      const recruits = await loadRecruits(count)
      let total = ethers.BigNumber.from('0')
      for (const r of recruits) {
        total = r.ethBalance.add(total)
      }
      message.reply(`Total ETH: ${utils.formatEther(total)}`)
    }

    if (message.content.startsWith('!magic')) {
      const count = parseInt(message.content.split(' ')[1]) || 5
      const recruits = await loadRecruits(count)
      let total = ethers.BigNumber.from('0')
      for (const r of recruits) {
        total = r.magicBalance.add(total)
      }
      message.reply(`Total $MAGIC: ${utils.formatEther(total)}`)
    }
  } catch (e) {
    message.reply('Error running command...')
  }
}

module.exports = command
