import type { INodeProperties } from 'n8n-workflow';

export const aiPeopleSearchFields: INodeProperties[] = [
	{
		displayName: 'Search Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		description: 'AI-powered search query to find people (min 10 characters)',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['aiPeopleSearch'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 20,
		description: 'Maximum number of results to return (1-250)',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['aiPeopleSearch'] },
		},
	},
];
