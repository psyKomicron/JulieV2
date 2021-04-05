import { MessageEmbed } from "discord.js";
import { MessageWrapper } from "../bot/common/MessageWrapper";
import { Config } from "../dal/Config";
import { EmbedFactory } from "../factories/EmbedFactory";
import { CommandError } from "./command_errors/CommandError";
import { CommandSyntaxError } from "./command_errors/CommandSyntaxError";
import { ExecutionError } from "./ExecutionError";

export class ErrorTranslater 
{
    public translate(error: ExecutionError, wrapper: MessageWrapper): MessageEmbed
    {
        if (wrapper.message.author.tag == "psyKomicron#6527")
        {
            return EmbedFactory.build({
                title: "Command failed !",
                description: error.name,
                fields: [
                    { name: "Full message", value: error.message },
                    { name: "Stack trace", value: error.toString() }
                ]
            });
        }
        else 
        {
            if (error instanceof CommandError)
            {
                if (error instanceof CommandSyntaxError)
                {
                    let embed = EmbedFactory.build({
                        title: "Command failed",
                        description: "The last command that you used failed because you did not wrote it properly, you can check the help page to get more information on how to use this command with " + Config.getPrefix() + "help"
                    });
    
                    embed.addField("Command name", error.name);
                    embed.addField("Command message", error.message);
    
                    return embed;
                }
                else 
                {
                    let embed = EmbedFactory.build({
                        title: "Command failed",
                        description: "The last command that you used failed, you can check the help page to get more information on how to use this command with " + Config.getPrefix() + "help"
                    });
    
                    embed.addField("Command name", error.name);
    
                    return embed;
                }
            }
            else 
            {
                return EmbedFactory.build({
                    title: "Uh oh, something went wrong...",
                    description: "The last command you used failed, give it a little time I might need to fix it :)"
                });
            }
        }
    }
}