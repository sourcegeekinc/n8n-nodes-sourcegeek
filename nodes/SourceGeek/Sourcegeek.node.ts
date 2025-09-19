import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { OPERATION, RESOURCE, getProfileDataFields } from './actions';

const BASE_URL = 'https://integrations.sourcegeek.com/api/n8n/v1';

export class Sourcegeek implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SourceGeek',
		name: 'sourcegeek',
		icon: 'file:sourcegeek.svg',
		group: ['transform'],
		version: 1,
		description: 'Basic Example Node',
		defaults: {
			name: 'Example Node',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'sourcegeekCredentialsApi',
				required: true,
			},
		],
		properties: [RESOURCE, OPERATION, ...getProfileDataFields],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: IDataObject[] = [];

		const credentials = (await this.getCredentials('sourcegeekCredentialsApi')) as {
			apiKey: string;
		};
		const authHeaders = { Authorization: `Bearer ${credentials.apiKey}` };
		const commonHeaders = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...authHeaders,
		};

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const resource = this.getNodeParameter('resource', itemIndex) as string;
			const operation = this.getNodeParameter('operation', itemIndex) as string;

			try {
				if (resource !== 'linkedin') {
					out.push({ success: true });
					continue;
				}

				switch (operation) {
					case 'getProfileData': {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', itemIndex) as string;
						const res = await this.helpers.httpRequest.call(this, {
							method: 'POST',
							url: `${BASE_URL}/get-profile-data`,
							headers: commonHeaders,
							json: true,
							body: { linkedinUrl },
						});
						out.push(res as IDataObject);
						break;
					}
				}
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		const outItems = this.helpers.returnJsonArray(out) as INodeExecutionData[];
		return [outItems];
	}
}
