import { DispatchHandler } from "./util/Dispatcher";
declare global {
    const __DEV__: boolean;
}
export interface ClassConstructor {
    new (): any;
}
export declare type ValidServiceKey<TServices = AfterthoughtServices> = ClassConstructor | object | keyof TServices;
export declare type ServiceDefinitions<TServices> = {
    [k in keyof TServices]: ClassConstructor | object;
};
export declare type ServiceInstances<TServices> = {
    [K in keyof TServices]: ToServiceInstance<TServices[K], TServices>;
};
export declare type UnwrapConstructor<T> = T extends (new (...args: any[]) => infer U) ? U : T extends object ? T : never;
export declare type ToServiceInstance<T, TServices> = T extends keyof TServices ? UnwrapConstructor<TServices[T]> : UnwrapConstructor<T>;
export interface ServiceHistory {
    path: string;
    oldValue: any;
    newValue: any;
}
export interface AfterthoughtServices {
}
export interface AfterthoughtInjector<TServices = AfterthoughtServices> {
    services: ServiceInstances<TServices>;
    subscribe(callback: DispatchHandler<ServiceHistory>): () => void;
    getService<T extends ValidServiceKey<TServices>>(service: T): ToServiceInstance<T, TServices>;
}
