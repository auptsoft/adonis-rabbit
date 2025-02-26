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
        this.app.container.singleton('Adonis/Addons/Rabbit', () => {
            const rabbitConfig = this.app.container
                .use('Adonis/Core/Config')
                .get('rabbit', {});
            return new RabbitManager_1.default(rabbitConfig);
        });
    }
    async boot() {
    }
    async ready() {
    }
    async shutdown() {
        const Rabbit = this.app.container.use('Adonis/Addons/Rabbit');
        await Rabbit.closeChannel();
        await Rabbit.closeConnection();
    }
}
exports.default = RabbitProvider;
//# sourceMappingURL=RabbitProvider.js.map