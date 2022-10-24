import React from "react";
import {SYM_PROXY_INDICATOR, SYM_WATCHES} from "../AfterthoughtService";

/**
 * @internal
 */
export interface ReactRenderingTracker {
	get isRendering(): boolean;
	notifyIsRendering(): void;

	/**
	 * Resets the tracker back to initial state (not rendering).
	 */
	reset(): void;
}

/**
 * @internal
 */
export function createRenderingTracker(): ReactRenderingTracker {
	let handle = null;
	return {
		get isRendering(): boolean {
			return handle !== null;
		},
		notifyIsRendering(): void {
			if(handle === null) {
				handle = setTimeout(() => {
					handle = null
				});
			}
		},
		reset() {
			if(handle) {
				clearTimeout(handle);
				handle = null;
			}
		}
	}
}

export function getWatches(service: any): Set<string> {
	return service[SYM_WATCHES];
}


/**
 * Gets the current components name
 * @__PURE__
 * @internal
 */
export function currentRenderingComponentName(): string | undefined {
	if(!__DEV__) {
		return undefined;
	} else {
		return React['__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'].ReactCurrentOwner.current?.elementType?.name;
	}
}

/**
 * Lightweight logging
 * @internal
 * @param args
 */
export function debug(...args: any[]) {
	if(__DEV__) {
		// @ts-ignore
		console.debug(...args)
	}
}
