export type AdvisorMode = 'report' | 'insight' | 'project-report';

export type AdvisorSource =
  | 'ruyi-zone'
  | 'work-report'
  | 'work-item'
  | 'task'
  | 'todo'
  | 'report-stats'
  | 'external-agent';

export interface AdvisorEntryParams {
  mode?: AdvisorMode;
  source?: AdvisorSource;
  reportType?: string;
  templateId?: string;
  contextId?: string;
  period?: string;
  scope?: string;
  initialPrompt?: string;
  returnTo?: string;
}

export const ADVISOR_PATH = '/web_client/ruyi-zone/advisor';

export const buildAdvisorUrl = (params: AdvisorEntryParams = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `${ADVISOR_PATH}?${query}` : ADVISOR_PATH;
};
