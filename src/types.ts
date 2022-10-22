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
	subscribe(callback: DispatchHandler<ServiceHistory>): () => void;
	getService<T extends ValidServiceKey>(service: T): ReactiveServiceInstance<T, TServices>
}

export type ValidServiceKey2<T> = ClassConstructor | object | keyof T;
export type ReactiveServiceInstance2<T, TServices extends ReactiveServices> =
	T extends keyof TServices ?
		TServices[T] :
			T extends (new (...args: any[]) => infer U) ? U :
				T;

function getIt<TServices = ReactiveServices>(v: keyof TServices | ClassConstructor | object): typeof v //ReactiveServiceInstance2<typeof v, TServices>
{
	return null as any;
}

interface LServices {
	foo: Date
}

function inferIt<T = any>(v: T): typeof v {
	return null as any;
}

const a = inferIt('s')

const r = getIt<LServices>('foo');
const r2: ReactiveServiceInstance2<typeof r, LServices> = null as any;
