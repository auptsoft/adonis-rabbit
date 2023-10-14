import { Channel, Options } from 'amqplib';
import { MessageContract, RabbitConfig, RabbitManagerContract } from '@ioc:Adonis/Addons/Rabbit';
export default class RabbitManager implements RabbitManagerContract {
    private readonly rabbitConnection;
    hasChannel: boolean;
    private $channelPromise;
    private $channel;
    private onCreateChannelListenerss;
    constructor(rabbitConfig: RabbitConfig);
    addCreateChannelListener(listener: Function): number;
    removeCreateChannelListener(id: number): void;
    private toBuffer;
    getConnection(): Promise<import("amqplib").Connection | undefined>;
    getChannel(): Promise<Channel | undefined>;
    assertQueue(queueName: string, options?: Options.AssertQueue): Promise<import("amqplib").Replies.AssertQueue | undefined>;
    sendToQueue(queueName: string, content: any, options?: Options.Publish): Promise<boolean>;
    assertExchange(exchangeName: string, type: string, options?: Options.AssertExchange): Promise<import("amqplib").Replies.AssertExchange | undefined>;
    bindQueue(queueName: string, exchangeName: string, pattern?: string): Promise<import("amqplib").Replies.Empty | undefined>;
    sendToExchange(exchangeName: string, routingKey: string, content: any): Promise<boolean>;
    ackAll(): Promise<void>;
    nackAll(requeue: boolean): Promise<void>;
    consumeFrom<T extends object = any>(queueName: string, onMessage: (msg: MessageContract<T>) => void | Promise<void>): Promise<import("amqplib").Replies.Consume | undefined>;
    closeChannel(): Promise<void>;
    closeConnection(): Promise<void>;
}
