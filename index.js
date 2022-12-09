// The section of requirements
const { Client, EmbedBuilder, Events, GatewayIntentBits } = require('discord.js');
const { token, guildId, channelId } = require('./config.json');
const cron = require('cron');
const announcements = require('./announcements.json')

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Announce when the client is ready
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord client's token
client.login(token);

// Schedule job
let scheduledMessage = new cron.CronJob('00 * * * * *', () => {

	const guild = client.guilds.cache.get(guildId);
	const channel = guild.channels.cache.get(channelId);

	fetch('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=GB')
	.then(response => response.json())
	.then(data => {
		// Work out which games are the current offers
		let weeklyFreeGames = data.data.Catalog.searchStore.elements.filter(x => x.offerType === "BASE_GAME").filter(x => x.price.totalPrice.discountPrice == 0);

		// Take the interesting bits
		let currentFreeGames = [];
		let game = {};
		for (let i in weeklyFreeGames) {
				game.storeURL = `https://store.epicgames.com/en-US/p/${weeklyFreeGames[i].catalogNs.mappings[0].pageSlug}`
				game.title = weeklyFreeGames[i].title
				game.description = weeklyFreeGames[i].description
				game.thumbnailURL = (weeklyFreeGames[i].keyImages.find(x => x.type === 'Thumbnail')).url
				game.seller = weeklyFreeGames[i].seller.name
				game.originalPrice = weeklyFreeGames[i].price.totalPrice.fmtPrice.originalPrice
				currentFreeGames.push(game)
				game = {};
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
				.setImage(currentFreeGames[game].thumbnailURL)
				.addFields({ name: 'Original price:', value: currentFreeGames[game].originalPrice })
			embeds.push(currentEmbed);
		}

		// post message in channel
		channel.send({
			content: announcements[Math.floor(Math.random() * announcements.length)],
			embeds: embeds
		})
	})

});
scheduledMessage.start();