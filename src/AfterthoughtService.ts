import {AfterthoughtInjector, AfterthoughtServices} from "./types";

/**
 * @internal - Private method for internal use only
 */
export const SYM_SERVICE_INIT = Symbol('rs_init');

/**
 * @internal - Private method for internal use only
 */
export const SYM_SERVICE_WATCHES = Symbol('rs_watches');
/**
 * @internal - Private method for internal use only
 */
export const SYM_SERVICE_PATH = Symbol('rs_path');

export class AfterthoughtService<TServices = AfterthoughtServices> {

	private _services: TServices;

	get services() {
		return this._services;
	}

	/**
	 * @internal
	 * @param injector
	 */
	[SYM_SERVICE_INIT](injector: AfterthoughtInjector<any>) {
		this._services = injector.services as any;
	}

	static init(service: any, injector: AfterthoughtInjector<any>) {
		if(service[SYM_SERVICE_INIT]) {
			service[SYM_SERVICE_INIT](injector);
		}
	}

	static getWatches(service: any): Set<string> | undefined {
		if(service && service[SYM_SERVICE_WATCHES]) {
			return service[SYM_SERVICE_WATCHES];
		}
		return undefined;
	}

	static getPath(service: any): Set<string> | undefined {
		if(service && service[SYM_SERVICE_PATH]) {
			return service[SYM_SERVICE_PATH];
		}
		return undefined;
	}
}
