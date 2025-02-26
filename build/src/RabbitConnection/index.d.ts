import { Connection } from 'amqplib';
import { RabbitConfig } from '@ioc:Adonis/Addons/Rabbit';
export default class RabbitConnection {
    private readonly rabbitConfig;
    hasConnection: boolean;
    private $connection;
    private $connectionPromise;
    private readonly $credentials;
    private readonly $hostname;
    private readonly $protocol;
    constructor(rabbitConfig: RabbitConfig);
    private handleCredentials;
    private handleHostname;
    private handleProtocol;
    get url(): string;
    getConnection(): Promise<Connection | undefined>;
    closeConnection(): Promise<void>;
}
