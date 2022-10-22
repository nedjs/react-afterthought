import {DispatchHandler} from "./util/Dispatcher";

declare global {
	const __DEV__: boolean;
}

export interface ClassConstructor {
	new(): any
}

export type ValidServiceKey = ClassConstructor | object | string;
export type ValidServiceType = ClassConstructor | object;

export type ReactiveServiceInstance<T, TServices extends ReactiveServices> =
	T extends keyof ReactiveServices ?
		ReactiveServices[T] :
		T extends (new (...args: any[]) => infer U) ? U :
			T;

export interface ServiceHistory {
	path: string;
	oldValue: any;
	newValue: any;
}

export interface ReactiveServices {

}

export interface ReactiveInjector<TServices = ReactiveServices> {
	services: TServices;
	listen(callback: DispatchHandler<ServiceHistory>): () => void;
	getService<T extends ValidServiceKey>(service: T): ReactiveServiceInstance<T, TServices>
}
