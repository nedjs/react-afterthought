import {DispatchHandler} from "./util/Dispatcher";

declare global {
	const __DEV__: boolean;
}

export interface ServiceConstructor {
	new()
	new(injector: ReactiveInjector)
}

export type ReactiveService = ServiceConstructor | object;
export type ReactiveServiceInstance<T> = T extends (new (...args: any[]) => infer U) ? U : T;

/**
 * @internal
 */
export interface ServiceHistory {
	path: string;
	oldValue: any;
	newValue: any;
}

export interface ReactiveInjector {
	getService<T extends ReactiveService>(service: T): ReactiveServiceInstance<T>
}
