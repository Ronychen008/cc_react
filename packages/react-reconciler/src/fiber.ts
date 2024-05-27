/* eslint-disable @typescript-eslint/no-explicit-any */
import { Props, Key, Ref, ReactElementType } from '../../shared/ReactTypes';
import { WorkTag, FunctionComponent, HostComponent } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

export class FiberNode {
	tag: WorkTag;
	key: Key;
	stateNode: any;
	type: any;
	ref: Ref;
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	pendingProps: Props; // 工作前的props
	memoizedProps: Props | null; // 工作后保存的props
	memoizedState: any;
	alternate: FiberNode | null; // workInProgress fiberNode与current fiberNode之间的关联指针，即 workInProgress fiberNode.alternate =current fiberNode
	flags: Flags;
	subtreeFlags: Flags;
	updateQueue: any;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例属性
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;

		// 构成树状结构，表示节点关系的属性
		this.return = null; // 指向父fiberNode
		this.sibling = null; // 指向兄弟fiberNode
		this.child = null; // 指向子fiberNode
		this.index = 0;

		this.ref = null;

		// 作为工作单位
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;
		this.alternate = null;

		// 副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
	}
}

// 创建FiberRootNode的构造函数
export class FiberRootNode {
	container: Container;
	current: FiberNode; // 指向hostRootFiber
	finishedWork: FiberNode | null; // 最终递归完后的hostRootFiber

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

// 创建workInProgress
export function createWorkInProgress(
	current: FiberNode,
	pendingProps: Props
): FiberNode {
	let wip = current.alternate;

	if (wip === null) {
		// mount阶段
		// 需要新建一个 FiberNode
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update阶段
		wip.pendingProps = pendingProps;
		// 清除副作用，因为可能是上次更新遗留的
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	wip.ref = current.ref;

	return wip;
}

// 根据element创建fiberNode
export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('createFiberFromElement', '未定义的 type 类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
