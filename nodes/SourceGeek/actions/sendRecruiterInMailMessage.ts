import type { INodeProperties } from 'n8n-workflow';

export const sendRecruiterInMailMessageFields: INodeProperties[] = [
	{
		displayName: 'LinkedIn URL',
		name: 'linkedinUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn profile URL to send InMail message to',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendRecruiterInMailMessage'] },
		},
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		required: true,
		description: 'The subject of the InMail message',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendRecruiterInMailMessage'] },
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		description: 'The InMail message to send',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendRecruiterInMailMessage'] },
		},
	},
	{
		displayName: 'LinkedIn Project ID',
		name: 'linkedinProjectId',
		type: 'string',
		default: '',
		description: 'The LinkedIn project ID (optional)',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendRecruiterInMailMessage'] },
		},
	},
	{
		displayName: 'Follow-Up Message',
		name: 'followUpMessage',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'An optional follow-up message to send if the recipient does not reply',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendRecruiterInMailMessage'] },
		},
	},
	{
		displayName: 'Follow-Up Subject',
		name: 'followUpSubject',
		type: 'string',
		default: '',
		description: 'Subject for the follow-up message (required if follow-up message is set)',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendRecruiterInMailMessage'] },
		},
	},
	{
		displayName: 'Follow-Up Days',
		name: 'followUpDays',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 30,
		},
		default: 3,
		description: 'Number of days to wait before sending the follow-up message (1-30)',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendRecruiterInMailMessage'] },
		},
	},
];
