import type { INodeProperties } from 'n8n-workflow';

export const BASE_URL = 'https://integrations.sourcegeek.com/api/n8n/v1';

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
		{
			name: 'Import Contacts - Basic Search',
			value: 'importContactsBasicSearch',
			action: 'Import contacts from basic search',
		},
		{
			name: 'Import Contacts - Recruiter Search',
			value: 'importContactsRecruiterSearch',
			action: 'Import contacts from recruiter search',
		},
		{
			name: 'Import Contacts - Sales Navigator Search',
			value: 'importContactsSalesNavSearch',
			action: 'Import contacts from sales navigator search',
		},
		{
			name: 'Send Connection Request',
			value: 'sendConnectionRequest',
			action: 'Send connection request',
		},
		{
			name: 'Send Message',
			value: 'sendMessage',
			action: 'Send message',
		},
	],
	default: 'getProfileData',
	displayOptions: { show: { resource: ['linkedin'] } },
};
