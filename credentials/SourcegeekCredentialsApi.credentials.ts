import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

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
}
