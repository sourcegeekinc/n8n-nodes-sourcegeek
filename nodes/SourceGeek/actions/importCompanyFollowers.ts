import type { INodeProperties } from 'n8n-workflow';

export const importCompanyFollowersFields: INodeProperties[] = [
	{
		displayName: 'Company URL',
		name: 'companyUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn company page URL',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importCompanyFollowers'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 100,
		description: 'Maximum number of followers to import',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importCompanyFollowers'] },
		},
	},
];
