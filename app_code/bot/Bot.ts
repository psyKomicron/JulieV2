import readline = require('readline');
import { TokenReader } from '../dal/readers/TokenReader';
import { Client, Message, User } from 'discord.js';
import { Moderator } from './command_modules/moderation/Moderator';
import { DefaultLogger } from './command_modules/logger/loggers/DefaultLogger';
import { Logger } from './command_modules/logger/Logger';
import { Printer } from '../console/Printer';
import { ExecutionError } from '../errors/ExecutionError';
import { CommandFactory } from '../helpers/factories/CommandFactory';
import { Tools } from '../helpers/Tools';
import { Config } from '../dal/Config';
import { ConfigurationError } from '../errors/dal_errors/ConfigurationError';
import { LoadingEffect } from '../console/effects/LoadingEffect';
import { CommandError } from '../errors/command_errors/CommandError';

export class Bot 
{
    // own
    private moderator: Moderator;
    private _logger: Logger = new DefaultLogger();
    private prefix: string;
    private readonly parents: string[];
    private readonly verbose: number;
    // discord
    private readonly _client: Client = new Client();

    public constructor(effect: LoadingEffect) 
    {
        this.moderator = Moderator.get(this);
        try
        {
            // bot parameters
            this.verbose = Config.getVerbose();
            this.parents = Config.getAuthorizedUsers();
            this.prefix = Config.getPrefix();

            // events init & login
            this.init(effect);
        }
        catch (error)
        {
            effect.stop();
            Printer.clear();
            Printer.error(error.toString());
            Printer.error("\nFatal error, application will not start. Press CTRL+C to stop");
        }
    }

    public get prefixLength(): number { return this.prefix.length; }

    public get client(): Client { return this._client; }

    public get logger(): Logger { return this._logger; }

    private init(id: LoadingEffect): void
    {
        // config changes
        Config.on("prefix-change", (newPrefix) =>
        {
            this.onPrefixChange(newPrefix);
        });
        Config.on("added-user", (user) =>
        {
            this.onUserAdd(user);
        });

        // initiate bot
        this._client.on("ready", () =>
        {
            id.stop();
            readline.moveCursor(process.stdout, -3, 0);
            process.stdout.write("Ready\n");
            Printer.error(Printer.repeat("-", 26));
        });

        this._client.on("message", (message) => { this.onMessage(message); });

        this._client.on("disconnect", (arg_0, arg_1: number) => 
        {
            console.log("Client disconnected :");
            console.log(`${JSON.stringify(arg_0)}, ${arg_1}`);
        });

        // login
        this._client.login(TokenReader.getToken("discord"));
    }

    private onPrefixChange(prefix: string): void
    {
        if (prefix.length >= 1)
        {
            this.prefix = prefix;
        }
        else
        {
            throw new ConfigurationError("Given prefix is not valid.");
        }
    }

    private onUserAdd(user: User)
    {
        if (!this.parents.includes(user.tag))
        {
            this.parents.push(user.tag);
        }
    }

    private onMessage(message: Message): void 
    {
        let content = message.content;

        if (content.startsWith(this.prefix))
        {
            try
            {
                // asynchronously moderates a message
                this.moderator.execute(message);
            }
            catch (error)
            {
                Printer.error(error.toString());
            }

            if (this.parents.includes(message.author.tag))
            {
                Printer.info("\ncommand requested by : " + message.author.tag);

                if (this._logger)
                {
                    this._logger.handle(message);
                }

                let name = Tools.getCommandName(content);
                try
                {
                    let command = CommandFactory.create(name.substr(this.prefix.length), this);

                    command.execute(message)
                        .catch(error =>
                        {
                            Printer.error(error.toString());
                            this.handleErrorForClient(error, message);
                        })
                        .then(() =>
                        {
                            if (command.deleteAfterExecution)
                            {
                                command.deleteMessage(message, 300);
                            }
                        });
                } 
                catch (error)
                {
                    Printer.error(error.toString());
                    this.handleErrorForClient(error, message);
                }
            } 
        }
    }

    private handleErrorForClient(error: Error, message: Message): void
    {
        if (error instanceof ExecutionError && this.verbose > 3)
        {
            if (error instanceof CommandError)
            {
                message.author.send("Uh oh with the " + error.name + "command... Something went wrong ! Try again !")
            }
            else
            {
                message.author.send(`Command (\`${error.name}\`) failed. Message : \n${error.message}`);
            }
        }
        else
        {
            message.author.send("Uh oh... Something went wrong ! Try again !");
        }
    }
}