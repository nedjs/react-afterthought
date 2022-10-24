import { ToServiceInstance, AfterthoughtServices, ValidServiceKey } from "../types";
export declare function useService<TServices = AfterthoughtServices, T extends ValidServiceKey<TServices> = never>(serviceType: T): ToServiceInstance<T, TServices>;
