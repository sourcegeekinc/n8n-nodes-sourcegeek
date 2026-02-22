declare function setTimeout(callback: (...args: unknown[]) => void, ms?: number): unknown;

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
	POLLING_INTERVAL_MS,
	RESOURCE,
	aiPeopleSearchFields,
	checkConnectionStatusFields,
	getCompanyDataFields,
	getCompanyJobsFields,
	getCompanyPostsFields,
	getConversationMessagesFields,
	getProfileDataFields,
	getProfilePostsFields,
	getRecentAcceptedConnectionRequestsFields,
	getRecentMessagesFields,
	getRecentRecruiterMessagesFields,
	getToolRunFields,
	importCompanyFollowersFields,
	importContactsBasicSearchFields,
	importContactsRecruiterSearchFields,
	importContactsSalesNavSearchFields,
	importGroupMembersFields,
	importPostCommentsFields,
	importPostLikesFields,
	importProfileViewersFields,
	sendConnectionRequestFields,
	sendMessageFields,
	sendRecruiterInMailMessageFields,
} from './actions';

async function pollToolRun(
	ctx: IExecuteFunctions,
	toolRunId: string,
	headers: Record<string, string>,
): Promise<IDataObject> {
	for (;;) {
		const result = (await ctx.helpers.httpRequestWithAuthentication.call(
			ctx,
			'sourcegeekCredentialsApi',
			{
				method: 'POST',
				url: `${BASE_URL}/get-tool-run`,
				headers,
				json: true,
				body: { toolRunId },
			},
		)) as IDataObject;

		if (
			result.status === 'COMPLETED' ||
			result.status === 'FAILED' ||
			result.status === 'CANCELLED'
		) {
			return result;
		}

		await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
	}
}

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
			...aiPeopleSearchFields,
			...checkConnectionStatusFields,
			...getCompanyDataFields,
			...getCompanyJobsFields,
			...getCompanyPostsFields,
			...getConversationMessagesFields,
			...getProfileDataFields,
			...getProfilePostsFields,
			...getRecentAcceptedConnectionRequestsFields,
			...getRecentMessagesFields,
			...getRecentRecruiterMessagesFields,
			...getToolRunFields,
			...importCompanyFollowersFields,
			...importContactsBasicSearchFields,
			...importContactsRecruiterSearchFields,
			...importContactsSalesNavSearchFields,
			...importGroupMembersFields,
			...importPostCommentsFields,
			...importPostLikesFields,
			...importProfileViewersFields,
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
					case 'aiPeopleSearch': {
						const query = this.getNodeParameter('query', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 20) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/ai-people-search`,
								headers: commonHeaders,
								json: true,
								body: { query, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'checkConnectionStatus': {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', itemIndex) as string;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/check-connection-status`,
								headers: commonHeaders,
								json: true,
								body: { linkedinUrl },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getCompanyData': {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', itemIndex) as string;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-company-data`,
								headers: commonHeaders,
								json: true,
								body: { linkedinUrl },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
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
								body: { linkedinUrl },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getRecentAcceptedConnectionRequests': {
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-recent-accepted-connection-requests`,
								headers: commonHeaders,
								json: true,
								body: {},
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getRecentMessages': {
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-recent-messages`,
								headers: commonHeaders,
								json: true,
								body: {},
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getRecentRecruiterMessages': {
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-recent-recruiter-messages`,
								headers: commonHeaders,
								json: true,
								body: {},
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getToolRun': {
						const toolRunId = this.getNodeParameter('toolRunId', itemIndex) as string;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-tool-run`,
								headers: commonHeaders,
								json: true,
								body: { toolRunId },
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
								body: { url, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
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
								body: { url, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
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
								body: { url, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
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
								body,
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
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
								body: { linkedinUrl, message },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
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
								body,
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getCompanyJobs': {
						const companyUrl = this.getNodeParameter('companyUrl', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-company-jobs`,
								headers: commonHeaders,
								json: true,
								body: { companyUrl, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getCompanyPosts': {
						const companyUrl = this.getNodeParameter('companyUrl', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-company-posts`,
								headers: commonHeaders,
								json: true,
								body: { companyUrl, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getConversationMessages': {
						const participantProfileUrl = this.getNodeParameter(
							'participantProfileUrl',
							itemIndex,
						) as string;
						const maxMessages = this.getNodeParameter('maxMessages', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-conversation-messages`,
								headers: commonHeaders,
								json: true,
								body: { participantProfileUrl, maxMessages },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'getProfilePosts': {
						const profileUrl = this.getNodeParameter('profileUrl', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/get-profile-posts`,
								headers: commonHeaders,
								json: true,
								body: { profileUrl, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importCompanyFollowers': {
						const companyUrl = this.getNodeParameter('companyUrl', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-company-followers`,
								headers: commonHeaders,
								json: true,
								body: { companyUrl, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importGroupMembers': {
						const groupUrl = this.getNodeParameter('groupUrl', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-group-members`,
								headers: commonHeaders,
								json: true,
								body: { groupUrl, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importPostComments': {
						const postUrl = this.getNodeParameter('postUrl', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-post-comments`,
								headers: commonHeaders,
								json: true,
								body: { postUrl, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importPostLikes': {
						const postUrl = this.getNodeParameter('postUrl', itemIndex) as string;
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-post-likes`,
								headers: commonHeaders,
								json: true,
								body: { postUrl, maxResults },
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
					case 'importProfileViewers': {
						const maxResults = this.getNodeParameter('maxResults', itemIndex, 100) as number;
						const timeRange = this.getNodeParameter('timeRange', itemIndex, '') as string;
						const body: IDataObject = { maxResults };
						if (timeRange) {
							body.timeRange = timeRange;
						}
						const res = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sourcegeekCredentialsApi',
							{
								method: 'POST',
								url: `${BASE_URL}/import-profile-viewers`,
								headers: commonHeaders,
								json: true,
								body,
							},
						);
						const result = await pollToolRun(
							this,
							(res as IDataObject).toolRunId as string,
							commonHeaders,
						);
						outItems.push({ json: result, pairedItem: { item: itemIndex } });
						break;
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					outItems.push({
						json: {
							error: (error as { message?: string }).message ?? (error as unknown as IDataObject),
						} as IDataObject,
						pairedItem: { item: itemIndex },
					});
					continue;
				} else {
					if (error.context) {
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
