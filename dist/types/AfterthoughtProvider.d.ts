import { AfterthoughtInjector, ServiceDefinitions } from "./types";
import React from "react";
export declare const AfterthoughtContext: React.Context<AfterthoughtInjector<import("./types").AfterthoughtServices>>;
export declare function AfterthoughtProvider(props: {
    injector?: never;
    services: ServiceDefinitions<any>;
    children?: any;
} | {
    injector: AfterthoughtInjector;
    services?: never;
    children?: any;
}): JSX.Element;
