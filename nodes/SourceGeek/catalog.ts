import type { IDataObject, INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import catalog from './tools.json';

/**
 * The node's actions come from SourceGeek's tool catalog (tools.json, a
 * snapshot of GET /api/v1/tools; refresh it with `npm run sync-tools`): one
 * operation per tool, grouped into resources, with fields built from each
 * tool's input JSON Schema.
 */

type JsonSchema = {
	type?: string | string[];
	description?: string;
	enum?: unknown[];
	items?: JsonSchema;
	default?: unknown;
	minimum?: number;
	maximum?: number;
	maxLength?: number;
	anyOf?: JsonSchema[];
	oneOf?: JsonSchema[];
	properties?: Record<string, JsonSchema>;
	required?: string[];
};

export type Tool = {
	name: string;
	title?: string;
	description?: string;
	inputSchema: JsonSchema;
	annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean };
};

export const TOOLS: Tool[] = (catalog as unknown as { tools: Tool[] }).tools;

/** How a field's n8n value becomes the tool's input. */
export type FieldKind = 'value' | 'json' | 'list';

type Resource = { value: string; name: string; matches: (tool: string) => boolean };

const RESOURCES: Resource[] = [
	{
		value: 'employeeData',
		name: 'Employee Data (LinkedIn)',
		matches: (tool) => tool.startsWith('employee_') || tool === 'get_employee_contact_details',
	},
	{
		value: 'search',
		name: 'Search',
		matches: (tool) =>
			/^(fast|precision)_search_/.test(tool) ||
			['find_all_entities', 'enrich_entity', 'search_rediscovered_talent'].includes(tool),
	},
	{
		value: 'sheet',
		name: 'Sheet and Shortlist',
		matches: (tool) =>
			[
				'create_sheet',
				'score_leads',
				'create_shortlist',
				'create_rediscovery_shortlist',
				'read_shortlist_feedback',
				'read_artifact',
				'list_artifacts',
			].includes(tool),
	},
	{
		value: 'project',
		name: 'Project',
		matches: (tool) =>
			['list_projects', 'list_tasks', 'read_task', 'plan_tasks', 'start_tasks'].includes(tool),
	},
	{
		value: 'memory',
		name: 'Memory and Workspace Context',
		matches: (tool) =>
			['remember', 'forget', 'list_memories'].includes(tool) || tool.endsWith('_workspace_context'),
	},
	{
		value: 'occupation',
		name: 'Occupation and Skill (ESCO)',
		matches: (tool) => tool.startsWith('esco_'),
	},
	{
		value: 'statistics',
		name: 'Labour Market Statistics (CBS)',
		matches: (tool) => tool.startsWith('cbs_'),
	},
	// Last: tools added to the catalog since the node knew them.
	{ value: 'other', name: 'Other', matches: () => true },
];

const resourceOf = (tool: string) => RESOURCES.find((resource) => resource.matches(tool))!.value;

const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);

const ACRONYMS: Record<string, string> = {
	id: 'ID',
	ids: 'IDs',
	url: 'URL',
	urls: 'URLs',
	csv: 'CSV',
	esco: 'ESCO',
	cbs: 'CBS',
	uri: 'URI',
	uris: 'URIs',
	linkedin: 'LinkedIn',
};

/** `searchId` → "Search ID", `company_url` → "Company URL". */
export function displayName(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.split(/[\s_]+/)
		.filter(Boolean)
		.map((word) => ACRONYMS[word.toLowerCase()] ?? word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/** n8n wants descriptions that start upper case and end with a period. */
function sentence(text: string | undefined): string | undefined {
	const trimmed = text?.trim();
	if (!trimmed) return undefined;
	const capitalised = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
	return /[.!?)]$/.test(capitalised) ? capitalised : `${capitalised}.`;
}

const typeOf = (schema: JsonSchema) =>
	Array.isArray(schema.type) ? schema.type.find((type) => type !== 'null') : schema.type;

/** Field values the request builder needs to turn back into tool input. */
export const FIELD_KINDS = new Map<string, FieldKind>();

/** What a JSON field expects, e.g. "A JSON array of objects with task (required), instruction." */
function jsonHint(schema: JsonSchema): string {
	const keys = (object: JsonSchema | undefined) => {
		const required = new Set(object?.required ?? []);
		return Object.keys(object?.properties ?? {})
			.map((key) => (required.has(key) ? `${key} (required)` : key))
			.join(', ');
	};
	if (typeOf(schema) === 'array') {
		const fields = keys(schema.items);
		return fields ? `A JSON array of objects with ${fields}.` : 'A JSON array.';
	}
	const fields = keys(schema);
	return fields ? `A JSON object with ${fields}.` : 'JSON.';
}

/** One tool input property as an n8n field (without displayOptions). */
function field(tool: string, name: string, schema: JsonSchema, required: boolean): INodeProperties {
	const base = {
		displayName: displayName(name),
		name,
		description: sentence(schema.description),
		required: required || undefined,
	};
	const type = typeOf(schema);
	const enumOptions = (values: unknown[]): INodePropertyOptions[] =>
		values
			.filter((value): value is string | number => ['string', 'number'].includes(typeof value))
			.map((value) => ({ name: displayName(String(value)), value }));
	const kind = (value: FieldKind) => FIELD_KINDS.set(`${tool}.${name}`, value);

	if (schema.enum?.length) {
		kind('value');
		const options = enumOptions(schema.enum);
		return {
			...base,
			type: 'options',
			options,
			default: (schema.default as string) ?? (required ? options[0]?.value : '') ?? '',
		};
	}
	if (type === 'string') {
		kind('value');
		const long = schema.maxLength === undefined || schema.maxLength > 300;
		return {
			...base,
			type: 'string',
			default: typeof schema.default === 'string' ? schema.default : '',
			typeOptions:
				long && /csv|description|text|content|query|message|value|body/i.test(name)
					? { rows: 4 }
					: undefined,
		};
	}
	if (type === 'integer' || type === 'number') {
		kind('value');
		return {
			...base,
			type: 'number',
			default: typeof schema.default === 'number' ? schema.default : (schema.minimum ?? 0),
			typeOptions: {
				minValue: schema.minimum,
				maxValue: schema.maximum,
				numberPrecision: type === 'integer' ? 0 : undefined,
			},
		};
	}
	if (type === 'boolean') {
		kind('value');
		return {
			...base,
			description: base.description && `Whether: ${base.description}`,
			type: 'boolean',
			default: typeof schema.default === 'boolean' ? schema.default : false,
		};
	}
	if (type === 'array' && schema.items?.enum?.length) {
		kind('value');
		return {
			...base,
			type: 'multiOptions',
			options: enumOptions(schema.items.enum).sort(byName),
			default: [],
		};
	}
	const itemType = schema.items ? typeOf(schema.items) : undefined;
	if (
		type === 'array' &&
		(itemType === 'string' || itemType === 'number' || itemType === 'integer')
	) {
		kind('list');
		return {
			...base,
			description: [base.description, 'One value per line.'].filter(Boolean).join(' '),
			type: 'string',
			default: '',
			typeOptions: { rows: 3 },
		};
	}
	// Objects, arrays of objects and unions: JSON.
	kind('json');
	return {
		...base,
		description: [base.description, jsonHint(schema)].filter(Boolean).join(' '),
		type: 'json',
		default: type === 'array' ? '[]' : '{}',
	};
}

function clean(property: INodeProperties): INodeProperties {
	const out = { ...property } as IDataObject;
	for (const key of Object.keys(out)) if (out[key] === undefined) delete out[key];
	return out as unknown as INodeProperties;
}

const resources = RESOURCES.filter((resource) =>
	TOOLS.some((tool) => resourceOf(tool.name) === resource.value),
);

// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- the default is computed
export const RESOURCE: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: resources.map(({ name, value }) => ({ name, value })).sort(byName),
	default: resources[0]?.value ?? 'other',
};

/** One Operation field per resource, listing its tools. */
export const OPERATIONS: INodeProperties[] = resources.map((resource) => {
	const tools = TOOLS.filter((tool) => resourceOf(tool.name) === resource.value);
	const options = tools
		.map((tool) => {
			const title = tool.title?.trim() || displayName(tool.name);
			return {
				name: title,
				value: tool.name,
				action: title,
				description: sentence(tool.description?.split(/(?<=\.)\s/)[0]),
			};
		})
		.sort(byName);
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- the default is computed
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource.value] } },
		options,
		default: options[0]?.value ?? '',
	};
});

/**
 * Each tool's required inputs as fields, and its optional ones in an
 * "Additional Fields" collection.
 */
export const FIELDS: INodeProperties[] = TOOLS.flatMap((tool) => {
	const show = { show: { resource: [resourceOf(tool.name)], operation: [tool.name] } };
	const properties = tool.inputSchema.properties ?? {};
	const required = new Set(tool.inputSchema.required ?? []);
	const requiredFields = Object.entries(properties)
		.filter(([name]) => required.has(name))
		.map(([name, schema]) =>
			clean({ ...field(tool.name, name, schema, true), displayOptions: show }),
		);
	const optional = Object.entries(properties)
		.filter(([name]) => !required.has(name))
		.map(([name, schema]) => clean(field(tool.name, name, schema, false)))
		.sort((a, b) => a.displayName.localeCompare(b.displayName));
	return optional.length
		? [
				...requiredFields,
				{
					displayName: 'Additional Fields',
					name: 'additionalFields',
					type: 'collection',
					placeholder: 'Add Field',
					default: {},
					displayOptions: show,
					options: optional,
				} as INodeProperties,
			]
		: requiredFields;
});

export const toolByName = new Map(TOOLS.map((tool) => [tool.name, tool]));

/** A field's n8n value as the tool's input value; undefined leaves it out. */
export function toInput(tool: string, name: string, value: unknown): unknown {
	const kind = FIELD_KINDS.get(`${tool}.${name}`) ?? 'value';
	if (value === undefined || value === null) return undefined;
	if (kind === 'json') {
		if (typeof value !== 'string') return value;
		if (!value.trim()) return undefined;
		return JSON.parse(value);
	}
	if (kind === 'list') {
		if (Array.isArray(value)) return value;
		const items = String(value)
			.split(/\r?\n/)
			.map((item) => item.trim())
			.filter(Boolean);
		if (!items.length) return undefined;
		const itemType = typeOf(toolByName.get(tool)?.inputSchema.properties?.[name]?.items ?? {});
		return itemType === 'string' ? items : items.map(Number);
	}
	if (value === '') return undefined;
	return value;
}
