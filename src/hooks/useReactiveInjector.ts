import {useContext} from "react";
import {ReactiveServicesContext} from "../ReactiveServicesRoot";
import {ReactiveInjector, ReactiveServices} from "../types";

export function useReactiveInjector<TService = ReactiveServices>() {
	const contextValue = useContext(ReactiveServicesContext)

	if (__DEV__ && !contextValue) {
		throw new Error(
			'could not find <TODO_NAME> context value; please ensure the component is wrapped in a <Provider>'
		)
	}

	return contextValue as ReactiveInjector<TService>;
}
