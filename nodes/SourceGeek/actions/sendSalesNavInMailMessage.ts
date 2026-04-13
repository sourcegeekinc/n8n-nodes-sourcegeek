import type { INodeProperties } from 'n8n-workflow';

export const sendSalesNavInMailMessageFields: INodeProperties[] = [
	{
		displayName: 'LinkedIn URL',
		name: 'linkedinUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn profile URL to send InMail message to',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['sendSalesNavInMailMessage'] },
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
			show: { resource: ['linkedin'], operation: ['sendSalesNavInMailMessage'] },
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
			show: { resource: ['linkedin'], operation: ['sendSalesNavInMailMessage'] },
		},
	},
];
