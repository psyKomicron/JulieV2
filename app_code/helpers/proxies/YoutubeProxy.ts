import { YoutubeQuestion } from "../../viewmodels/YoutubeQuestion";
import { YoutubeResponse } from "../../viewmodels/YoutubeReponse";

export class YoutubeProxy
{
    private _question: YoutubeQuestion;
    private _response: YoutubeResponse;

    public get response() { return this._response; }

    public set question(value: YoutubeQuestion) { this._question = value; }

    /**
     * Just a remote call for searchWithoutParams
     * @param input
     */
    public search(input: YoutubeQuestion): YoutubeResponse
    {
        this.question = input;
        return this.searchWithoutParams();
    }

    public searchWithoutParams(): YoutubeResponse
    {
        return undefined;
    }
}