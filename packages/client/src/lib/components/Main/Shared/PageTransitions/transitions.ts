import { fade } from 'svelte/transition';
import { lerp } from '$lib/modules/utils/maths';
import { elasticOut } from 'svelte/easing';

type LayoutRouteId =
	| '/'
	| '/(rooms)'
	| '/(rooms)/[roomId]'
	| '/(rooms)/[roomId]/enter'
	| '/(rooms)/landlord'
	| '/outcome/[id]'
	| null;

export type TransitionConfig = {
	from: LayoutRouteId | '*';
	to: LayoutRouteId | '*';
	transition: TransitionFunction;
	config: Record<string, string | number>;
};

export const wipe = (
	_: HTMLElement,
	params: {
		delay?: number;
		duration?: number;
		feather?: number;
		easing?: (t: number) => number;
	}
) => {
	return {
		delay: params.delay || 0,
		duration: params.duration || 400,
		easing: params.easing || elasticOut,
		css: (t, _) => {
			const whiteLeft = lerp(0, 0.5, t);
			const whiteRight = lerp(1, 0.5, t);
			const angle = 90;
			return `
        position: fixed;
        inset: 0;
        z-index: 9;
        -webkit-mask-image: linear-gradient(${angle}deg, #ffff ${whiteLeft * 100}%, #0000, #ffff ${whiteRight * 100}%);
        mask-image: linear-gradient(${angle}deg, #ffff ${whiteLeft * 100}%, #0000, #ffff ${whiteRight * 100}%);
        -webkit-mask-size: 100vw 100vh;
        mask-size: 100vw 100vh;
        mask-position: 50% 50%;
        mask-repeat: no-repeat;
      `;
		}
	};
};

export const leftToRight = (
	node: HTMLElement,
	params: {
		delay?: number;
		duration?: number;
		feather?: number;
		easing?: (t: number) => number;
	}
) => {
	const css = (t, _) => `
  position: fixed;
  inset: 0;
  z-index: 9;
  -webkit-mask-image: linear-gradient(to left,  #ffff ${t * 100}%, #0000 ${t * 100 + (params?.feather || 0)}%);
  mask-image: linear-gradient(to left,  #ffff ${t * 100}%, #0000 ${t * 100 + (params?.feather || 0)}%);
  -webkit-mask-size: 100vw 100vh;
  mask-size: 100vw 100vh;
  mask-position: 50% 50%;
  mask-repeat: no-repeat;
`;

	return {
		delay: params.delay || 0,
		duration: params.duration || 400,
		easing: params.easing || elasticOut,
		css
	};
};

export function whoosh(
	node: HTMLElement,
	params: { delay?: number; duration?: number; easing?: (t: number) => number }
) {
	const existingTransform = getComputedStyle(node).transform.replace('none', '');

	return {
		delay: params.delay || 0,
		duration: params.duration || 400,
		easing: params.easing || elasticOut,
		css: (t, u) => `transform: ${existingTransform} scale(${t})`
	};
}

export const transitionFunctions = {
	fade,
	doorsOpen: wipe,
	leftToRight
};

export type TransitionFunction = keyof typeof transitionFunctions;
