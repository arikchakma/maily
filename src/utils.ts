import { clsx, type ClassValue } from 'clsx';

export function generateKey() {
	// Length of 9 is chosen because it is the maximum length of a valid CSS selector.
	return Math.random().toString(36).substr(2, 9);
}

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}
