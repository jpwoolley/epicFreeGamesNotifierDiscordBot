// The section of requirements
const {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
} = require("discord.js");
const { token, guildId, channelId } = require("./config.json");
const cron = require("cron");
const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Announce when the client is ready
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord client's token
client.login(token);

// Schedule job
let scheduledMessage = new cron.CronJob("00 5 16 * * *", () => {

  const guild = client.guilds.cache.get(guildId);
  const channel = guild.channels.cache.get(channelId);

  fetch('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=GB')
    .then(response => response.json())
    .then(data => {

      // Work out which games are the current offers
      const gameData = data.data.Catalog.searchStore.elements
        .filter((x) => x.offerType === "BASE_GAME")
        .filter((x) => x.price.totalPrice.discountPrice == 0);

      // get history and compare. Return if the same as yesterday
      const HISTORY = JSON.parse(fs.readFileSync('history.json'));
      let newOffers = new Array();
      for(let game in gameData){
        if(!HISTORY.includes(gameData[game].id)){
          newOffers.push(gameData[game])
        }
      }

      // update history
      fs.writeFileSync('history.json', JSON.stringify(gameData.map(x => x.id)));

      // check to see if any new offers. Return if not.
      if(newOffers.length < 1){
        return
      }

      // create embeds array
      let embeds = new Array();
      for (let i in newOffers) {
        embeds.push(new EmbedBuilder()
          .setColor(0x0099FF)
          .setURL(`https://store.epicgames.com/en-US/p/${newOffers[i].catalogNs.mappings[0].pageSlug}`)
          .setTitle(`'${newOffers[i].title}' by ${newOffers[i].seller.name}`)
          .setDescription(newOffers[i].description)
          .setImage(newOffers[i].keyImages.find(x => x.type === 'Thumbnail').url)
          .addFields({ name: 'Original price:', value: newOffers[i].price.totalPrice.fmtPrice.originalPrice })
        )
      }

      // post message in channel
      const ANNOUNCEMENTS = [
        "We are thrilled to announce the availability of a plethora of delightful games, absolutely gratis!",
        "Good heavens, it seems that a cornucopia of free games has appeared out of thin air!",
        "It is my great pleasure to inform you that a bevy of entertaining games can be had for no cost whatsoever!",
        "I say, it seems as though a bounty of free games has descended upon us!",
        "Attention all gaming enthusiasts: a smorgasbord of delightful games can now be enjoyed without spending a single penny!",
        "Ladies and gentlemen, prepare to be delighted! A veritable feast of free games is now at your fingertips!",
        "Fellow gamers, I am pleased to announce that a cornucopia of games can now be enjoyed without cost!",
        "Allow me to be the first to inform you that a bountiful array of free games has just been made available!",
        "My dear friends, it seems that the gods of gaming have smiled upon us, for a plethora of free games has been bestowed upon us!",
        "Dear sirs and madams, I am pleased to announce that an embarrassment of riches in the form of free games is now available for your enjoyment!",
      ];
      channel.send({
        content:
          ANNOUNCEMENTS[Math.floor(Math.random() * ANNOUNCEMENTS.length)],
        embeds: embeds
      });

    })

});

scheduledMessage.start();