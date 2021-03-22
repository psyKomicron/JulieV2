import readline = require('readline');
import { TokenReader } from '../../dal/readers/TokenReader';
import { Client, Message, User, TextChannel } from 'discord.js';
import { DefaultLogger } from './command_modules/logger/loggers/DefaultLogger';
import { Logger } from './command_modules/logger/Logger';
import { Printer } from '../../console/Printer';
import { ExecutionError } from '../../errors/ExecutionError';
import { CommandFactory } from '../../factories/CommandFactory';
import { Tools } from '../../helpers/Tools';
import { Config } from '../../dal/Config';
import { ConfigurationError } from '../../errors/dal_errors/ConfigurationError';
import { LoadingEffect } from '../../console/effects/LoadingEffect';
import { Moderator } from './command_modules/moderation/Moderator';
import { CommandError } from '../../errors/command_errors/CommandError';
import { EventEmitter } from 'events';
import { MessageWrapper } from '../common/MessageWrapper';

export class Bot extends EventEmitter
{
    // discord
    private readonly _client: Client;
    // bot
    private static instance: Bot;
    private readonly parents: string[];
    private readonly verbose: number;
    private moderator: Moderator;   
    private prefix: string;
    private _logger: Logger = new DefaultLogger();

    private constructor(effect: LoadingEffect)
    {
        super();
        this._client = new Client();
        this.moderator = Moderator.get(this);
        try
        {
            // bot parameters
            this.verbose = Config.getVerbose();
            this.parents = Config.getAuthorizedUsers();

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

    // #region properties
    public get prefixLength(): number { return this.prefix.length; }

    public get client(): Client { return this._client; }

    public get logger(): Logger { return this._logger; }
    // #endregion

    public static get(effect: LoadingEffect): Bot
    {
        if (!this.instance)
        {
            this.instance = new Bot(effect);
        }
        return this.instance
    }

    public on<K extends keyof BotEvents>(event: K, listener: (...args: BotEvents[K]) => void): this
    {
        return super.on(event, listener);
    }

    public emit<K extends keyof BotEvents>(event: K, ...args: BotEvents[K]): boolean
    {
        return super.emit(event, ...args);
    }

    // #region private methods
    private init(id: LoadingEffect): void
    {
        this.prefix = Config.getPrefix();

        // config changes
        Config.onEvent("prefixChange", (newPrefix) => this.onPrefixChange(newPrefix));
        Config.onEvent("addUser", (user) => this.onUserAdd(user));

        // initiate bot
        this._client.on("ready", () =>
        {
            id.stop();
            readline.moveCursor(process.stdout, -3, 0);
            process.stdout.write("Ready\n");
            Printer.error(Printer.repeat("-", 26));
        });

        this._client.on("message", (message) => this.onMessage(message));

        this._client.on("disconnect", (arg_0, arg_1: number) => 
        {
            console.log("Client disconnected :");
            console.log(`${JSON.stringify(arg_0)}, ${arg_1}`);
        });

        // login
        this._client.login(TokenReader.getToken("discord"));
    }

    private handleErrorForClient(error: Error, message: Message): void
    {
        if (error instanceof ExecutionError && this.verbose > 2)
        {
            if (error instanceof CommandError)
            {
                message.author.send(error.message);
            }
            else
            {
                this.sendErrorMessage(message);
            }
        }
        else
        {
            this.sendErrorMessage(message);
        }
    }

    private sendErrorMessage(message: Message): void
    {
        message.author.send("Uh oh... Something went wrong ! Try again !");
    }

    private isAuthorized(user: User): boolean
    {
        return this.parents.includes(user.tag);
    }

    // #endregion

    // #region events handlers
    private onMessage(message: Message): void 
    {
        let wrapper = new MessageWrapper(message);
        wrapper.parseMessage(this.prefix.length);
        let content = wrapper.content;

        if (content.startsWith(this.prefix))
        {
            try
            {
                // asynchronously moderates a message
                this.moderator.execute(wrapper);
            }
            catch (error)
            {
                Printer.error(error.toString());
            }

            if (this.isAuthorized(message.author))
            {
                Printer.info("\ncommand requested by : " + message.author.tag);

                if (this._logger)
                {
                    let handled = this._logger.handle(wrapper);

                    if (!handled)
                    {
                        let name = Tools.getCommandName(content);
                        try
                        {
                            let command = CommandFactory.create(name.substr(this.prefix.length), this);

                            let wrapper = new MessageWrapper(message);
                            wrapper.parseMessage(this.prefix.length);

                            command.execute(wrapper)
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
        }
    }

    private onPrefixChange(prefix: string): void
    {
        if (prefix.length > 0)
        {
            this.prefix = prefix;
        }
        else
        {
            throw new ConfigurationError("Given prefix is not valid.");
        }
    }

    private onUserAdd(user: User): void
    {
        if (!this.parents.includes(user.tag))
        {
            this.parents.push(user.tag);
        }
    }
    // #endregion

}

export interface BotEvents
{
    /**TextChannel: to get messages from. boolean: set as default channel to get messages from. */
    collect: [TextChannel, boolean, CollectOptions?];
}

export interface CollectOptions
{
    keepUntil?: Date;
    collectWhen?: Date;
    fetchType: number;
}