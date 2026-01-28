import type { INodeProperties } from 'n8n-workflow';

export const getToolRunFields: INodeProperties[] = [
	{
		displayName: 'Tool Run ID',
		name: 'toolRunId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the tool run to retrieve',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getToolRun'] },
		},
	},
];
