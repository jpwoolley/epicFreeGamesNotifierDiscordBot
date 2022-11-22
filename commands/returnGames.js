const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('games')
    .setDescription('Replied with a list of current Epic promotions!'),
  async execute(interaction) {

    // Retrieve any games with promotions from the Epic Store API
    let fetchResult;
    await fetch('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=GB')
      .then((response) => response.json())
      .then((data) => {
        fetchResult = JSON.parse(JSON.stringify(data))
      });
    let gameData = fetchResult.data.Catalog.searchStore.elements

    // Work out which games are the current offers
    let currentFreeGames = [];
    let game;
    for (let i in gameData) {
      if ( (gameData[i].promotions?.promotionalOffers.length > 0) && (gameData[i].offerType === "BASE_GAME")) {
        game = {};
        game.storeURL = `https://store.epicgames.com/en-US/p/${gameData[i].catalogNs.mappings[0].pageSlug}`
        game.title = gameData[i].title
        game.description = gameData[i].description
        game.thumbnailURL = (gameData[i].keyImages.find(x => x.type === 'Thumbnail')).url
        game.seller = gameData[i].seller.name
        currentFreeGames.push(game)
      }
    }

    let embeds = [];
    let currentEmbed;
    for(let game in currentFreeGames){
      currentEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setURL(currentFreeGames[game].storeURL)
        .setTitle(`'${currentFreeGames[game].title}' by ${currentFreeGames[game].seller}`)
        .setDescription(currentFreeGames[game].description)
        .setImage(currentFreeGames[game].thumbnailURL);

        embeds.push(currentEmbed);
    }
      // respond
      await interaction.reply(
        { content: `Oooee! It looks like it\'s time for more free Epic Games. Let\' see what we\'ve got in here...*rummages around*\n`,
          embeds: embeds }
      );

  },
};