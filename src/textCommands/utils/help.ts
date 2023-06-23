import {
	Client,
	EmbedBuilder,
	Message,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ComponentType
} from "discord.js";
import Server from "../../models/Server.model";

export default {
    name: 'help',
    description: 'Get a help menu',
    category: 'utilities',
    aliases: [],
    usage: 'help',
    async execute(message: Message, args: string[], client: Client) {
        const guild = await Server.findOne({ guild_id: message.guild!.id });

        const embed = new EmbedBuilder()
		.setColor('#1B76FF')
			.setTitle('Commands')
			.setDescription('Click the menu below for the help menu, this embed will change accordingly')
			.setFooter({
                text: message.member!.displayName,
                iconURL: message.member!.displayAvatarURL()
            })
			.setTimestamp();
		
			const row = new ActionRowBuilder<StringSelectMenuBuilder>()
			.setComponents(
				new StringSelectMenuBuilder()
					.setCustomId('help')
					.setMaxValues(1)
					.setMinValues(1)
					.setPlaceholder('🤔 Make a selection...')
					.setOptions([
						new StringSelectMenuOptionBuilder({
							label: '🎉 Fun',
							description: 'Show a list of fun commands',
							value: 'fun'
						}),
						new StringSelectMenuOptionBuilder({
							label: '🧐 Utilities',
							description: 'Show a list of commands to utilize',
							value: 'utilities',
						}),
					])
			);
		
		const msg = await message.reply({
			embeds: [embed],
			components: [row]
		});

		const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 5 * 60 * 1000 });

		collector.on('collect', async (interaction: any) => {
			if(interaction.member!.user.id !== message.author.id) return;

            embed.setFields();
            const categories = client.textCommands.filter(cmd => cmd.category === interaction.values[0]);
			
			for(const command of categories) {
				embed.addFields({
                        name: `${command[1].name} | \`${guild!.prefix + command[1].usage}\``,
                        value: `*${command[1].description}*`
							+ `\n**Aliases:** ${command[1].aliases[0] != null ? command[1].aliases.join(', ') : 'none'}`,
                        inline: true
                });
			}

			await interaction.deferUpdate();

			await msg.edit({
				embeds: [embed]
			});
		});

		collector.on('end', collection => {
			try {
				msg.reply('This help embed has been closed. Sorry!');
			} catch(err) {
				console.log(err);
			}
		});
	}
}