// ENTRY POINT FOR THE NODEJS APPLICATION //
import { Printer } from './src/console/Printer';
import { StarEffect } from './src/console/effects/StarEffect';
import { Bot } from './src/bot/discord/Bot';
import { Config } from './src/dal/Config';
import { TwitterBot } from './src/bot/twitter/TwitterBot';
import { exit } from "process";

try 
{
    Config.init();
}
catch (e)
{
    Printer.error("Config failed initialisation. Details below:");
    Printer.error(e.toString());
    exit(-1);
}
Printer.startUp();

let loadingEffect = new StarEffect([-16, -1]);
loadingEffect.start();

try
{
    var bot = Bot.get(loadingEffect);
    TwitterBot.get(bot);
}
catch (e)
{
    loadingEffect.stop();
    Printer.error(e.toString());
    exit(-1);
}