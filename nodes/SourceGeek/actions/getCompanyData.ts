import type { INodeProperties } from 'n8n-workflow';

export const getCompanyDataFields: INodeProperties[] = [
	{
		displayName: 'LinkedIn URL',
		name: 'linkedinUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn company page URL to get company data',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getCompanyData'] },
		},
	},
];
