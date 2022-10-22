import {ReactiveInjector, ReactiveServices} from "./types";

/**
 * @internal - Private method for internal use only
 */
export const SERVICE_INIT = Symbol('_reactive_init');

export class ReactiveService<TServices = ReactiveServices> {

	private _services: TServices;

	get services() {
		return this._services;
	}

	/**
	 * @internal
	 * @param injector
	 */
	[SERVICE_INIT](injector: ReactiveInjector) {
		this._services = injector.services as any;
	}
}
