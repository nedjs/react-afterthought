import React from 'react';
import {create, act} from 'react-test-renderer';
import {AfterthoughtProvider, createInjector, useService} from "../src";


describe('ServiceInjector', () => {

	it(`for class creates all services on startup`, () => {
		let created = false;
		class Service {
			constructor() {
				created = true;
			}
		}
		createInjector({Service});

		expect(created).toEqual(true);
	});

	it('for object calling a service gives the same value', () => {
		const Service = {
			number: 1
		};
		const injector = createInjector({Service});
		injector.getService(Service).number++;
		expect(injector.getService(Service).number).toEqual(2);
	})

	it('for class calling a service gives the same value', () => {
		class Service {
			number = 1
		}
		const injector = createInjector({Service});
		injector.getService(Service).number++;
		expect(injector.getService(Service).number).toEqual(2);
	})

	it('All ways of getting a service give the same value', () => {
		const _refMap = new Map();
		function getRef(v: any) {
			if(_refMap.has(v)) _refMap.set(v, () => {});
			return _refMap.get(v);
		}

		class Service {
			refObj = getRef(this);
		}
		const injector = createInjector({Service});

		// all the ways to get a service
		const allServices = [
			injector.getService('Service'),
			injector.getService(Service),
			injector.services.Service,
		]
		injector.getService(Service).refObj
		injector.getService('Service').refObj
		injector.services.Service.refObj

		let prev = allServices[0];
		for(let i=1;i<allServices.length;i++) {
			expect(prev).toEqual(allServices[0]);
			expect(prev.refObj).toEqual(allServices[0].refObj);
		}
	})
})
