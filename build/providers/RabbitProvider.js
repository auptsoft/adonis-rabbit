"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RabbitManager_1 = __importDefault(require("../src/RabbitManager"));
class RabbitProvider {
    constructor(app) {
        this.app = app;
    }
    register() {
        this.app.container.singleton('rabbit', async () => {
            const config = await this.app.container
                .make('config');
            const rabbitConfig = config.get('rabbit', {});
            return new RabbitManager_1.default(rabbitConfig);
        });
    }
    async boot() {
    }
    async ready() {
    }
    async shutdown() {
        const Rabbit = await this.app.container.make('rabbit');
        await Rabbit.closeChannel();
        await Rabbit.closeConnection();
    }
}
exports.default = RabbitProvider;
//# sourceMappingURL=RabbitProvider.js.map