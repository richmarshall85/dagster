import {MockedProvider, MockedResponse} from '@apollo/client/testing';
import {Box} from '@dagster-io/ui';
import React from 'react';

import {createAppCache} from '../../app/AppCache';
import {buildPartitionHealthMock} from '../../assets/__fixtures__/PartitionHealthQuery.fixtures';
import {AssetEventsQuery} from '../../assets/types/useRecentAssetEvents.types';
import {ASSET_EVENTS_QUERY} from '../../assets/useRecentAssetEvents';
import {AssetNode, RunStatus, buildAssetNode} from '../../graphql/types';
import {WorkspaceProvider} from '../../workspace/WorkspaceContext';
import {SIDEBAR_ASSET_QUERY, SidebarAssetInfo} from '../SidebarAssetInfo';
import {GraphNode} from '../Utils';
import {SidebarAssetQuery} from '../types/SidebarAssetInfo.types';

// eslint-disable-next-line import/no-default-export
export default {component: SidebarAssetInfo};

const MockRepo = {
  __typename: 'Repository',
  id: 'test.py.repo',
  name: 'test.py',
  location: {__typename: 'RepositoryLocation', id: 'repo', name: 'repo'},
} as const;

const MockAssetKey = {__typename: 'AssetKey' as const, path: ['asset1']};

const buildGraphNodeMock = (definitionOverrides: Partial<AssetNode>): GraphNode => ({
  id: 'test.py.repo.["asset1"]',
  assetKey: MockAssetKey,
  definition: buildAssetNode({
    id: 'test.py.repo.["asset1"]',
    assetKey: MockAssetKey,
    jobNames: ['__ASSET_JOB_1'],
    opNames: ['asset1'],
    groupName: null,
    graphName: null,
    isPartitioned: false,
    isObservable: false,
    isSource: false,
    ...definitionOverrides,
  }),
});

const SidebarQueryMock: MockedResponse<SidebarAssetQuery> = {
  request: {
    query: SIDEBAR_ASSET_QUERY,
    variables: {
      assetKey: {
        path: ['asset1'],
      },
    },
  },
  result: {
    data: {
      __typename: 'DagitQuery',
      assetNodeOrError: {
        __typename: 'AssetNode',
        id: 'test.py.repo.["asset1"]',
        description: null,
        configField: {
          name: 'config',
          isRequired: false,
          configType: {
            __typename: 'RegularConfigType',
            givenName: 'Any',
            key: 'Any',
            description: null,
            isSelector: false,
            typeParamKeys: [],
            recursiveConfigTypes: [],
          },
          __typename: 'ConfigTypeField',
        },
        metadataEntries: [],
        partitionDefinition: null,
        assetKey: {
          path: ['asset1'],
          __typename: 'AssetKey',
        },
        op: {
          name: 'asset1',
          description: null,
          metadata: [
            {
              key: 'compute_kind',
              value: 'pandas',
              __typename: 'MetadataItemDefinition',
            },
            {
              key: 'kind',
              value: 'pandas',
              __typename: 'MetadataItemDefinition',
            },
          ],
          __typename: 'SolidDefinition',
        },
        opVersion: null,
        repository: MockRepo,
        requiredResources: [],
        type: {
          key: 'Any',
          name: 'Any',
          displayName: 'Any',
          description: null,
          isNullable: false,
          isList: false,
          isBuiltin: true,
          isNothing: false,
          metadataEntries: [],
          inputSchemaType: {
            __typename: 'CompositeConfigType',
            key: 'Selector.f2fe6dfdc60a1947a8f8e7cd377a012b47065bc4',
            description: null,
            isSelector: true,
            typeParamKeys: [],
            fields: [],
            recursiveConfigTypes: [],
          },
          outputSchemaType: null,
          __typename: 'RegularDagsterType',
          innerTypes: [],
        },
      },
    },
  },
};

const EventsMock: MockedResponse<AssetEventsQuery> = {
  request: {
    query: ASSET_EVENTS_QUERY,
    variables: {
      assetKey: {path: ['asset1']},
      before: undefined,
      limit: 100,
    },
  },
  result: {
    data: {
      __typename: 'DagitQuery',
      assetOrError: {
        __typename: 'Asset',
        key: MockAssetKey,
        id: '["asset1"]',
        definition: {
          __typename: 'AssetNode',
          id: 'test.py.repo.["asset1"]',
          partitionKeys: [],
        },
        assetMaterializations: [
          {
            __typename: 'MaterializationEvent',
            description: '1234',
            runId: '12345',
            metadataEntries: [],
            partition: null,
            timestamp: '12345678654',
            assetLineage: [],
            label: null,
            stepKey: 'op',
            tags: [],
            runOrError: {
              __typename: 'Run',
              pipelineName: '__ASSET_JOB_1',
              mode: 'default',
              pipelineSnapshotId: null,
              id: '12345',
              status: RunStatus.SUCCESS,
              repositoryOrigin: {
                __typename: 'RepositoryOrigin',
                id: 'test.py',
                repositoryLocationName: 'repo',
                repositoryName: 'test.py',
              },
            },
          },
        ],
        assetObservations: [
          {
            __typename: 'ObservationEvent',
            description: '1234',
            runId: '12345',
            metadataEntries: [],
            partition: null,
            timestamp: '12345678654',
            label: null,
            stepKey: 'op',
            tags: [],
            runOrError: {
              __typename: 'Run',
              pipelineName: '__ASSET_JOB_1',
              mode: 'default',
              pipelineSnapshotId: null,
              id: '12345',
              status: RunStatus.SUCCESS,
              repositoryOrigin: {
                __typename: 'RepositoryOrigin',
                id: 'test.py',
                repositoryLocationName: 'repo',
                repositoryName: 'test.py',
              },
            },
          },
        ],
      },
    },
  },
};

const TestContainer: React.FC = ({children}) => (
  <MockedProvider
    cache={createAppCache()}
    mocks={[SidebarQueryMock, EventsMock, buildPartitionHealthMock(MockAssetKey.path[0])]}
  >
    <WorkspaceProvider>
      <Box style={{width: 400}}>{children}</Box>
    </WorkspaceProvider>
  </MockedProvider>
);

export const AssetWithMaterializations = () => {
  return (
    <TestContainer>
      <SidebarAssetInfo graphNode={buildGraphNodeMock({})} liveData={undefined} />
    </TestContainer>
  );
};

export const AssetWithGraphName = () => {
  return (
    <TestContainer>
      <SidebarAssetInfo
        graphNode={buildGraphNodeMock({graphName: 'op_graph'})}
        liveData={undefined}
      />
    </TestContainer>
  );
};

export const AssetWithDifferentOpName = () => {
  return (
    <TestContainer>
      <SidebarAssetInfo
        graphNode={buildGraphNodeMock({opNames: ['not_asset_name']})}
        liveData={undefined}
      />
    </TestContainer>
  );
};

export const ObservableSourceAsset = () => {
  return (
    <TestContainer>
      <SidebarAssetInfo
        graphNode={buildGraphNodeMock({isObservable: true, isSource: true})}
        liveData={undefined}
      />
    </TestContainer>
  );
};
