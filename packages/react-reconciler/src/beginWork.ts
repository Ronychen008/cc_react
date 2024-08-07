// 递归中的递阶段
/**
 * 在beginwork中更新副作用只会标记两类结构变化相关的flags：Placement、ChildDeletion
 * @returns
 */

import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';

export const beginWork = (wip: FiberNode) => {
	// 比较 + 返回子FiberNode
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case FunctionComponent:
			return updateFunctionComponent(wip);
		case HostText:
			// 文本节点没有子节点，因此‘递’到底了
			return null;
		// case FunctionComponent:
		// 	return updateFunctionComponent(wip, renderLane);
		// case Fragment:
		// 	return updateFragment(wip);
		default:
			if (__DEV__) {
				console.warn('(beginWork)', '未实现的类型', wip);
			}
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// 对于 HostRoot
// 1. 计算状态最新值
// 2. 创建子 fiberNode
function updateHostRoot(wip: FiberNode) {
	// 首屏渲染时不存在
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	// 已经开始计算了，计算完成后 pending 就没有用了
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	// 最新状态，也就是传入的 ReactElement
	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	// 对于 HostComponent，不会触发更新
	// 1. 创建子 fiberNode
	// children 从 react element 的 props 中取
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	// 获取父节点的 current fiberNode 来对比，返回 wip 的子 fiberNode
	const current = wip.alternate;
	if (current !== null) {
		// 首次渲染过程中，只有 HostRoot 会走到这里
		// 因为在 renderRoot 时，通过创建 wip，使得它是唯一的存在 wip 和 current 的 fiberNode
		// 更新
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// 首次渲染
		wip.child = mountChildFibers(wip, null, children);
	}
}
