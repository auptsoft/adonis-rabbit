import { Channel, Options } from 'amqplib'
import {
  MessageContract,
  RabbitConfig,
  RabbitManagerContract,
} from '@ioc:Adonis/Addons/Rabbit'
import RabbitConnection from '../RabbitConnection'
import Message from '../Messsage'
import safeStringify from '../Utils/safeStringify'

export default class RabbitManager implements RabbitManagerContract {
  /**
   * The connection manager
   */
  private readonly rabbitConnection: RabbitConnection

  /**
   * If the channel has been established
   */
  public hasChannel: boolean = false

  /**
   * The channel
   */
  private $channelPromise: Promise<Channel> | undefined
  private $channel: Channel | undefined

  private onCreateChannelListenerss: Array<Function | null> = []

  constructor(rabbitConfig: RabbitConfig) {
    this.rabbitConnection = new RabbitConnection(rabbitConfig)
  }

  public addCreateChannelListener(listener: Function) : number{
    this.onCreateChannelListenerss.push(listener)
    return this.onCreateChannelListenerss.length - 1
  }

  public removeCreateChannelListener(id: number) {
     this.onCreateChannelListenerss[id] = null
  }

  /**
   * Converts the content to a Buffer
   *
   * @param content The content
   */
  private toBuffer(content: any) {
    return Buffer.isBuffer(content)
      ? content
      : Buffer.from(
          typeof content === 'object' ? safeStringify(content) : content
        )
  }

  /**
   * Returns the connection
   */
  public async getConnection() {
    return this.rabbitConnection.getConnection()
  }

  /**
   * Returns the channel
   */
  public async getChannel() {
    const connection = await this.rabbitConnection.getConnection()
    if(!connection) {
      return undefined
    }

    if (!this.hasChannel || !this.$channel) {
      console.log('I am here')
      if (!this.$channelPromise) {
        this.$channelPromise =
          connection.createChannel() as unknown as Promise<Channel>
      }
      this.$channel = await this.$channelPromise
      this.hasChannel = true

      for(let i=0; i<this.onCreateChannelListenerss.length; i++) {
        const listener = this.onCreateChannelListenerss[i]
        if(listener !== null) {
          listener()
        }
      }

      this.$channel.on('error', ()=>{
        console.log('Channel error')
        this.hasChannel = false
      })

      this.$channel.on('close', ()=>{
        console.log('Channel close')
        this.hasChannel = false
        this.$channelPromise = undefined
        this.$channel = undefined
      })
    }

    console.log(this.hasChannel)

    return this.$channel
  }

  /**
   * Creates a queue if doesn't exist
   *
   * @param queueName The name of the queue
   * @param options The options
   */
  public async assertQueue(queueName: string, options?: Options.AssertQueue) {
    const channel = await this.getChannel()

    if(!channel) {
      console.log('Could not connect')
      return
    }

    return channel.assertQueue(queueName, options)
  }

  /**
   * Sends the message to the queue
   *
   * @param queueName The name of the queue
   * @param content The content
   * @param options The options
   */
  public async sendToQueue(
    queueName: string,
    content: any,
    options?: Options.Publish
  ) {
    const channel = await this.getChannel()
    if(!channel) {
      console.log('Could not connect')
      return false
    }

    console.log('sending to queue2')

    return channel.sendToQueue(queueName, this.toBuffer(content), options)
  }

  /**
   * Creates an Exchange if doesn't exist
   *
   * @param exchangeName The exchange name
   * @param type The exchange type
   * @param content The content
   */
  public async assertExchange(
    exchangeName: string,
    type: string,
    options?: Options.AssertExchange
  ) {
    const channel = await this.getChannel()
    if(!channel) {
      console.log('Could not connect')
      return
    }

    return channel.assertExchange(exchangeName, type, options)
  }

  /**
   * Binds a queue and an exchange
   *
   * @param queueName The queue name
   * @param exchangeName The exchange name
   * @param pattern The pattern
   */
  public async bindQueue(
    queueName: string,
    exchangeName: string,
    pattern = ''
  ) {
    const channel = await this.getChannel()

    if(!channel) {
      console.log('Could not connect')
      return
    }

    return channel.bindQueue(queueName, exchangeName, pattern)
  }

  /**
   * Sends a message to an exchange
   *
   * @param exchangeName The exchange name
   * @param routingKey A routing key
   * @param content The content
   */
  public async sendToExchange(
    exchangeName: string,
    routingKey: string,
    content: any
  ) {
    const channel = await this.getChannel()

    if(!channel) {
      console.log('Could not connect')
      return false
    }

    return channel.publish(exchangeName, routingKey, this.toBuffer(content))
  }

  /**
   * Acknowledges all messages
   */
  public async ackAll() {
    const channel = await this.getChannel()

    if(!channel) {
      console.log('Could not connect')
      return
    }

    return channel.ackAll()
  }

  /**
   * Rejects all messages
   *
   * @param requeue Adds back to the queue
   */
  public async nackAll(requeue: boolean) {
    const channel = await this.getChannel()

    if(!channel) {
      console.log('Could not connect')
      return
    }

    return channel.nackAll(requeue)
  }

  /**
   * Consumes messages from a queue
   *
   * @param queueName The queue name
   * @param onMessage The listener
   */
  public async consumeFrom<T extends object = any>(
    queueName: string,
    onMessage: (msg: MessageContract<T>) => void | Promise<void>
  ) {
    const channel = await this.getChannel()

    if(!channel) {
      console.log('Could not connect')
      return
    }

    return channel.consume(queueName, (message) => {
      const messageInstance = new Message<T>(channel, message)
      onMessage(messageInstance)
    })
  }

  /**
   * Closes the channel
   */
  public async closeChannel() {
    if (this.hasChannel && this.$channel) {
      await this.$channel.close()
      this.hasChannel = false
    }
  }

  /**
   * Closes the connection
   */
  public async closeConnection() {
    await this.rabbitConnection.closeConnection()
  }
}
