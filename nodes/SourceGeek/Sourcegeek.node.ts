import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { DEFAULT_BASE_URL } from '../../credentials/SourcegeekCredentialsApi.credentials';
import {
	FIELDS,
	isPaged,
	isPagingInput,
	maxPerCall,
	OPERATIONS,
	RESOURCE,
	resultItem,
	resultRecords,
	toInput,
	toolByName,
} from './catalog';

/** Stops Return All from spending credits forever if a provider never runs out of pages. */
const MAX_PAGES = 1000;

export class Sourcegeek implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SourceGeek',
		name: 'sourcegeek',
		icon: { light: 'file:sourcegeek.svg', dark: 'file:sourcegeek.svg' },
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Search candidates, companies and jobs, and work with your SourceGeek workspace',
		defaults: {
			name: 'SourceGeek',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'sourcegeekCredentialsApi',
				required: true,
			},
		],
		properties: [RESOURCE, ...OPERATIONS, ...FIELDS],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const outItems: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('sourcegeekCredentialsApi');
		const baseUrl = String(credentials.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const tool = toolByName.get(operation);
				if (!tool) {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
						itemIndex,
					});
				}

				const body: IDataObject = {};
				const required = tool.inputSchema.required ?? [];
				const set = (name: string, value: unknown) => {
					let input: unknown;
					try {
						input = toInput(tool.name, name, value);
					} catch {
						throw new NodeOperationError(this.getNode(), `${name} must be valid JSON`, {
							itemIndex,
						});
					}
					if (input !== undefined) body[name] = input as IDataObject[keyof IDataObject];
				};
				for (const name of required) {
					set(name, this.getNodeParameter(name, itemIndex));
				}
				const additional = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
				const paged = isPaged(tool);
				for (const [name, value] of Object.entries(additional)) {
					// A workflow saved before Return All / Limit can still hold paging inputs.
					if (!paged || !isPagingInput(name)) set(name, value);
				}

				const callTool = async (input: IDataObject) => {
					const request: IHttpRequestOptions = {
						method: 'POST',
						url: `${baseUrl}/api/v1/tools/${encodeURIComponent(tool.name)}`,
						qs: { format: 'json' },
						headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
						json: true,
						body: input,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					};
					const response = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						'sourcegeekCredentialsApi',
						request,
					)) as { statusCode: number; body: IDataObject };

					if (response.statusCode >= 400) {
						const message =
							(response.body?.error as string | undefined) ??
							`SourceGeek answered with status ${response.statusCode}`;
						throw new NodeApiError(
							this.getNode(),
							{ ...response.body, httpCode: String(response.statusCode) },
							{ message, httpCode: String(response.statusCode), itemIndex },
						);
					}
					return response.body?.result;
				};

				if (!paged) {
					outItems.push({
						json: resultItem(await callTool(body)),
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
				const limit = returnAll
					? Infinity
					: (this.getNodeParameter('limit', itemIndex, 50) as number);
				const records: IDataObject[] = [];
				let input: IDataObject = { ...body, limit: maxPerCall(tool) };
				for (let page = 1; ; page++) {
					const result = await callTool(input);
					records.push(...resultRecords(result));
					const next = (result as IDataObject | undefined)?.next as IDataObject | undefined;
					if (!next || records.length >= limit) break;
					if (page === MAX_PAGES) {
						throw new NodeOperationError(
							this.getNode(),
							`Stopped after ${MAX_PAGES} pages: set a Limit to fetch fewer results`,
							{ itemIndex },
						);
					}
					input = { ...input, ...next };
				}
				for (const json of records.slice(0, limit)) {
					outItems.push({ json, pairedItem: { item: itemIndex } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					outItems.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [outItems];
	}
}
