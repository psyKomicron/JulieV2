// ENTRY POINT FOR THE NODEJS APPLICATION //
import readline = require('readline');
import { Printer } from './app_code/console/Printer';
import { Test } from './app_code/tests/test_app';
import { StarEffect } from './app_code/console/effects/StarEffect';
import { Bot } from './app_code/bot/Bot';
import { TokenReader } from './app_code/dal/readers/TokenReader';
import { ReleaseType, Tools } from './app_code/helpers/Tools';
import { Config } from './app_code/dal/Config';
import { EmptyTokenError } from './app_code/errors/dal_errors/EmptyTokenError';

const release = TokenReader.getToken("release");
Printer.info(`release version : ${release}`);
/*if (release)
{
    const release = TokenReader.getToken("release");

    Printer.info(`release version : ${release}`);

    let r1 = readline.createInterface(
        {
            input: process.stdin,
            output: process.stdout
        });
    r1.question(Printer.pGreen("launch configuration : "), (answer) => 
    {
        if (Tools.getRelease(answer) == ReleaseType.TEST)
        {
            Test.execute();
        }
        else
        {
            Printer.startUp();
            let loadingEffect = new StarEffect([-17, -1]);
            loadingEffect.start();
            try
            {
                new Bot(loadingEffect);
            } catch (e)
            {
                console.error(e);
            }
        }
    });
}
catch (error)
{
    
}*/

Config.init();
Printer.startUp();
let loadingEffect = new StarEffect("", [-17, -1]);
loadingEffect.start();
try
{
    new Bot(loadingEffect);
}
catch (e)
{
    Printer.error(e.toString());
}