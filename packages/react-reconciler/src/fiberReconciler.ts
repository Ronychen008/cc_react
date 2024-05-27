import { FiberNode, FiberRootNode } from './fiber';
import {
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue,
	createUpdate
} from './updateQueue';
import { HostRoot } from './workTags';
import type { Container } from 'hostConfig';
import { scheduleUpdateOnFiber } from './workLoop';
import type { ReactElementType } from 'shared/ReactTypes';

// mount 时调用的 API
// ReactDOM.createRoot(container).render(reactElement)

/**
 * 执行 createRoot 后，方法内部会调用 createContainer
 * @param container // 就是传入的那个根dom节点div #root
 * @returns
 */
export function createContainer(container: Container) {
	// 创建两者，并关连
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

/**
 * 执行 render 后，方法内部会调用 updateContainer
 * @param element
 * @param root
 * @returns
 */
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	// 创建更新
	const update = createUpdate<ReactElementType | null>(element);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);

	// 调度更新，连接 container 和 renderRoot 的更新流程
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
