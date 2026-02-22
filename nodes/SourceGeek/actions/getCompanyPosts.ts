import type { INodeProperties } from 'n8n-workflow';

export const getCompanyPostsFields: INodeProperties[] = [
	{
		displayName: 'Company URL',
		name: 'companyUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn company page URL',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getCompanyPosts'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 100,
		description: 'Maximum number of posts to retrieve',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getCompanyPosts'] },
		},
	},
];
