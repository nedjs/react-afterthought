import React from "react";

// Our sneeky way of tracking rendering in react... it's not ideal at all
export const RS_CONTEXT = (() => {
	let stack = [];
	return {
		get current() {
			return stack[stack.length-1];
		},
		enter(service: any) {
			stack.push(service);
		},
		exit() {
			stack.pop();
		}
	};
})();


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
