import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';

const traverse = traverseModule.default ?? traverseModule;
const SOURCE_EXTENSIONS = new Set(['.tsx', '.jsx']);
const ATTRIBUTE_NAME = 'data-requirement-id';

function parseSource(source, filePath) {
  return parse(source, {
    sourceType: 'module',
    sourceFilename: filePath,
    plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties', 'topLevelAwait', 'importMeta'],
  });
}

export function resolveSourcePath(rootDir, filePath) {
  if (typeof filePath !== 'string' || !filePath.trim()) throw new Error('source.filePath 不能为空');
  const srcDir = path.resolve(rootDir, 'src');
  const candidate = path.resolve(rootDir, filePath.replaceAll('\\', '/'));
  const relative = path.relative(srcDir, candidate);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('source.filePath 必须位于 src 目录内');
  if (!SOURCE_EXTENSIONS.has(path.extname(candidate).toLowerCase())) throw new Error('source.filePath 仅支持 tsx/jsx');
  return candidate;
}

export function validateLocator(locator) {
  if (!locator || typeof locator !== 'object' || Array.isArray(locator)) throw new Error('source locator 必须是对象');
  if (!Number.isInteger(locator.line) || locator.line < 1) throw new Error('source.line 必须是正整数');
  if (!Number.isInteger(locator.column) || locator.column < 0) throw new Error('source.column 必须是非负整数');
  return { filePath: locator.filePath, line: locator.line, column: locator.column };
}

function findOpeningElement(ast, locator) {
  let match = null;
  traverse(ast, {
    JSXOpeningElement(pathRef) {
      const { node } = pathRef;
      if (node.loc?.start.line === locator.line && node.loc.start.column === locator.column) {
        if (match) throw new Error('source locator 匹配到多个 JSXOpeningElement');
        match = node;
      }
    },
  });
  if (!match) throw new Error('source locator 未精确匹配 JSXOpeningElement');
  return match;
}

function hasRequirementAttribute(opening) {
  return opening.attributes.some((attribute) => t.isJSXAttribute(attribute)
    && t.isJSXIdentifier(attribute.name, { name: ATTRIBUTE_NAME }));
}

function insertionOffset(opening, source) {
  if (typeof opening.end !== 'number') throw new Error('JSXOpeningElement 缺少源码位置');
  const suffixLength = opening.selfClosing ? 2 : 1;
  const offset = opening.end - suffixLength;
  if (source.slice(offset, opening.end) !== (opening.selfClosing ? '/>' : '>')) {
    throw new Error('无法确认 JSXOpeningElement 结束位置');
  }
  return offset;
}

export function insertRequirementAnchor(source, filePath, locator, requirementId) {
  const ast = parseSource(source, filePath);
  const opening = findOpeningElement(ast, locator);
  if (hasRequirementAttribute(opening)) throw new Error('目标 JSX 元素已存在 data-requirement-id');
  const offset = insertionOffset(opening, source);
  return source.slice(0, offset) + ` ${ATTRIBUTE_NAME}="${requirementId}"` + source.slice(offset);
}

function staticAnchorRanges(source, filePath, requirementId) {
  const ranges = [];
  const ast = parseSource(source, filePath);
  traverse(ast, {
    JSXAttribute(pathRef) {
      const node = pathRef.node;
      if (!t.isJSXIdentifier(node.name, { name: ATTRIBUTE_NAME })
        || !t.isStringLiteral(node.value, { value: requirementId })
        || typeof node.start !== 'number'
        || typeof node.end !== 'number') return;
      let start = node.start;
      while (start > 0 && (source[start - 1] === ' ' || source[start - 1] === '\t')) start -= 1;
      ranges.push({ start, end: node.end });
    },
  });
  return ranges;
}

function applyRanges(source, ranges) {
  return [...ranges].sort((left, right) => right.start - left.start)
    .reduce((result, range) => result.slice(0, range.start) + result.slice(range.end), source);
}

async function listSourceFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  }));
  return nested.flat();
}

export async function removeStaticRequirementAnchors(rootDir, requirementId) {
  const files = await listSourceFiles(path.resolve(rootDir, 'src'));
  const changes = [];
  for (const filePath of files) {
    const source = await fs.readFile(filePath, 'utf8');
    const ranges = staticAnchorRanges(source, filePath, requirementId);
    if (ranges.length) changes.push({ filePath, content: applyRanges(source, ranges) });
  }
  return changes;
}

export async function buildCreateAnchorChange(rootDir, locatorValue, requirementId) {
  const locator = validateLocator(locatorValue);
  const filePath = resolveSourcePath(rootDir, locator.filePath);
  const source = await fs.readFile(filePath, 'utf8');
  return { filePath, content: insertRequirementAnchor(source, filePath, locator, requirementId) };
}

export async function buildRebindAnchorChanges(rootDir, locatorValue, requirementId) {
  const locator = validateLocator(locatorValue);
  const targetPath = resolveSourcePath(rootDir, locator.filePath);
  const changes = await removeStaticRequirementAnchors(rootDir, requirementId);
  const existingTarget = changes.find((change) => change.filePath === targetPath);
  const targetSource = existingTarget?.content ?? await fs.readFile(targetPath, 'utf8');
  const target = { filePath: targetPath, content: insertRequirementAnchor(targetSource, targetPath, locator, requirementId) };
  return [...changes.filter((change) => change.filePath !== targetPath), target];
}

export function validateChangedSource(content, filePath) {
  parseSource(content, filePath);
}
