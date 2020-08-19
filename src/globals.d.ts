export {};
declare global {
	namespace jest {
		interface Matchers<R> {
			toBeLeft(content?: any): R;
			toBeRight(content?: any): R;
		}
	}
}
