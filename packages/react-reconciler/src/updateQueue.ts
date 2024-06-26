import { Action } from '../../shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	// 这样的结构是为了在 wip 和 current 之间共享
	shared: {
		pending: Update<State> | null;
	};
}

/**
 * Update 实例化方法
 * @param action
 * @returns
 */
export function createUpdate<State>(action: Action<State>): Update<State> {
	return {
		action
	};
}

/**
 * UpdateQueue 实例化方法
 * @returns
 */
export function createUpdateQueue<State>(): UpdateQueue<State> {
	return {
		shared: {
			pending: null
		}
	};
}

/**
 * 往 updateQueue 中添加一个update
 * @param updateQueue
 * @param update
 */
export function enqueueUpdate<State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) {
	// // 支持存放多个 update
	// const pending = updateQueue.shared.pending;
	// if (pending === null) {
	// 	// pending -> a -> a a和自己形成环状链表
	// 	update.next = update;
	// } else {
	// 	// pending -> b -> a -> b
	// 	// pending -> c -> a -> b -> c
	// 	update.next = pending.next;
	// 	pending.next = update;
	// }
	updateQueue.shared.pending = update;
	// pending 始终指向最后一个 update
	// pending.next 就能拿到第一个 update
}

/**
 * updateQueue 消费 update
 * @param baseState 初始状态
 * @param pendingUpdate 消费的 update
 * @returns 全新的状态
 */
export function processUpdateQueue<State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): {
	memoizedState: State;
} {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// 函数形式的更新setState((oldState)=>4(oldState))
			// baseState 1 update (x) => 4x -> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// 直接对像形式的更新setState({xxx:2})
			// baseState 1 update 2 -> memoizedState 2
			result.memoizedState = action;
		}
	}

	return result;
}
