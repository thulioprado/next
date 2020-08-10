export default function getRootPath(): string {
	const path = (window as any).$directusAssetBasePath || window.location.pathname;
	const parts = path.split('/');
	const adminIndex = parts.indexOf('admin');
	const rootPath = parts.slice(0, adminIndex).join('/') + '/';
	return rootPath;
}
