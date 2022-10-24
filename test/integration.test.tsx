import React, {useRef} from 'react'
import '@testing-library/jest-dom'
import {render, screen, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AfterthoughtProvider, createInjector, useService} from "../src";

function createTestComponent() {
	class Service {
		number = 0;
		notUsedValue = 0;
	}
	const injector = createInjector({Service});

	function RenderNumber() {
		const renderCount = useRef(0);

		renderCount.current++;

		const service = useService(Service);
		return <>
			<span role={'renderCount'}>{renderCount.current}</span>
			<span role={'output'}>{service.number}</span>
			<button role={'increment'} onClick={() => {
				service.number++;
			}}>Increment</button>
		</>
	}

	const Component = () => {
		return <AfterthoughtProvider injector={injector}>
			<RenderNumber></RenderNumber>
		</AfterthoughtProvider>
	}

	return {
		Component,
		injector,
	}
}

describe('Integration: rendering', () => {
	it('doesnt re-render on unsued value', async () => {
		const {Component, injector} = createTestComponent();
		render(<Component />);
		injector._renderingTracker.reset();

		// check updating a not used value has no effect on render
		await act(async () => {
			injector.services.Service.notUsedValue++;
		});

		expect(await screen.findByRole('renderCount').then(v => v.textContent)).toEqual('1');
		expect(await screen.findByRole('output').then(v => v.textContent)).toEqual('0')
	})

	it('re-renders through component interaction', async () => {
		const {Component, injector} = createTestComponent();
		render(<Component />);
		injector._renderingTracker.reset();

		await act(async () => {
			const el = await screen.findByRole('increment');
			await userEvent.click(el)
		});
		expect(await screen.findByRole('renderCount').then(v => v.textContent)).toEqual('2');
		expect(await screen.findByRole('output').then(v => v.textContent)).toEqual('1')
	})

	it('re-renders through external modification', async () => {
		const {Component, injector} = createTestComponent();
		render(<Component />);
		injector._renderingTracker.reset();

		await act(async () => {
			injector.services.Service.number++;
		});
		expect(await screen.findByRole('renderCount').then(v => v.textContent)).toEqual('2');
		expect(await screen.findByRole('output').then(v => v.textContent)).toEqual('1')
	})
})
