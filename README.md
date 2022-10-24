# `Afterthought`

This project aims to add simple, service based global state management to a React project.
Similar to other projects such as Redux except the state can contain functions themselves and communicate
between each other easily.

## Installation

```sh
npm install react-afterthought
```

## Usage

### Basic usage

Here we create a simple counter and an increment button.

```js
import React from 'react';
import { createRoot } from 'react-dom/client';
import {AfterthoughtProvider, useService} from "react-afterthought";

// can be a class or object
class CounterService {
    number = 0;
}

function CounterComponent() {
    const counterService = useService(CounterService);
    return <div>
        <p>Count: {counterService.number}</p>
        <button onClick={() => counterService.number++}>Increment</button>
    </div>
}

function App() {
    return <AfterthoughtProvider services={{CounterService}}>
        <CounterComponent />
    </AfterthoughtProvider>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```
