import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconciler';

import type { Container } from './hostConfig';
import type { ReactElementType } from 'shared/ReactTypes';

// ReactDOM.createRoot(root).render(element)

export function createRoot(container: Container) {
	// Container就是你要挂载的容器dom
	const root = createContainer(container); // 这个root是FiberRootNode最顶层的那个
	return {
		render(element: ReactElementType) {
			// 传入的jsx ReactElement
			return updateContainer(element, root);
		}
	};
}
