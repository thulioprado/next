import getRootPath from './get-root-path';

describe('Utils / get root path', () => {
	it('Calculates the correct API root URL based on window', () => {
		Object.defineProperty(window, 'location', {
			value: {
				pathname: '/api/nested/admin',
			},
			writable: true,
		});

		expect(getRootPath()).toBe('/api/nested/');

		(window as any).$directusAssetBasePath = '/some/other/path/admin';
		expect(getRootPath()).toBe('/some/other/path/');

		delete (window as any).$directusAssetBasePath;
	});
});
