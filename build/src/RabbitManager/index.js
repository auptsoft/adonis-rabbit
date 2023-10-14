"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RabbitConnection_1 = __importDefault(require("../RabbitConnection"));
const Messsage_1 = __importDefault(require("../Messsage"));
const safeStringify_1 = __importDefault(require("../Utils/safeStringify"));
class RabbitManager {
    constructor(rabbitConfig) {
        this.hasChannel = false;
        this.onCreateChannelListenerss = [];
        this.rabbitConnection = new RabbitConnection_1.default(rabbitConfig);
    }
    addCreateChannelListener(listener) {
        this.onCreateChannelListenerss.push(listener);
        return this.onCreateChannelListenerss.length - 1;
    }
    removeCreateChannelListener(id) {
        this.onCreateChannelListenerss[id] = null;
    }
    toBuffer(content) {
        return Buffer.isBuffer(content)
            ? content
            : Buffer.from(typeof content === 'object' ? safeStringify_1.default(content) : content);
    }
    async getConnection() {
        return this.rabbitConnection.getConnection();
    }
    async getChannel() {
        const connection = await this.rabbitConnection.getConnection();
        if (!connection) {
            return undefined;
        }
        if (!this.hasChannel || !this.$channel) {
            console.log('I am here');
            if (!this.$channelPromise) {
                this.$channelPromise =
                    connection.createChannel();
            }
            this.$channel = await this.$channelPromise;
            this.hasChannel = true;
            for (let i = 0; i < this.onCreateChannelListenerss.length; i++) {
                const listener = this.onCreateChannelListenerss[i];
                if (listener !== null) {
                    listener();
                }
            }
            this.$channel.on('error', () => {
                console.log('Channel error');
                this.hasChannel = false;
            });
            this.$channel.on('close', () => {
                console.log('Channel close');
                this.hasChannel = false;
                this.$channelPromise = undefined;
                this.$channel = undefined;
            });
        }
        console.log(this.hasChannel);
        return this.$channel;
    }
    async assertQueue(queueName, options) {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return;
        }
        return channel.assertQueue(queueName, options);
    }
    async sendToQueue(queueName, content, options) {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return false;
        }
        console.log('sending to queue2');
        return channel.sendToQueue(queueName, this.toBuffer(content), options);
    }
    async assertExchange(exchangeName, type, options) {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return;
        }
        return channel.assertExchange(exchangeName, type, options);
    }
    async bindQueue(queueName, exchangeName, pattern = '') {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return;
        }
        return channel.bindQueue(queueName, exchangeName, pattern);
    }
    async sendToExchange(exchangeName, routingKey, content) {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return false;
        }
        return channel.publish(exchangeName, routingKey, this.toBuffer(content));
    }
    async ackAll() {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return;
        }
        return channel.ackAll();
    }
    async nackAll(requeue) {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return;
        }
        return channel.nackAll(requeue);
    }
    async consumeFrom(queueName, onMessage) {
        const channel = await this.getChannel();
        if (!channel) {
            console.log('Could not connect');
            return;
        }
        return channel.consume(queueName, (message) => {
            const messageInstance = new Messsage_1.default(channel, message);
            onMessage(messageInstance);
        });
    }
    async closeChannel() {
        if (this.hasChannel && this.$channel) {
            await this.$channel.close();
            this.hasChannel = false;
        }
    }
    async closeConnection() {
        await this.rabbitConnection.closeConnection();
    }
}
exports.default = RabbitManager;
//# sourceMappingURL=index.js.map