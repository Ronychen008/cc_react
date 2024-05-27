// 递归中的归阶段
/**
 *需要解决的问题:
 1、对于Host类型的fiberNode：构建离屏dom树
 2、标记update flags
 */
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import {
	createInstance,
	appendInitialChild,
	createTextInstance
} from 'hostConfig';
import { NoFlags } from './fiberFlags';

import { FiberNode } from './fiber';

export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	switch (wip.tag) {
		case HostComponent:
			if (current !== null && current.stateNode) {
				// update 暂不处理
			} else {
				// mount
				// 构建离屏 DOM，同时记录 props 到 DOM 上
				const instance = createInstance(wip.type, newProps); //dom节点
				// 将子 fiber 创建好的 DOM 插入到 dom树 中
				appendAllChildren(instance, wip);
				// 将当前插入完成的更大的 DOM 树位置记录在 FiberNode 中
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && current.stateNode) {
				// update 暂不处理
			} else {
				// 构建离屏 DOM
				const instance = createTextInstance(newProps.content);
				// hostText 不存在 child，不需要挂载
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('(completeWork)', ': 未处理的 CompleteWork 情况');
			}
	}
};

function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	// 插入的应该是组件中的实际节点
	// 比如对于函数组件，应该插入的是函数组件中经过递归找到的实际的节点

	let node = wip.child;

	while (node !== null) {
		if (node?.tag === HostComponent || node?.tag === HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node?.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node?.sibling === null) {
			if (node?.return === null || node?.return === wip) {
				return;
			}
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
