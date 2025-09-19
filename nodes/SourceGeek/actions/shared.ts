import type { INodeProperties } from 'n8n-workflow';

export const RESOURCE: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [{ name: '', value: 'linkedin' }],
	default: 'linkedin',
};

export const OPERATION: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Get Data From A Linkedin Profile',
			value: 'getProfileData',
			action: 'Get data from a linkedin profile',
		},
	],
	default: 'getProfileData',
	displayOptions: { show: { resource: ['linkedin'] } },
};
