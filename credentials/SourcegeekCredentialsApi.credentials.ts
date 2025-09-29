import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SourcegeekCredentialsApi implements ICredentialType {
	name = 'sourcegeekCredentialsApi';
	displayName = 'Sourcegeek Credentials API';

	documentationUrl = 'https://your-docs-url';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
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
			baseURL: 'https://integrations.sourcegeek.com/api/n8n/v1',
			url: '/test-credentials',
			method: 'POST',
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
			json: true,
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'success',
					value: true,
					message: 'Credentials are valid',
				},
			},
		],
	};
}
