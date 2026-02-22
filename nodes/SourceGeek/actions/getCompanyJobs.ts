import type { INodeProperties } from 'n8n-workflow';

export const getCompanyJobsFields: INodeProperties[] = [
	{
		displayName: 'Company URL',
		name: 'companyUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'The LinkedIn company page URL',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getCompanyJobs'] },
		},
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		default: 100,
		description: 'Maximum number of jobs to retrieve',
		displayOptions: {
			show: { resource: ['linkedin'], operation: ['getCompanyJobs'] },
		},
	},
];
