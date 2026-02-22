import type { INodeProperties } from 'n8n-workflow';

export const importGroupMembersFields: INodeProperties[] = [
	{
		displayName: 'Group URL',
		name: 'groupUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn group URL',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importGroupMembers'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 100,
		description: 'Maximum number of members to import',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importGroupMembers'] },
		},
	},
];
