//https://atlis.gg/api/users

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { client } from "../..";

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Fetch user information from Atlis')
        .addStringOption(opt =>
            opt
                .setName('username')
                .setDescription('The user to fetch the information from')
                .setRequired(true)
        ),
    execute: async (interaction: any) => {
        try {
            const res = await axios.get(`https://api.atlis.gg/api/users?username=${interaction.options.getString('username')}`);
    
            const relativeTime = require('dayjs/plugin/relativeTime');
            dayjs.extend(relativeTime);
        
            const getBadgeEmojis = () => {
                let badges = '';

                if(res.data.admin)
                    badges + `${client.emojis.cache.find(e => e.name === 'staff')} `;
                if(res.data.premium)
                    badges + `${client.emojis.cache.find(e => e.name === 'premium')} `;
                if(res.data.support)
                       badges + `${client.emojis.cache.find(e => e.name === 'earlysupporter')} `;

                return badges;
            }

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.options.getString('username')}'s Information`)
                .setDescription(`Here's all the information you need to know about ${interaction.options.getString('username')}`)
                .setFields([
                    {
                        name: 'General',
                        value:
                        `**User ID:** ${res.data.id}\n` +
                        `**Username:** ${res.data.username}\n` +
                        `**Display Name:** ${res.data.displayName || 'None'}\n` +
                        `**Banner Color:** ${res.data.bannerColor}\n` +
                        `**Follower Amount:** ${res.data.followers !== null ? res.data.followers.length : 0}\n` +
                        `**Following Amount:** ${res.data.following !== null ? res.data.following.length : 0}`,
                        inline: true
                    },
                    {
                        name: 'Specifics',
                        value:
                        `**Location:** ${res.data.location || 'None'}\n` +
                        `**Industry:** ${res.data.industry || 'None'}\n` +
                        `**Workplace:** ${res.data.workplace || 'None'}\n` +
                        `**School:** ${res.data.school || 'None'}`,
                        inline: true
                    },
                    {
                        name: 'Socials',
                        value:
                        `**Twitter:** ${res.data.twitter || 'None'}\n` +
                        `**Instagram:** ${res.data.instagram || 'None'}\n` +
                        `**Website:** ${res.data.website || 'None'}`,
                        inline: true
                    },
                    {
                        name: 'Badges',
                        value:
                        `**Admin:** ${res.data.admin}\n` +
                        `**Support:** ${res.data.support}\n` +
                        `**Verified:** ${res.data.verified}\n` +
                        `**Premium:** ${res.data.premium}\n` +
                        `**Badges:** ${!res.data.admin && !res.data.support && !res.data.premium && !res.data.badges ? 'None' : getBadgeEmojis()}`,
                        inline: true
                    },
                    {
                        name: 'Extra',
                        value:
                        `**Created Communities Amount:** ${res.data.createdCommunitiesCount}\n` +
                        `**Creation Date:** ${new Date(res.data.createdOn).toUTCString()} (${dayjs(res.data.createdOn).fromNow()})`,
                        inline: true
                    }
                ])
                .setImage(res.data.banner)
                .setThumbnail(res.data.avatar)
                .setColor('#1B76FF')
        
            await interaction.reply({
                embeds: [embed]
            });
        } catch(err: any) {
            if(err.response && err.response.status === 404) {
                await interaction.reply(`🤔 Sorry, I couldn't find who you're looking for on Atlis.`);
            } else {
                interaction.reply('An unexpected error has occured.');
                console.log(err);
            }
        }
    }
}