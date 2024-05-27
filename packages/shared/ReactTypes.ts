/* eslint-disable @typescript-eslint/no-explicit-any */
export type Type = any;
export type Key = any;
export type Props = any;
export type Ref = any;
export type ElementType = any;

export interface ReactElementType {
	$$typeof: symbol | number;
	type: ElementType;
	props: Props;
	key: Key;
	ref: Ref;
	__ccProps: string;
}

/**
 * 支持传递一个值或者函数，函数的返回值作为新的 state
 */
export type Action<State> = State | ((prevState: State) => State);
