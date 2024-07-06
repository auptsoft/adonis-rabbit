import { ApplicationService } from './../node_modules/@adonisjs/core/build/src/types.d'
import { RabbitConfig, RabbitManagerContract } from '@adonis/addons/rabbit'
// import { ApplicationContract } from '@ioc:Adonis/Core/Application'
// import {Application} from '@adonisjs/application'

import RabbitManager from '../src/RabbitManager'

export default class RabbitProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton('rabbit' as any, async () => {
      const config = await this.app.container
        .make('config')
      const rabbitConfig = config.get('rabbit', {}) as RabbitConfig

      return new RabbitManager(rabbitConfig)
    })
  }

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    const Rabbit: RabbitManagerContract = await this.app.container.make(
      'rabbit'
    )
    await Rabbit.closeChannel()
    await Rabbit.closeConnection()
  }
}
