import type { INodeProperties } from 'n8n-workflow';

export const getProfilePostsFields: INodeProperties[] = [
	{
		displayName: 'Profile URL',
		name: 'profileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn profile URL',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getProfilePosts'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 100,
		description: 'Maximum number of posts to retrieve',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getProfilePosts'] },
		},
	},
];
