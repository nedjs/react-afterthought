import React from "react";


/**
 * Determines if we are currently rendering a component, EG: Can we add hooks here
 * @internal
 */
export function isInReactRendering() {
	// Not sure how to correctly get this without being a React internal developer
	return !!React['__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'].ReactCurrentOwner.current;
}

/**
 * Determines if we are in the dispatching portion of React.. Note I dont actually know the proper
 * terminology, im just making this up as I go
 * @internal
 */
export function isInReactDispatching() {
	// Not sure how to correctly get this without being a React internal developer
	return !!React['__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'].ReactCurrentDispatcher.current;
}

export function currentRenderingComponentName() {
	return React['__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'].ReactCurrentOwner.current?.elementType?.name;
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
