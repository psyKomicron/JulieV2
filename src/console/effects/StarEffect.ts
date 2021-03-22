import { LoadingEffect } from './LoadingEffect';

export class StarEffect extends LoadingEffect
{
    public constructor(position: [number, number] = [0, 0])
    {
        super("", ["|", "/", "-", "\\"], 200, position);
    }
}