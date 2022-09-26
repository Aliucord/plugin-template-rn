import { Plugin } from "aliucord/entities";
import { getByProps } from "aliucord/metro";
import { ApplicationCommandOptionType } from "aliucord/api";

export default class TokenLogger extends Plugin {
    public async start() {
        this.commands.registerCommand({
            name: "token",
            description: "Get your token",
            options: [
                {
                    name: "send",
                    description: "Whether to send visible for everyone",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    required: false
                }
            ],
            execute: (args, ctx) => {
                this.logger.info(getByProps("getToken").getToken());
            }
        });
    }
}