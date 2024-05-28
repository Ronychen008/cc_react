import { FiberNode, createWorkInProgress, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { MutationMask, NoFlags } from './fiberFlags';
import { commitMutationEffects } from './commitWork';

let workInProgress: FiberNode | null = null; // 指向当前正在工作的fiberNode节点

/**
 * 初始化，让 wip 指向需要遍历的第一个 fiberNode
 * @param root
 */
function prepareFreshStack(root: FiberRootNode) {
	//root就是最顶层的fiberRootNode
	workInProgress = createWorkInProgress(root.current, {});
}

/**
 * 连接 renderRoot 的更新流程
 * @param fiber
 */
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 对于首屏渲染时穿进来的fiber是hostRootFiber,但对于其他组件中setState时传进来的fiber是当前要执行更新的组件
	// 触发更新未必从根节点，所以向上一直找到 fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber); // 这个root=fiberRootNode
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	// 正常的 fiberNode 都有 return 但是 hostRootFiber 没有 return
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);

	do {
		try {
			// shouldTimeSlice ? workLoopConcurrent() : workLoopSync();
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('(performSyncWorkOnRoot)', 'workLoop 发生错误', e);
			}
			workInProgress = null;
		}
		// eslint-disable-next-line no-constant-condition
	} while (true);
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	console.log(root);
	const finishedWork = root.finishedWork;
	if (finishedWork === null) return;

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}
	// 重置
	root.finishedWork = null;

	// 判断是否存在3个子阶段需要执行的操作(首屏渲染主要就是placement操作，所以这里只考虑mutation阶段)
	const subtreeHasEffects =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffects || rootHasEffect) {
		// before mutation
		// mutation
		commitMutationEffects(finishedWork);
		// fiber 树切换
		root.current = finishedWork;
		// // layout
		// commitLayoutEffects(finishedWork, root);
	} else {
		// fiber 树切换
		root.current = finishedWork;
	}
}

// 工作循环
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	// 这个beginWork方法就是实现了有子节点，就遍历子节点的逻辑
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	// 说明没有子节点了，要执行归阶段
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

// 这个就是为了实现没有子节点遍历兄弟节点逻辑
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		// 完成当前节点的“归”阶段
		completeWork(node);

		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			// 别着急 complete，先返回，开启兄弟节点的“递”阶段
			return;
		}

		// 完成父节点的“归”阶段
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
