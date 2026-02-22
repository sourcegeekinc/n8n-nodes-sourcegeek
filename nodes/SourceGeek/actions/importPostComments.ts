import type { INodeProperties } from 'n8n-workflow';

export const importPostCommentsFields: INodeProperties[] = [
	{
		displayName: 'Post URL',
		name: 'postUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn post URL',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importPostComments'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 100,
		description: 'Maximum number of commenters to import',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importPostComments'] },
		},
	},
];
