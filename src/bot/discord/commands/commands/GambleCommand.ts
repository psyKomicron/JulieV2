import { Command } from '../Command';
import { Bot } from "../../Bot";
import { MessageWrapper } from '../../../common/MessageWrapper';

export class GambleCommand extends Command
{
    public constructor(bot: Bot)
    {
        super("gamble-command", bot);
    }

    public async execute(wrapper: MessageWrapper): Promise<void> 
    {
        let params: Params = this.getParams(wrapper);

    }

    private getParams(wrapper: MessageWrapper): Params
    {

        return null;
    }
}

interface Params
{

}
