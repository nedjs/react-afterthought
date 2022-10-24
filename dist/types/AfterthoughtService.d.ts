import { AfterthoughtInjector, AfterthoughtServices } from "./types";
export declare class AfterthoughtService<TServices = AfterthoughtServices> {
    private _services;
    get services(): TServices;
    static init(service: any, injector: AfterthoughtInjector<any>): void;
    static getWatches(service: any): Set<string> | undefined;
    static getPath(service: any): Set<string> | undefined;
}
