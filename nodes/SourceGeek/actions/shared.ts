import type { INodeProperties } from 'n8n-workflow';

export const BASE_URL = 'https://app.sourcegeek.com/api/integrations/n8n/v1';

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
			name: 'AI People Search',
			value: 'aiPeopleSearch',
			action: 'Search for people using AI',
		},
		{
			name: 'Check Connection Status',
			value: 'checkConnectionStatus',
			action: 'Check connection status with a profile',
		},
		{
			name: 'Get Company Data',
			value: 'getCompanyData',
			action: 'Get data from a linkedin company page',
		},
		{
			name: 'Get Data From A Linkedin Profile',
			value: 'getProfileData',
			action: 'Get data from a linkedin profile',
		},
		{
			name: 'Get Recent Accepted Connection Requests',
			value: 'getRecentAcceptedConnectionRequests',
			action: 'Get recent accepted connection requests',
		},
		{
			name: 'Get Recent Messages',
			value: 'getRecentMessages',
			action: 'Get recent messages',
		},
		{
			name: 'Get Recent Recruiter Messages',
			value: 'getRecentRecruiterMessages',
			action: 'Get recent recruiter messages',
		},
		{
			name: 'Get Tool Run Result',
			value: 'getToolRun',
			action: 'Get tool run result by ID',
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
		{
			name: 'Send Recruiter InMail Message',
			value: 'sendRecruiterInMailMessage',
			action: 'Send recruiter inmail message',
		},
	],
	default: 'getProfileData',
	displayOptions: { show: { resource: ['linkedin'] } },
};
