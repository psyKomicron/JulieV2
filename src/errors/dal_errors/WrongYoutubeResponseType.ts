import { ExecutionError } from "../ExecutionError";
import { YoutubeProxy } from "../../helpers/proxies/YoutubeProxy";

export class WrongYoutubeResponseType extends ExecutionError
{
    public constructor(proxy: YoutubeProxy)
    {
        super("Wrong return type from youtube", proxy?.name);
    }
}