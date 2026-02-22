import type { INodeProperties } from 'n8n-workflow';

export const getConversationMessagesFields: INodeProperties[] = [
	{
		displayName: 'Participant Profile URL',
		name: 'participantProfileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn profile URL of the conversation participant',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getConversationMessages'] },
		},
	},
	{
		displayName: 'Max Messages',
		name: 'maxMessages',
		type: 'number',
		default: 100,
		description: 'Maximum number of messages to retrieve',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getConversationMessages'] },
		},
	},
];
