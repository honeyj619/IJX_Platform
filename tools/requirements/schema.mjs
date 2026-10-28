import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const AUTO_GENERATED_NOTE = '<!-- 此文件由原型需求服务自动维护，请勿手工调整生成格式。 -->';
const FIELDS = ['id', 'surface', 'route', 'order', 'title', 'functionalRequirement', 'businessRules'];

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} 必须是对象`);
  }
}

function requiredText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} 不能为空`);
  return value.trim();
}

function text(value, field) {
  if (typeof value !== 'string') throw new Error(`${field} 必须是字符串`);
  return value.trim();
}

function markdownText(value) {
  return value.replace(/^---$/gm, '\\---');
}

export function validateRequirement(value, label = '需求') {
  assertPlainObject(value, label);
  const unknown = Object.keys(value).filter((key) => !FIELDS.includes(key));
  if (unknown.length) throw new Error(`${label} 包含未知字段：${unknown.join(', ')}`);

  const requirement = {
    id: requiredText(value.id, `${label}.id`),
    surface: requiredText(value.surface, `${label}.surface`),
    route: requiredText(value.route, `${label}.route`),
    order: value.order,
    title: requiredText(value.title, `${label}.title`),
    functionalRequirement: text(value.functionalRequirement, `${label}.functionalRequirement`),
    businessRules: value.businessRules,
  };
  if (!/^[a-z0-9][a-z0-9-]*$/.test(requirement.id)) throw new Error(`${label}.id 格式无效`);
  if (requirement.route !== '/admin' && !requirement.route.startsWith('/pc_client')) {
    throw new Error(`${label}.route 只允许 /admin 或 /pc_client 下的页面`);
  }
  if (!Number.isInteger(requirement.order) || requirement.order < 1) throw new Error(`${label}.order 必须是正整数`);
  if (!Array.isArray(requirement.businessRules) || requirement.businessRules.some((rule) => typeof rule !== 'string' || !rule.trim())) {
    throw new Error(`${label}.businessRules 必须是非空字符串数组`);
  }
  requirement.businessRules = requirement.businessRules.map((rule) => rule.trim());
  return requirement;
}

export function validateRequirements(values) {
  if (!Array.isArray(values)) throw new Error('requirements 必须是数组');
  const requirements = values.map((value, index) => validateRequirement(value, `需求 ${index + 1}`));
  const ids = new Set();
  for (const requirement of requirements) {
    if (ids.has(requirement.id)) throw new Error(`需求 ID 重复：${requirement.id}`);
    ids.add(requirement.id);
  }
  return requirements;
}

export function normalizeOrders(values) {
  const requirements = validateRequirements(values);
  const groups = new Map();
  for (const requirement of requirements) {
    const moduleKey = `${requirement.route}\0${requirement.surface}`;
    const group = groups.get(moduleKey) ?? [];
    group.push(requirement);
    groups.set(moduleKey, group);
  }
  return [...groups.values()].flatMap((group) => group
    .sort((left, right) => left.order - right.order)
    .map((requirement, index) => ({ ...requirement, order: index + 1 })));
}

export function parseRequirementsMarkdown(markdown) {
  if (typeof markdown !== 'string' || !markdown.trim()) throw new Error('需求 Markdown 为空');
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const requirements = [];
  let cursor = 0;
  while (cursor < lines.length) {
    while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
    if (cursor === lines.length) break;
    if (lines[cursor] !== '---') throw new Error(`第 ${cursor + 1} 行应为 frontmatter 起始标记`);
    const closing = lines.indexOf('---', cursor + 1);
    if (closing < 0) throw new Error(`第 ${cursor + 1} 行的 frontmatter 未闭合`);
    const parsed = parseYaml(lines.slice(cursor + 1, closing).join('\n'));
    requirements.push(parsed);
    cursor = closing + 1;
    const body = [];
    while (cursor < lines.length && lines[cursor] !== '---') {
      body.push(lines[cursor]);
      cursor += 1;
    }
    if (!body.join('\n').includes(AUTO_GENERATED_NOTE)) {
      throw new Error(`需求 ${requirements.length} 正文缺少自动生成说明`);
    }
  }
  return validateRequirements(requirements);
}

export function serializeRequirementsMarkdown(values) {
  const requirements = normalizeOrders(values);
  const markdown = requirements.map((requirement) => {
    const frontmatter = stringifyYaml(requirement, { lineWidth: 0 }).trimEnd();
    const rules = requirement.businessRules.length > 0
      ? requirement.businessRules.map((rule) => `- ${rule}`).join('\n')
      : '- 暂无';
    return [
      '---',
      frontmatter,
      '---',
      AUTO_GENERATED_NOTE,
      '',
      `# ${markdownText(requirement.title)}`,
      '',
      `- **功能模块**：${requirement.surface}`,
      `- **适用路由**：\`${requirement.route}\``,
      `- **模块内序号**：${requirement.order}`,
      '',
      '## 功能需求',
      '',
      markdownText(requirement.functionalRequirement) || '暂无',
      '',
      '## 业务规则',
      '',
      rules,
    ].join('\n');
  }).join('\n\n') + '\n';
  parseRequirementsMarkdown(markdown);
  return markdown;
}

export function sanitizeRequirementPatch(value) {
  assertPlainObject(value, '请求体');
  const patch = {};
  for (const field of ['surface', 'route', 'title', 'functionalRequirement', 'businessRules']) {
    if (Object.hasOwn(value, field)) patch[field] = value[field];
  }
  return patch;
}
