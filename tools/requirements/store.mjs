import fs from 'node:fs/promises';
import path from 'node:path';
import {
  normalizeOrders,
  parseRequirementsMarkdown,
  sanitizeRequirementPatch,
  serializeRequirementsMarkdown,
  validateRequirement,
  validateRequirements,
} from './schema.mjs';
import {
  buildCreateAnchorChange,
  buildRebindAnchorChanges,
  removeStaticRequirementAnchors,
  validateChangedSource,
} from './source-locator.mjs';
import { writeFilesAtomically } from './atomic-write.mjs';

export class RequirementStore {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.markdownPath = path.resolve(rootDir, 'docs/PROTOTYPE_REQUIREMENTS.md');
  }

  async read() {
    return parseRequirementsMarkdown(await fs.readFile(this.markdownPath, 'utf8'));
  }

  async commit(requirements, sourceChanges = []) {
    const markdown = serializeRequirementsMarkdown(requirements);
    const verifiedRequirements = parseRequirementsMarkdown(markdown);
    for (const change of sourceChanges) validateChangedSource(change.content, change.filePath);
    await writeFilesAtomically([
      { filePath: this.markdownPath, content: markdown },
      ...sourceChanges,
    ]);
    return verifiedRequirements;
  }

  async create(input) {
    const requirements = await this.read();
    const id = nextCustomId(requirements);
    const sameModule = requirements.filter((requirement) => requirement.route === input.route && requirement.surface === input.surface);
    const requirement = validateRequirement({
      id,
      surface: input.surface,
      route: input.route,
      order: sameModule.length + 1,
      title: input.title,
      functionalRequirement: input.functionalRequirement,
      businessRules: input.businessRules,
    }, '新需求');
    const sourceChange = await buildCreateAnchorChange(this.rootDir, input.source ?? input.locator, id);
    return this.commit([...requirements, requirement], [sourceChange]);
  }

  async update(id, input) {
    const requirements = await this.read();
    const index = requirements.findIndex((requirement) => requirement.id === id);
    if (index < 0) throw notFound(id);
    const current = requirements[index];
    const patch = sanitizeRequirementPatch(input);
    const moduleChanged = (patch.route && patch.route !== current.route)
      || (patch.surface && patch.surface !== current.surface);
    const order = moduleChanged
      ? requirements.filter((requirement) => requirement.id !== id
        && requirement.route === (patch.route ?? current.route)
        && requirement.surface === (patch.surface ?? current.surface)).length + 1
      : current.order;
    requirements[index] = validateRequirement({ ...current, ...patch, order }, `需求 ${id}`);
    return this.commit(normalizeOrders(requirements));
  }

  async delete(id) {
    const requirements = await this.read();
    if (!requirements.some((requirement) => requirement.id === id)) throw notFound(id);
    const sourceChanges = await removeStaticRequirementAnchors(this.rootDir, id);
    return this.commit(requirements.filter((requirement) => requirement.id !== id), sourceChanges);
  }

  async reorder(id, input) {
    const requirements = await this.read();
    const requirement = requirements.find((item) => item.id === id);
    if (!requirement) throw notFound(id);
    const group = requirements
      .filter((item) => item.route === requirement.route && item.surface === requirement.surface && item.id !== id)
      .sort((left, right) => left.order - right.order);

    let targetIndex;
    if (input?.direction === 'up' || input?.direction === 'down') {
      const currentIndex = requirements
        .filter((item) => item.route === requirement.route && item.surface === requirement.surface)
        .sort((left, right) => left.order - right.order)
        .findIndex((item) => item.id === id);
      targetIndex = input.direction === 'up' ? Math.max(0, currentIndex - 1) : Math.min(group.length, currentIndex + 1);
    } else if (Number.isInteger(input?.order)) {
      targetIndex = Math.max(0, Math.min(group.length, input.order - 1));
    } else if (typeof input?.beforeId === 'string') {
      targetIndex = group.findIndex((item) => item.id === input.beforeId);
      if (targetIndex < 0) throw new Error('beforeId 不在同一模块');
    } else if (typeof input?.afterId === 'string') {
      targetIndex = group.findIndex((item) => item.id === input.afterId);
      if (targetIndex < 0) throw new Error('afterId 不在同一模块');
      targetIndex += 1;
    } else {
      throw new Error('reorder 需要 order、beforeId 或 afterId');
    }
    group.splice(targetIndex, 0, requirement);
    const orderById = new Map(group.map((item, index) => [item.id, index + 1]));
    return this.commit(requirements.map((item) => item.route === requirement.route && item.surface === requirement.surface
      ? { ...item, order: orderById.get(item.id) }
      : item));
  }

  async rebind(id, input) {
    const requirements = await this.read();
    if (!requirements.some((requirement) => requirement.id === id)) throw notFound(id);
    const sourceChanges = await buildRebindAnchorChanges(this.rootDir, input?.source ?? input?.locator, id);
    return this.commit(requirements, sourceChanges);
  }

  async importOverrides(input) {
    const requirements = await this.read();
    const overrides = input?.overrides ?? input;
    if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
      throw new Error('overrides 必须是以需求 ID 为键的对象');
    }
    const knownIds = new Set(requirements.map((requirement) => requirement.id));
    for (const id of Object.keys(overrides)) {
      if (!knownIds.has(id)) throw new Error(`未知需求 ID：${id}`);
    }
    const merged = requirements.map((requirement) => {
      const override = overrides[requirement.id];
      if (override === undefined) return requirement;
      return validateRequirement({
        ...requirement,
        ...sanitizeRequirementPatch(override),
        id: requirement.id,
        order: requirement.order,
      }, `需求 ${requirement.id}`);
    });
    return this.commit(validateRequirements(merged));
  }
}

function nextCustomId(requirements, now = new Date()) {
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const prefix = `custom-${date}-`;
  const sequence = requirements.reduce((highest, requirement) => {
    if (!requirement.id.startsWith(prefix)) return highest;
    const value = Number(requirement.id.slice(prefix.length));
    return Number.isInteger(value) ? Math.max(highest, value) : highest;
  }, 0) + 1;
  return `${prefix}${String(sequence).padStart(3, '0')}`;
}

function notFound(id) {
  const error = new Error(`未找到需求：${id}`);
  error.statusCode = 404;
  return error;
}
