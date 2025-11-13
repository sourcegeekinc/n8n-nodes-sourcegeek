import type { INodeProperties } from 'n8n-workflow';

export const sendConnectionRequestFields: INodeProperties[] = [
	{
		displayName: 'LinkedIn URL',
		name: 'linkedinUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn profile URL to send a connection request',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendConnectionRequest'] },
		},
	},
	{
		displayName: 'Connection Note',
		name: 'connectionNote',
		type: 'string',
		default: '',
		description: 'Optional note to include with the connection request',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendConnectionRequest'] },
		},
	},
];
