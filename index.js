// Require the necessary discord.js classes
const { Client, EmbedBuilder, Events, GatewayIntentBits } = require('discord.js');
const { token, guildId, channelId } = require('./config.json');
const cron = require('cron');


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

let scheduledMessage = new cron.CronJob('00 5 16 * * 4', () => {

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);

	fetch('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=GB')
	.then(response => response.json())
	.then(data => {
		// Work out which games are the current offers
		let currentFreeGames = [];
		let game;
		let gameData = data.data.Catalog.searchStore.elements;
		for (let i in gameData) {
			if ((gameData[i].promotions?.promotionalOffers.length > 0) && (gameData[i].offerType === "BASE_GAME")) {
				game = {};
				game.storeURL = `https://store.epicgames.com/en-US/p/${gameData[i].catalogNs.mappings[0].pageSlug}`
				game.title = gameData[i].title
				game.description = gameData[i].description
				game.thumbnailURL = (gameData[i].keyImages.find(x => x.type === 'Thumbnail')).url
				game.seller = gameData[i].seller.name
				currentFreeGames.push(game)
			}
		}
		// create embeds for chat message
		let embeds = [];
		let currentEmbed;
		for (let game in currentFreeGames) {
			currentEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setURL(currentFreeGames[game].storeURL)
				.setTitle(`'${currentFreeGames[game].title}' by ${currentFreeGames[game].seller}`)
				.setDescription(currentFreeGames[game].description)
				.setImage(currentFreeGames[game].thumbnailURL);

			embeds.push(currentEmbed);
		}
		// post message in channel
		channel.send({
			content: `Looks like it\'s time for more free Epic Games! Let\' see what we\'ve got in here...*rummages around*`,
			embeds: embeds
		})
	})

});
scheduledMessage.start();