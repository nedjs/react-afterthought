import {
	AfterthoughtInjector,
	ToServiceInstance,
	AfterthoughtServices,
	ClassConstructor, ValidServiceKey, ServiceHistory, ServiceInstances, ServiceDefinitions
} from "./types";
import {
	createRenderingTracker,
	currentRenderingComponentName,
	debug, ReactRenderingTracker,
} from "./util/helpers";
import {Dispatcher, DispatchHandler} from "./util/Dispatcher";
import {AfterthoughtService, SYM_PROXY_INDICATOR, SYM_WATCHES} from "./AfterthoughtService";


export function createInjector<TServices = AfterthoughtServices>(services: TServices): AfterthoughtInjector<TServices> {
	return new AfterthoughtInjectorImpl<TServices>(services as any)
}

function unwrapProxy(obj: any) {
	if(Array.isArray(obj)) {
		return obj.map(unwrapProxy);
	} else if(obj) {
		let v = obj[SYM_PROXY_INDICATOR];
		if(v) return v;
	}

	return obj;
}

class AfterthoughtInjectorImpl<TServices = AfterthoughtServices> implements AfterthoughtInjector<TServices> {
	public readonly _renderingTracker = createRenderingTracker();

	public readonly services: ServiceInstances<TServices> = createServiceProxy(this);
	private readonly serviceNames = new Map<string, any>();
	private readonly dispatcher = new Dispatcher();
	private readonly serviceInstances = new Map<any, {
		instance: any,
		type: any,
		name: string
	}>;
	private readonly injectorContext: ServiceContext = {
		renderingTracker: this._renderingTracker,
		dispatcher: this.dispatcher
	}


	constructor(
		config: ServiceDefinitions<TServices>
	) {
		for (let key in config) {
			this.serviceNames.set(key, config[key]);

			this.serviceInstances.set(config[key], {
				instance: this.initService(config[key]),
				type: config[key],
				name: key,
			})
		}


		if(__DEV__) {
			this.dispatcher.subscribe(({path}) => {
				debug('RS-Change', path);
			})
		}
	}

	subscribe(callback: DispatchHandler<ServiceHistory>): () => void {
		return this.dispatcher.subscribe(callback);
	}

	getService<T extends ValidServiceKey<TServices>>(service: T): ToServiceInstance<T, TServices> {
		return this.initServiceProxy(service).proxy;
	}

	_getDerivedService<T extends ValidServiceKey<TServices>>(service: T, context: ProxyContext): ToServiceInstance<T, TServices> {
		return this.initServiceProxy(service, context).proxy;
	}

	private initServiceProxy(service: ValidServiceKey<TServices>, context?: ProxyContext) {
		if (typeof service === 'string') {
			service = this.serviceNames.get(service);
		}

		const entry = this.serviceInstances.get(service);
		if (!entry) {
			throw new Error('Unregistered service ' + String(service));
		}

		if(!context) {
			context = createProxyContext();
		}

		const proxyHandler = new ObjectProxyHandler(entry.instance, entry.name, createServiceProxy(this, context), this.injectorContext, context)

		return {
			proxy: new Proxy(entry.instance, proxyHandler),
			proxyHandler,
		};
	}

	private initService(service: ClassConstructor | object) {
		let instance;
		if (this.isConstructor(service)) {
			try {
				instance = new service();
			} catch (e) {
				if (!e || e.name !== 'TypeError' ||
					!(typeof e.message === 'string' && e.message.endsWith('is not a constructor'))) {
					throw e;
				} else {
					instance = service;
				}
			}
		} else {
			instance = service;
		}

		return instance;
	}

	private isConstructor(v: any): v is new() => any {
		return typeof v === 'function' && v?.prototype?.constructor
	}
}


function createServiceProxy(injector: AfterthoughtInjectorImpl<any>, proxyContext: ProxyContext = undefined) {
	return new Proxy({}, {
		get(target: any, p: string | symbol, receiver: any): any {
			if (typeof p === 'string') {
				return injector._getDerivedService(p, proxyContext);
			} else {
				return target[p];
			}
		},
		set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
			throw new Error('Cannot set a service here, services must be registered.')
		}
	})
}

type ServiceContext = {
	renderingTracker: ReactRenderingTracker,
	dispatcher: Dispatcher,
};

type ProxyContext = ReturnType<typeof createProxyContext>;
function createProxyContext() {
	return {
		watches: new Set<string>(),
		servicesRef: { value: null }
	}
}

class ObjectProxyHandler implements ProxyHandler<any> {
	public readonly proxies = new WeakMap<any, any>();

	constructor(
		public readonly target: any,
		public readonly path: string,
		public readonly services: any,
		public readonly serviceContext: ServiceContext,
		public readonly proxyContext: ProxyContext,
	) {
	}

	get(target: object, p: string | symbol, receiver: any): any {
		if(p === SYM_PROXY_INDICATOR) {
			return this.target;
		} else if(p === SYM_WATCHES) {
			return this.proxyContext.watches;
		} else if (p === 'services' && this.services) {
			return this.services;
		}

		let result;
		const propPath = this.pathForProp(p);
		if (typeof target[p] === 'function') {
			result = target[p];
		} else if (target[p] !== null && typeof target[p] === 'object') {
			if (!this.proxies.has(target[p]) || this.proxies.get(target[p]) == null) {
				this.proxies.set(target[p], new Proxy(target[p], new ObjectProxyHandler(target[p], propPath, null, this.serviceContext, this.proxyContext)));
			}
			result = this.proxies.get(target[p]);
		} else {
			result = target[p];
		}

		if (this.serviceContext.renderingTracker.isRendering) {
			debug('RS-listen:', currentRenderingComponentName(), propPath);
			this.proxyContext.watches.add(propPath);
		} else {
			debug('RS-ignore:', currentRenderingComponentName(), propPath);
		}

		return result;
	}

	set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
		if (this.serviceContext.renderingTracker.isRendering) {
			throw new Error('Trying to improperly set property: "' + String(p) + '" during a rendering. This will cause an infinite loop and is not allowed. Full path is "' + this.pathForProp(p) + '"');
		}

		newValue = unwrapProxy(newValue);

		let oldValue = target[p];
		if (Array.isArray(target)) {
			const preLen = target.length;
			const oldVal = target[p];
			target[p] = unwrapProxy(newValue);

			if (oldVal !== newValue) {
				const path = this.pathForProp(p);
				this.serviceContext.dispatcher.emit({path, oldValue, newValue});
			}

			if (target.length !== preLen) {
				const path = this.pathForProp('length');
				this.serviceContext.dispatcher.emit({path, oldValue: preLen, newValue: target.length});
			}
		} else {
			target[p] = unwrapProxy(newValue);
			if (oldValue !== newValue) {
				const path = this.pathForProp(p);
				this.serviceContext.dispatcher.emit({path, oldValue, newValue});
			}
		}
		return true;
	}

	private pathForProp(key: string | symbol) {
		return this.path + '.' + String(key)
	}
}
