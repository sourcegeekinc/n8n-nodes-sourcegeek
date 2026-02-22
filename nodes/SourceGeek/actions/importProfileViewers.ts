import type { INodeProperties } from 'n8n-workflow';

export const importProfileViewersFields: INodeProperties[] = [
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 100,
		description: 'Maximum number of profile viewers to import',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importProfileViewers'] },
		},
	},
	{
		displayName: 'Time Range',
		name: 'timeRange',
		type: 'string',
		default: '',
		description: 'Optional time range filter for profile viewers',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['importProfileViewers'] },
		},
	},
];
