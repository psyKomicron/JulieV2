import { MessageEmbed } from "discord.js";
import { MessageWrapper } from "../bot/common/MessageWrapper";
import { Config } from "../dal/Config";
import { EmbedFactory } from "../factories/EmbedFactory";
import { CommandArgumentError } from "./command_errors/CommandArgumentError";
import { CommandError } from "./command_errors/CommandError";
import { CommandSyntaxError } from "./command_errors/CommandSyntaxError";
import { ExecutionError } from "./ExecutionError";

export class ErrorTranslater 
{
    public translate(error: Error, wrapper: MessageWrapper): MessageEmbed
    {
        if (wrapper.author.isDev)
        {
            wrapper.sendToAuthor("```js\n" + typeof error + " " + error.toString() + "```");
        }

        if (error instanceof ExecutionError)
        {
            if (error instanceof CommandError)
            {
                if (error instanceof CommandSyntaxError)
                {
                    let embed = EmbedFactory.build({
                        title: "Command failed",
                        description: "The last command that you used failed because you did not wrote it properly."
                    });
                    embed.addField("Help page for the command", Config.getGitRepoPath()+ "blob/master/README.md#" + error.commandName);
                    embed.addField("Command name", error.name);
                    embed.addField("Command message", error.message);
    
                    return embed;
                }

                if (error instanceof CommandArgumentError)
                {
                    let embed = EmbedFactory.build({
                        title: "Command failed",
                        description: "The last command that you used (" + error.commandName 
                        + " command) failed because you forgot or gave wrong arguments to make it work (argument name: " + error.argumentName + ")"
                    });
                    embed.addField("Help page for the command", Config.getGitRepoPath()+ "blob/master/README.md#" + error.commandName);

                    return embed;
                }
                
                let embed = EmbedFactory.build({
                    title: "Command failed",
                    description: "The last command that you used failed, you can check the help page to get more information on how to use this command with `" + Config.getPrefix() + "help`"
                });
                embed.addField("Command name", error.name);
                return embed;
            }
            else 
            {
                return EmbedFactory.build({
                    title: "Uh oh, something went wrong...",
                    description: "The last command you used failed, give it a little time I might need to fix it :)",
                    color: 16711680 // red
                });
            }
        }
    }
}