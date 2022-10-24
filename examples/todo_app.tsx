import React from 'react';
import {createRoot} from 'react-dom/client';
import {AfterthoughtProvider, useService} from "../src";

class CounterService {
	number = 0;

	reset() {
		this.number = 0;
	}
}

function CounterComponent() {
	const counterService = useService(CounterService);
	return <div>
		<p>Count: {counterService.number}</p>
		<button onClick={() => counterService.number++}>Increment</button>
		<button onClick={() => counterService.reset()}>Reset</button>
	</div>
}

function App() {
	return <AfterthoughtProvider services={{CounterService}}>
		<CounterComponent/>
	</AfterthoughtProvider>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
