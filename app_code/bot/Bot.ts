import readline = require('readline');
import { clearInterval } from 'timers';
import { TokenReader } from '../dal/readers/TokenReader';
import { Client, Message } from 'discord.js';
import { Moderator } from './command_modules/moderation/Moderator';
import { DefaultLogger } from './command_modules/logger/loggers/DefaultLogger';
import { Logger } from './command_modules/logger/Logger';
import { Printer } from '../console/Printer';
import { ExecutionError } from '../errors/ExecutionError';
import { CommandFactory } from '../helpers/factories/CommandFactory';
import { Tools } from '../helpers/Tools';
import { Config } from '../dal/Config';
import { LoadingEffect } from '../console/effects/LoadingEffect';

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

    public constructor(id: LoadingEffect) 
    {
        this.moderator = Moderator.get(this);
        try
        {
            // bot parameters
            this.verbose = Config.getVerbose();
            this.parents = Config.getAuthorizedUsers();
            this.prefix = Config.getPrefix();

            // events init & login
            this.init(id);
        }
        catch (error)
        {
            id.stop();
            Printer.clear();
            Printer.error(error.toString());
            Printer.error("\nFatal error, application will not start. Press CTRL+C to stop");
        }
    }

    public get client(): Client { return this._client; }

    public get logger(): Logger { return this._logger; }

    private init(id: LoadingEffect): void
    {

        // initiate bot
        this._client.on("ready", () =>
        {
            id.stop();
            readline.moveCursor(process.stdout, -4, 0);
            process.stdout.write("READY\n");
            Printer.error("-------------------------------------");
        });
        this._client.on("message", (message) => { this.onMessage(message); });
        this._client.on("disconnect", (arg_0, arg_1: number) => 
        {
            console.log("Client disconnected :");
            console.log(`${JSON.stringify(arg_0)}, ${arg_1}`);
        });

        // login
        let token: string = TokenReader.getToken("discord");
        this._client.login(token);
        token = "";
    }

    private onMessage(message: Message): void 
    {
        // asynchronously moderates a message
        try
        {
            this.moderator.execute(message);
        }
        catch (error)
        {
            Printer.error(error.toString());
        }

        let content = message.content;
        if (content.startsWith(this.prefix) && this.parents.includes(message.author.tag))
        {
            Printer.info("\ncommand requested by : " + message.author.tag);
            let name = Tools.getCommandName(content);
            try
            {
                let handled = this.logger.handle(message);
                if (!handled)
                {
                    let command = CommandFactory.create(name.substr(1), this);
                    command.execute(message)
                        .catch(error =>
                        {
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
            } catch (error)
            {
                this.handleErrorForClient(error, message);
            }
        }
    }

    private handleErrorForClient(error: Error, message: Message): void
    {
        if (error instanceof ExecutionError)
        {
            if (this.verbose)
            {
                Printer.error(error.message);
                message.author.send(`Command (\`${error.name}\`) failed. Message : \n${error.message}`);
            }
        }
        else if (this.verbose > 2)
        {
            Printer.error(error.toString());
            message.author.send("Uh oh... Something went wrong ! Try again !");
        }
    }
}