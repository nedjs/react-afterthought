import {AfterthoughtInjector, AfterthoughtServices} from "./types";

/**
 * @internal - Private method for internal use only
 */
export const SYM_PROXY_INDICATOR = Symbol('rs_proxy');
/**
 * @internal - Private method for internal use only
 */
export const SYM_WATCHES = Symbol('rs_watches');

export class AfterthoughtService<TServices = AfterthoughtServices> {
	get services(): TServices {
		// this will be overwritten by our service proxy
		throw new Error('Service not correctly initialized through Afterthought provider, services are unavailable. This is likely a bug')
	}
}
