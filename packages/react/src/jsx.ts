/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Type,
	Key,
	Props,
	Ref,
	ElementType,
	ReactElementType
} from '../../shared/ReactTypes';
import { REACT_ELEMENT_TYPE } from '../../shared/ReactSymbols';

function ReactElement(type: Type, key: Key, ref: Ref, props: Props) {
	const element: ReactElementType = {
		$$typeof: REACT_ELEMENT_TYPE,
		key,
		ref,
		props,
		type,
		__ccProps: 'Ronychen'
	};
	return element;
}

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		if (prop === 'key') {
			if (val !== undefined) {
				key = `${val}`;
			}
			continue;
		}
		if (Object.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	const maybeChidlrenLength = maybeChildren.length;
	if (maybeChidlrenLength) {
		if (maybeChidlrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}
	return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	return ReactElement(type, key, ref, props);
};
