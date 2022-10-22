import {ServiceHistory} from "../types";

export interface DispatchHandler<T> {
	(data: T): any;
}

/**
 * Basic doubly linked list, use this because it's easy to remove itself without affecting other nodes position
 */
class ListNode<T> {
	next?: ListNode<T>
	prev?: ListNode<T>

	constructor(
		public readonly data: T
	) {}

	add(node: ListNode<T>) {
		const pn = this.next;
		this.next = node;
		node.next = pn;
		node.prev = this;
	}

	removeSelf() {
		if(this.next)
			this.next.prev = this.prev;
		if(this.prev)
			this.prev.next = this.next;

		this.next = undefined;
		this.prev = undefined;
	}
}

export class Dispatcher<T = ServiceHistory> {
	private readonly handlersHead = new ListNode<DispatchHandler<T>>(null);

	emit(data: T) {
		// go next right away cause handlersHead is always a placeholder node
		let node = this.handlersHead.next;
		while(node) {
			node.data(data);
			node = node.next;
		}
	}

	listen(callback: DispatchHandler<T>) {
		const newNode = new ListNode(callback);

		this.handlersHead.add(newNode);

		return () => {
			newNode.removeSelf();
		}
	}
}
