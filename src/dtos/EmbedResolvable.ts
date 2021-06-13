import { EmbedField, EmbedFieldData } from "discord.js";

/**Business object representing a MessageEmbed object from the discord.js API */
export interface EmbedResolvable
{
    author?: string;
    color?: number;
    createdAt?: Date;
    description: string;
    fields?: Array<EmbedFieldData>;
    files?: any[];
    footer?: string;
    // check for hexadecimal format later
    hexColor?: string; // HexValue
    image?: string;
    length?: number;
    provider?: string;
    thumbnail?: string;
    timestamp?: Date;
    title: string;
    type?: string;
    url?: string;
    video?: string;
}