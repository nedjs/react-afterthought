import {useContext} from "react";
import {AfterthoughtInjector, AfterthoughtServices} from "../types";
import {AfterthoughtContext} from "../AfterthoughtProvider";

export function useInjector<TService = AfterthoughtServices>(): AfterthoughtInjector<TService> {
	const contextValue = useContext(AfterthoughtContext)

	if (__DEV__ && !contextValue) {
		throw new Error(
			'could not find <TODO_NAME> context value; please ensure the component is wrapped in a <Provider>'
		)
	}

	return contextValue as any;
}
