import { ApplicationService } from './../node_modules/@adonisjs/core/build/src/types.d';
export default class RabbitProvider {
    protected app: ApplicationService;
    constructor(app: ApplicationService);
    register(): void;
    boot(): Promise<void>;
    ready(): Promise<void>;
    shutdown(): Promise<void>;
}
