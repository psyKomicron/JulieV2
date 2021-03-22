// ENTRY POINT FOR THE NODEJS APPLICATION //
import { Printer } from './src/console/Printer';
import { StarEffect } from './src/console/effects/StarEffect';
import { Bot } from './src/bot/discord/Bot';
import { Config } from './src/dal/Config';
import { TwitterBot } from './src/bot/twitter/TwitterBot';

Config.init();

Printer.startUp();

let loadingEffect = new StarEffect([-12, -1]);
loadingEffect.start();

try
{
    var bot = Bot.get(loadingEffect);
    TwitterBot.get(bot);
}
catch (e)
{
    Printer.error(e.toString());
}