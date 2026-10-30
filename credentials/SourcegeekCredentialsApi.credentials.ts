import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export const DEFAULT_BASE_URL = 'https://chat.sourcegeek.com';

export class SourcegeekCredentialsApi implements ICredentialType {
	name = 'sourcegeekCredentialsApi';
	displayName = 'SourceGeek API';

	icon: Icon = {
		light: 'file:../nodes/SourceGeek/sourcegeek.svg',
		dark: 'file:../nodes/SourceGeek/sourcegeek.svg',
	};

	documentationUrl = 'https://github.com/sourcegeekinc/n8n-nodes-sourcegeek#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'A SourceGeek API key, from Settings → Connected apps → API keys in SourceGeek',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: DEFAULT_BASE_URL,
			description: 'The SourceGeek address. Leave as is unless SourceGeek told you otherwise.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: `={{($credentials.baseUrl || "${DEFAULT_BASE_URL}").replace(/\\/+$/, "")}}/api/v1`,
			url: '/me',
			method: 'GET',
			json: true,
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 401,
					message: 'The API key is invalid or was revoked',
				},
			},
		],
	};
}
