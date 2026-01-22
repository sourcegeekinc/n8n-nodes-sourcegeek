import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	BASE_URL,
	OPERATION,
	RESOURCE,
	getProfileDataFields,
	importContactsBasicSearchFields,
	importContactsRecruiterSearchFields,
	importContactsSalesNavSearchFields,
	sendConnectionRequestFields,
	sendMessageFields,
	sendRecruiterInMailMessageFields,
} from './actions';

export class Sourcegeek implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SourceGeek for LinkedIn',
		name: 'sourcegeek',
		icon: 'file:sourcegeek.svg',
		group: ['transform'],
		version: 1,
		description: 'Automate LinkedIn tasks and AI workflows with SourceGeek.',
		defaults: {
			name: 'SourceGeek for LinkedIn',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'sourcegeekCredentialsApi',
				required: true,
			},
		],
		properties: [
			RESOURCE,
			OPERATION,
			...getProfileDataFields,
			...importContactsBasicSearchFields,
			...importContactsRecruiterSearchFields,
			...importContactsSalesNavSearchFields,
			...sendConnectionRequestFields,
			...sendMessageFields,
			...sendRecruiterInMailMessageFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const outItems: INodeExecutionData[] = [];

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
					outItems.push({
						json: { success: true } as IDataObject,
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				switch (operation) {
					case 'getProfileData': {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', itemIndex) as string;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-profile-data`,
								headers: commonHeaders,
								json: true,
								timeout: 1000 * 60 * 20,
								body: { linkedinUrl },
							},
						);
						outItems.push({ json: res as IDataObject, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importContactsBasicSearch': {
						const url = this.getNodeParameter('url', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 250) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-contacts-basic-search`,
								headers: commonHeaders,
								json: true,
								timeout: 1000 * 60 * 20,
								body: { url, maxResults },
							},
						);
						outItems.push({ json: res as IDataObject, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importContactsRecruiterSearch': {
						const url = this.getNodeParameter('url', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 250) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-contacts-recruiter-search`,
								headers: commonHeaders,
								json: true,
								timeout: 1000 * 60 * 20,
								body: { url, maxResults },
							},
						);
						outItems.push({ json: res as IDataObject, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importContactsSalesNavSearch': {
						const url = this.getNodeParameter('url', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 250) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-contacts-sales-nav-search`,
								headers: commonHeaders,
								json: true,
								timeout: 1000 * 60 * 20,
								body: { url, maxResults },
							},
						);
						outItems.push({ json: res as IDataObject, pairedItem: { item: itemIndex } });
						break;
					}
					case 'sendConnectionRequest': {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', itemIndex) as string;
						const connectionNote = this.getNodeParameter('connectionNote', itemIndex, '') as string;
						const body: IDataObject = { linkedinUrl };
						if (connectionNote) {
							body.connectionNote = connectionNote;
						}
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/send-connection-request`,
								headers: commonHeaders,
								json: true,
								timeout: 1000 * 60 * 20,
								body,
							},
						);
						outItems.push({ json: res as IDataObject, pairedItem: { item: itemIndex } });
						break;
					}
					case 'sendMessage': {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', itemIndex) as string;
						const message = this.getNodeParameter('message', itemIndex) as string;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/send-message`,
								headers: commonHeaders,
								json: true,
								timeout: 1000 * 60 * 20,
								body: { linkedinUrl, message },
							},
						);
						outItems.push({ json: res as IDataObject, pairedItem: { item: itemIndex } });
						break;
					}
					case 'sendRecruiterInMailMessage': {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', itemIndex) as string;
						const subject = this.getNodeParameter('subject', itemIndex) as string;
						const message = this.getNodeParameter('message', itemIndex) as string;
						const linkedinProjectId = this.getNodeParameter(
							'linkedinProjectId',
							itemIndex,
							'',
						) as string;
						const body: IDataObject = { linkedinUrl, subject, message };
						if (linkedinProjectId) {
							body.linkedinProjectId = linkedinProjectId;
						}
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/send-recruiter-inmail-message`,
								headers: commonHeaders,
								json: true,
								timeout: 1000 * 60 * 20,
								body,
							},
						);
						outItems.push({ json: res as IDataObject, pairedItem: { item: itemIndex } });
						break;
					}
				}
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					outItems.push({
						json: {
							error: (error as { message?: string }).message ?? (error as unknown as IDataObject),
						} as IDataObject,
						pairedItem: { item: itemIndex },
					});
					continue;
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

		return [outItems];
	}
}
