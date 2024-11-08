import { zodToTs, printNode, createTypeAlias } from 'zod-to-ts'
import { q } from 'groqd'
import path from 'path'
import fs from 'node:fs/promises'
import type { Dirent } from 'fs'

const readFile = async (
	filePath: string,
): Promise<
	| [value: [content: string, relativePath: string] | null, error: null]
	| [value: null, error: Error]
> => {
	const fileContents = await fs.readFile(filePath, 'utf8')
	if (!fileContents.includes('@typegen')) {
		return [null, null]
	}
	return [[fileContents, path.relative(process.cwd(), filePath)], null]
}

const isInt = (value: unknown): value is number => Number.isInteger(value)

const findAllObjects = (content: string): Array<string> => {
	const objects: Array<string> = []
	for (const line of content.split('\n')) {
		const match = line.match(/@typegen/)
		if (isInt(match?.index)) {
			const startingPoint = match.index + '@typegen '.length
			const variableName = line.slice(startingPoint).split(' ')[0]
			if (variableName) {
				objects.push(variableName)
			}
		}
	}
	return objects
}

const capitalize = (s: string): string => {
	const firstChar = s.at(0)
	if (!firstChar) {
		return s
	}
	return `${firstChar.toUpperCase()}${s.slice(1)}`
}

const toTypedef = (
	importedModule: Record<string, unknown>,
	objectName: string,
): string => {
	const name = capitalize(objectName)
	try {
		return printNode(
			createTypeAlias(
				zodToTs(importedModule[objectName] as never, name
				).node, name
			)
		)
	} catch {
		return printNode(
			createTypeAlias(
				zodToTs(
					q.object(
						importedModule[objectName] as never
					), name
				).node, name
			),
		)
	}
}

const getTypeDefs = async (content: string, relativePath: string) => {
	const results = []
	try {
		const objects = findAllObjects(content)
		if (!objects.length) {
			return [null, null] as const
		}

		const currentModule = await import(
			['.', ...relativePath.split(path.sep)].join('/')
		)
		for (const object of objects) {
			results.push(toTypedef(currentModule, object))
		}
	} catch (error) {
		return [null, error] as const
	}
	return [results, null] as const
}

const expectedPath = ['apps', 'trpc', 'src', 'api'].join(path.sep)
const currentPath = process.cwd()
if (!currentPath.endsWith(expectedPath)) {
	console.error(`The script should be ran from ${expectedPath}`)
	process.exit(1)
}

const handleFile = async (file: Dirent) => {
	const [fileContent, errorReadingFile] = await readFile(
		path.join(file.parentPath, file.name),
	)
	if (errorReadingFile) {
		console.error(errorReadingFile)
		process.exit(1)
	}
	if (!fileContent) {
		return null
	}
	const [content, relativePath] = fileContent
	const [typedefs, error] = await getTypeDefs(content, relativePath)
	if (error) {
		console.error('Error getting typedefs\n', relativePath, '\n', error)
		process.exit(1)
	}

	return typedefs?.join('\n/* ==== */\n') || null
}

const readAllDirs = async () => {
	const filesList = await fs.readdir(currentPath, {
		withFileTypes: true,
	})
	const dirsToRead = [] as Array<Dirent>
	const files = [] as Array<Dirent>
	for (const file of filesList) {
		if (file.isDirectory()) {
			dirsToRead.push(file)
		} else if (
			file.isFile() &&
			file.name.endsWith('.ts') &&
			file.name !== 'typegen.ts'
		) {
			files.push(file)
		}
	}
	while (dirsToRead.length) {
		const dir = dirsToRead.pop()
		if (!dir) {
			throw new Error('Impossible state!')
		}
		const filesList = await fs.readdir(path.join(dir.parentPath, dir.name), {
			withFileTypes: true,
		})
		for (const file of filesList) {
			if (file.isDirectory()) {
				dirsToRead.push(file)
			} else if (
				file.isFile() &&
				file.name.endsWith('.ts') &&
				file.name !== 'typegen.ts'
			) {
				files.push(file)
			}
		}
	}
	return files
}

const main = async () => {
	const files = await readAllDirs()
	const promises = [] as Array<Promise<string | null>>
	for (const file of files) {
		promises.push(handleFile(file))
	}
	const typedefs = await Promise.all(promises)

	await fs.writeFile(
		path.join(currentPath, 'generated-types.d.ts'),
		typedefs.filter(Boolean).join('\n/* ==== */\n'),
		{
			encoding: 'utf8',
		},
	)
}

main()
