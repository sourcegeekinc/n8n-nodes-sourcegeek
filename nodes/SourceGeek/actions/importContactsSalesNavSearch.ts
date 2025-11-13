import type { INodeProperties } from 'n8n-workflow';

export const importContactsSalesNavSearchFields: INodeProperties[] = [
	{
		displayName: 'Search URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn Sales Navigator search URL to import contacts from',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importContactsSalesNavSearch'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 250,
		description: 'Maximum number of contacts to import',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importContactsSalesNavSearch'] },
		},
	},
];
