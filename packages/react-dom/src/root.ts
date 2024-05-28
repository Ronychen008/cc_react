import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconciler';

import type { Container } from './hostConfig';
import type { ReactElementType } from 'shared/ReactTypes';

// ReactDOM.createRoot(root).render(element)

export function createRoot(container: Container) {
	const root = createContainer(container);
	return {
		render(element: ReactElementType) {
			return updateContainer(element, root);
		}
	};
}
