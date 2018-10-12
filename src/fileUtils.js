import { deferred } from './deferred';
const esprima = require('esprima');

/**
 * Returns a linear file list from a nested file strcuture.
 * It excludes the folders from the returned list.
 * @param {array} files Nested file structure
 */
export function linearizeFiles(files) {
	function reduceToLinearFiles(files) {
		return files.reduce((list, currentFile) => {
			if (currentFile.isFolder) {
				return [...list, ...reduceToLinearFiles(currentFile.children)];
			} else {
				return [...list, currentFile];
			}
		}, []);
	}
	return reduceToLinearFiles(files);
}

/**
 * Recursively iterates and assigns the `path` property to the files in passed files
 * array.
 * @param {array} files files structure for an item
 * @param {string} parentPath Parent path to prefix with all processed files
 */
export function assignFilePaths(files, parentPath = '') {
	files.forEach(file => {
		file.path = parentPath ? `${parentPath}/${file.name}` : file.name;
		if (file.isFolder) {
			assignFilePaths(
				file.children,
				parentPath ? `${parentPath}/${file.name}` : file.name
			);
		}
	});
	return files;
}

/**
 * Returns the file object and it's index that is direct child of passed files array with name as passed fileName.
 * If not found, returns -1
 * @param {array} files files structure for an item
 * @param {string} fileName File/folder name
 */
export function getChildFileFromName(files, fileName) {
	const index = files.findIndex(file => file.name === fileName);
	return { index, file: files[index] };
}

/**
 * Returns the file object and it's index in its parent for the passed path.
 * If not found, returns {index:-1}
 * @param {array} files files structure for an item
 * @param {string} path Path of file to search
 */
export function getFileFromPath(files, path) {
	let currentFolder = files;
	const pathPieces = path.split('/');
	while (pathPieces.length > 1) {
		let folderName = pathPieces.shift();
		currentFolder = getChildFileFromName(currentFolder, folderName).file
			.children;
	}
	// now we should be left with just one value in the pathPieces array - the actual file name
	return getChildFileFromName(currentFolder, pathPieces[0]);
}

/**
 * Returns the file object and it's index in its parent for the passed path.
 * If not found, returns {index:-1}
 * @param {array} files files structure for an item
 * @param {string} path Path of file to search
 */
export function removeFileAtPath(files, path) {
	let currentFolder = files;
	const pathPieces = path.split('/');
	while (pathPieces.length > 1) {
		let folderName = pathPieces.shift();
		currentFolder = getChildFileFromName(currentFolder, folderName).file
			.children;
	}
	// now we should be left with just one value in the pathPieces array - the actual file name
	const { index } = getChildFileFromName(currentFolder, pathPieces[0]);
	currentFolder.splice(index, 1);
}

/**
 * Checks if a file with same name exists in the passed folder.
 * @param {object} folder Folder to search in
 * @param {string} fileName File name to search for
 */
export function doesFileExistInFolder(folder, fileName) {
	const details = getChildFileFromName(folder.children, fileName);
	return !!details.file;
}
