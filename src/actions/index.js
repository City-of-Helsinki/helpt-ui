import _ from 'lodash';
import { CALL_API, getJSON } from 'redux-api-middleware';
import { createAction } from 'redux-actions';
import URI from 'urijs';
import * as timeUtils from '../util/time';
import { findEntryForTask } from '../util/data';

require('process');
const API_BASE_URL = process.env.API_URL;

function getEndPoint(resourceType, id) {
  let base = `${API_BASE_URL}/${resourceType}/`;
  if (id) {
    return base + id + '/';
  }
  return base;
}

export function shouldBailOut(state, endpoint) {
  const status = state.data._apiEndpoints[endpoint];
  return status !== undefined && status !== null;
}

function generateIncludeParameters(resourceTypes) {
  return _.map(resourceTypes, (rType) => { return `${rType}.*`; });
}

function makeAuthHeader(apiToken) {
  return `Bearer ${apiToken['https://api.hel.fi/auth/projects']}`;
}

function createHeaders(state, defaults = {}) {
  return Object.assign(defaults, {
    'Authorization': makeAuthHeader(state.apiToken)
  });
}

export const selectWorkspaceFilter = createAction('USER_SELECT_WORKSPACE_FILTER');
export const clearSelectedWorkspaceFilter = createAction('USER_CLEAR_SELECTED_WORKSPACE_FILTER');

export function fetchResource(resourceTypes, id, endpoint = getEndPoint(resourceTypes[0], id), metadata, page = 1) {
  const multiple = !id;
  let uri = new URI(endpoint);
  if (resourceTypes.length > 1) {
    let uri = new URI(endpoint);
    uri.addSearch({'include[]': generateIncludeParameters(resourceTypes.slice(1))});
    endpoint = uri.toString();
  }
  let paginatedUri = uri.clone();
  if (multiple) {
    paginatedUri.addSearch({page});
  }
  endpoint = uri.toString();
  const paginatedEndpoint = paginatedUri.toString();
  const intention = metadata ? metadata.intention : null;
  return {
    [CALL_API]: {
      endpoint: paginatedEndpoint,
      method: 'GET',
      credentials: 'same-origin',
      headers: createHeaders,
      types: [
        {type: 'REQUEST', meta: { bareEndpoint: endpoint, page, multiple, id, resourceTypes, endpoint: paginatedEndpoint, intention, metadata }},
        {type: 'SUCCESS', meta: { bareEndpoint: endpoint, resourceTypes, multiple, id, endpoint: paginatedEndpoint, intention, metadata }},
        {type: 'FAILURE', meta: { bareEndpoint: endpoint, resourceTypes, endpoint: paginatedEndpoint, id, intention, metadata }}
      ],
      bailout: (state) => {
        return shouldBailOut(state, paginatedEndpoint);
      }
    }
  };
}

export function fetchMultipleResources(resourceTypes, ids) {
  return fetchResourceFiltered(resourceTypes, {'filter{id.in}': ids});
}

export function fetchResourceFiltered(resourceTypes, filters, metadata) {
  var uri = new URI(getEndPoint(resourceTypes[0]));
  uri.search(filters);
  return fetchResource(resourceTypes, null, uri.toString(), metadata);
}

export function modifyResource(resourceType, id, object) {
  const endpoint = getEndPoint(resourceType, id);
  const body = JSON.stringify(object);
  return {
    [CALL_API]: {
      endpoint,
      method: 'PUT',
      types: [
        {type: 'REQUEST', meta: { resourceTypes: [resourceType], endpoint }},
        {type: 'SUCCESS', meta: { resourceTypes: [resourceType], multiple: false, endpoint},
         payload: (action, state, res) => {
           return getJSON(res);
        }},
        {type: 'FAILURE', meta: { resourceType, endpoint }}
      ],
      body,
      headers: (state) => {
        return createHeaders(state, { 'Content-Type': 'application/json' });
      },
      bailout: false
    }
  };
}

export function createResource(resourceType, object, bailout = false) {
  const endpoint = getEndPoint(resourceType);
  const body = JSON.stringify(object);
  return {
    [CALL_API]: {
      endpoint: endpoint,
      method: 'POST',
      types: [
        {type: 'REQUEST', meta: { resourceTypes: [resourceType], endpoint }},
        {type: 'SUCCESS', meta: { resourceTypes: [resourceType], multiple: false, endpoint},
         payload: (action, state, res) => {
           return getJSON(res);
        }},
        {type: 'FAILURE', meta: { resourceType, endpoint }}
      ],
      body: body,
      headers: (state) => {
        return createHeaders(state, { 'Content-Type': 'application/json' });
      },
      bailout
    }
  };
}

export function fetchApiToken(token) {
  const endpoint = 'https://api.hel.fi/sso/api-tokens/';
  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      types: [
        'TOKEN_REQUEST',
        'TOKEN_SUCCESS',
        'TOKEN_FAILURE'
      ],
      bailout: (state) => {
        return shouldBailOut(state, endpoint);
      }
    }
  };
}

export function makeEntryFromTask(userId, task, momentDate) {
  const date = momentDate.format(timeUtils.LINK_DATEFORMAT);
  const newEntry = {
    user: userId,
    task: task.id,
    minutes: 0,
    date
  };
  return createResource('entry', newEntry, (state) => {
    // Bail out if matching entry already found
    return findEntryForTask(state.data.entry, userId, task, date);
  });
}

export function undeleteEntry(entry) {
  const undeletedEntry = entry.merge({state: 'public'});
  return modifyResource('entry', entry.id, undeletedEntry);
}

export function selectReportProject(key) {
  return {
    type: 'REPORT_FILTER_SET',
    payload: {
      project: key === 'clear' ? null : Number.parseInt(key)
    }
  }
}

export function filterEntriesForReport(filter) {
  console.log(filter);
  let queryFilters = {};
  if (filter.project) {
    queryFilters['filter{task.workspace.projects}'] = '' + filter.project;
  }
  console.log(queryFilters);
  return fetchResourceFiltered(['entry', 'user'], queryFilters,
                               {intent: 'report'});
}
