import { Command } from '../Command';
import { Bot } from "../../Bot";
import { MessageWrapper } from '../../../common/MessageWrapper';
import { NotImplementedError } from '../../../../errors/NotImplementedError';

export class GambleCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("gamble-command", bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        throw new NotImplementedError();
        let params: Params = this.getParams(wrapper);
    }

    public help(wrapper: MessageWrapper): string
    {
        return "The command has yet to be done, give us a little bit of time to finish it.";
    }

    private getParams(wrapper: MessageWrapper): Params
    {

        return null;
    }
}

/**
 * Use this interface (anonymous object) to return multiple values from the getParams function.
 */
interface Params
{

}
