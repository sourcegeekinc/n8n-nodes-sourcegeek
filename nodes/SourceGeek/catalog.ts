import type {
	IDataObject,
	IDisplayOptions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';

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

/** Inputs for fetching pages, which the node fills in itself. */
const PAGING_INPUTS = ['page', 'start', 'offset', 'paginationToken'];

/** A list tool: offered as Return All / Limit, with the node fetching the pages. */
export const isPaged = (tool: Tool) =>
	PAGING_INPUTS.some((name) => tool.inputSchema.properties?.[name]);

/** Whether a tool input is set by the node when it pages this tool. */
export const isPagingInput = (name: string) => name === 'limit' || PAGING_INPUTS.includes(name);

/** The most a tool returns per call, so that a provider page comes back whole. */
export const maxPerCall = (tool: Tool) => tool.inputSchema.properties?.limit?.maximum;

/** How a field's n8n value becomes the tool's input. */
export type FieldKind = 'value' | 'json' | 'list';

type Resource = { value: string; name: string; matches: (tool: string) => boolean };

const RESOURCES: Resource[] = [
	{
		value: 'employeeData',
		name: 'Employee Data',
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
/**
 * The node is SourceGeek's, not a LinkedIn integration: tool descriptions
 * (written for SourceGeek's agent) are shown without naming LinkedIn. URL
 * examples such as linkedin.com/in/… stay, since they say what to paste.
 */
const NEUTRAL: Array<[RegExp, string]> = [
	[/\bLinkedIn's own\b/g, 'its own'],
	[/\bwhen LinkedIn has no page mapped\b/g, 'when no page is mapped'],
	[/\bpages LinkedIn surfaces as\b/g, 'pages surfaced as'],
	[/\bmembers LinkedIn shows on\b/g, 'members shown on'],
	[/\ba LinkedIn column\b/g, 'a profile URL column'],
	[/\bLinkedIn(?:'s)? (?=\w)/g, ''],
	[/\bLinkedIn\b/g, 'profile'],
];

function neutral(text: string): string {
	return NEUTRAL.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text);
}

function sentence(text: string | undefined): string | undefined {
	const trimmed = text && neutral(text).trim();
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

const resourceOptions = resources.map(({ name, value }) => ({ name, value })).sort(byName);
const defaultResource = resources[0]?.value ?? 'other';

export const RESOURCE: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: resourceOptions,
	default: defaultResource,
};

/** One Operation field per resource, listing its tools. */
export const OPERATIONS: INodeProperties[] = resources.map((resource) => {
	const tools = TOOLS.filter((tool) => resourceOf(tool.name) === resource.value);
	const options = tools
		.map((tool) => {
			const title = neutral(tool.title?.trim() || displayName(tool.name));
			return {
				name: title,
				value: tool.name,
				action: title,
				description: sentence(tool.description?.split(/(?<=\.)\s/)[0]),
			};
		})
		.sort(byName);
	const defaultOperation = options[0]?.value ?? '';
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource.value] } },
		options,
		default: defaultOperation,
	};
});

const pagingFields = (show: IDisplayOptions['show']): INodeProperties[] => [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		hint: 'Tools that spend credits spend them for every page fetched',
		displayOptions: { show },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { ...show, returnAll: [false] } },
	},
];

/**
 * Each tool's required inputs as fields, and its optional ones in an
 * "Additional Fields" collection. List tools get Return All / Limit instead
 * of their paging inputs.
 */
export const FIELDS: INodeProperties[] = TOOLS.flatMap((tool) => {
	const show = { show: { resource: [resourceOf(tool.name)], operation: [tool.name] } };
	const paged = isPaged(tool);
	const properties = tool.inputSchema.properties ?? {};
	const required = new Set(tool.inputSchema.required ?? []);
	const requiredFields = Object.entries(properties)
		.filter(([name]) => required.has(name))
		.map(([name, schema]) =>
			clean({ ...field(tool.name, name, schema, true), displayOptions: show }),
		);
	const optional = Object.entries(properties)
		.filter(([name]) => !required.has(name) && !(paged && isPagingInput(name)))
		.map(([name, schema]) => clean(field(tool.name, name, schema, false)))
		.sort((a, b) => a.displayName.localeCompare(b.displayName));
	const fields = paged ? [...requiredFields, ...pagingFields(show.show)] : requiredFields;
	return optional.length
		? [
				...fields,
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
		: fields;
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

const toJson = (value: unknown): IDataObject =>
	value && typeof value === 'object' && !Array.isArray(value)
		? (value as IDataObject)
		: ({ result: value } as IDataObject);

/** A tool's result as one n8n item. */
export const resultItem = toJson;

/** One n8n item per record in a list tool's result. */
export function resultRecords(result: unknown): IDataObject[] {
	const list = toJson(result);
	const records = Object.values(list).find(Array.isArray) as unknown[] | undefined;
	return records ? records.map(toJson) : [list];
}
