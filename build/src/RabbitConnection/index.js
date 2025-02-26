"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = require("amqplib");
const InvalidRabbitConfigException_1 = __importDefault(require("../Exceptions/InvalidRabbitConfigException"));
class RabbitConnection {
    constructor(rabbitConfig) {
        this.rabbitConfig = rabbitConfig;
        this.hasConnection = false;
        this.$credentials = this.handleCredentials(this.rabbitConfig.user, this.rabbitConfig.password);
        this.$hostname = this.handleHostname(this.rabbitConfig.hostname, this.rabbitConfig.port);
        this.$hostname = this.handleHostname(this.rabbitConfig.hostname, this.rabbitConfig.port);
        this.$protocol = this.handleProtocol(this.rabbitConfig.protocol);
    }
    handleCredentials(user, password) {
        if (!user) {
            throw new InvalidRabbitConfigException_1.default('Missing RabbitMQ user');
        }
        if (!password) {
            throw new InvalidRabbitConfigException_1.default('Missing RabbitMQ password');
        }
        return `${user}:${password}@`;
    }
    handleHostname(hostname, port) {
        if (!hostname) {
            throw new InvalidRabbitConfigException_1.default('Missing RabbitMQ hostname');
        }
        return port ? `${hostname}:${port}` : hostname;
    }
    handleProtocol(protocol) {
        if (!protocol) {
            protocol = 'amqp://';
        }
        return protocol;
    }
    get url() {
        return [this.$protocol, this.$credentials, this.$hostname].join('');
    }
    async getConnection() {
        try {
            if (!this.$connection) {
                if (!this.$connectionPromise) {
                    this.$connectionPromise = amqplib_1.connect(this.url);
                }
                this.$connection = await this.$connectionPromise;
                this.$connection.on('close', () => {
                    this.$connection = undefined;
                    this.$connectionPromise = undefined;
                });
            }
            return this.$connection;
        }
        catch (e) {
            console.log(e);
            this.$connection = undefined;
            this.$connectionPromise = undefined;
            return undefined;
        }
    }
    async closeConnection() {
        var _a;
        if (this.hasConnection) {
            await ((_a = this.$connection) === null || _a === void 0 ? void 0 : _a.close());
            this.hasConnection = false;
        }
    }
}
exports.default = RabbitConnection;
//# sourceMappingURL=index.js.map