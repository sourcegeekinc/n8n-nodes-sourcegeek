import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import { BASE_URL } from '../nodes/SourceGeek/actions';

export class SourcegeekCredentialsApi implements ICredentialType {
	name = 'sourcegeekCredentialsApi';
	displayName = 'Sourcegeek Credentials API';

	documentationUrl = 'https://support.sourcegeek.com/en/articles/12441230-n8n-integration';

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
			baseURL: BASE_URL,
			url: '/test-credentials',
			method: 'POST',
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
			json: true,
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 200,
					message: 'Credentials are valid',
				},
			},
		],
	};
}
