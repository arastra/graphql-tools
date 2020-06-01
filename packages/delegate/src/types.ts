import {
  GraphQLSchema,
  GraphQLOutputType,
  SelectionSetNode,
  FieldNode,
  DocumentNode,
  GraphQLResolveInfo,
  GraphQLFieldResolver,
  InlineFragmentNode,
  FragmentDefinitionNode,
  GraphQLObjectType,
  VariableDefinitionNode,
  OperationTypeNode,
} from 'graphql';

import { Operation, Request, TypeMap, ExecutionResult } from '@graphql-tools/utils';

export interface IDelegateToSchemaOptions<TContext = Record<string, any>, TArgs = Record<string, any>> {
  schema: GraphQLSchema | SubschemaConfig;
  operation?: Operation;
  fieldName?: string;
  returnType?: GraphQLOutputType;
  args?: TArgs;
  selectionSet?: SelectionSetNode;
  fieldNodes?: ReadonlyArray<FieldNode>;
  context?: TContext;
  info: GraphQLResolveInfo;
  rootValue?: Record<string, any>;
  transforms?: Array<Transform>;
  transformedSchema?: GraphQLSchema;
  transformedSchemas?: Array<GraphQLSchema>;
  skipValidation?: boolean;
  skipTypeMerging?: boolean;
}

export interface IDelegateRequestOptions extends Omit<IDelegateToSchemaOptions, 'info'> {
  request: Request;
  info?: GraphQLResolveInfo;
}

export interface ICreateRequestFromInfo {
  info: GraphQLResolveInfo;
  operation: Operation;
  fieldName: string;
  selectionSet?: SelectionSetNode;
  fieldNodes?: ReadonlyArray<FieldNode>;
}

export interface ICreateRequest {
  sourceSchema?: GraphQLSchema;
  sourceParentType?: GraphQLObjectType;
  sourceFieldName?: string;
  fragments?: Record<string, FragmentDefinitionNode>;
  variableDefinitions?: ReadonlyArray<VariableDefinitionNode>;
  variableValues?: Record<string, any>;
  targetOperation: Operation;
  targetFieldName: string;
  selectionSet?: SelectionSetNode;
  fieldNodes?: ReadonlyArray<FieldNode>;
}

export interface MergedTypeInfo {
  subschemas: Array<SubschemaConfig>;
  selectionSet?: SelectionSetNode;
  uniqueFields: Record<string, SubschemaConfig>;
  nonUniqueFields: Record<string, Array<SubschemaConfig>>;
  typeMaps: Map<SubschemaConfig, TypeMap>;
  selectionSets: Map<SubschemaConfig, SelectionSetNode>;
  containsSelectionSet: Map<SubschemaConfig, Map<SelectionSetNode, boolean>>;
}

export interface ExecutionParams<TArgs = Record<string, any>, TContext = any> {
  document: DocumentNode;
  variables?: TArgs;
  context?: TContext;
  info?: GraphQLResolveInfo;
}

export type AsyncExecutor = <
  TReturn = Record<string, any>,
  TArgs = Record<string, any>,
  TContext = Record<string, any>
>(
  params: ExecutionParams<TArgs, TContext>
) => Promise<ExecutionResult<TReturn>>;
export type SyncExecutor = <TReturn = Record<string, any>, TArgs = Record<string, any>, TContext = Record<string, any>>(
  params: ExecutionParams<TArgs, TContext>
) => ExecutionResult<TReturn>;
export type Executor = AsyncExecutor | SyncExecutor;
export type Subscriber = <TReturn = Record<string, any>, TArgs = Record<string, any>, TContext = Record<string, any>>(
  params: ExecutionParams<TArgs, TContext>
) => Promise<AsyncIterator<ExecutionResult<TReturn>> | ExecutionResult<TReturn>>;

export interface ICreateProxyingResolverOptions {
  schema: GraphQLSchema | SubschemaConfig;
  transforms?: Array<Transform>;
  transformedSchema?: GraphQLSchema;
  transformedSchemas?: Array<GraphQLSchema>;
  operation?: Operation;
  fieldName?: string;
}

export type CreateProxyingResolverFn = (options: ICreateProxyingResolverOptions) => GraphQLFieldResolver<any, any>;

export interface SubschemaConfig {
  schema: GraphQLSchema;
  rootValue?: Record<string, any>;
  executor?: Executor;
  subscriber?: Subscriber;
  createProxyingResolver?: CreateProxyingResolverFn;
  transforms?: Array<Transform>;
  merge?: Record<string, MergedTypeConfig>;
}

export interface MergedTypeConfig {
  selectionSet?: string;
  fieldName?: string;
  args?: (originalResult: any) => Record<string, any>;
  resolve?: MergedTypeResolver;
}

export type MergedTypeResolver = (
  originalResult: any,
  context: Record<string, any>,
  info: GraphQLResolveInfo,
  subschema: GraphQLSchema | SubschemaConfig,
  selectionSet: SelectionSetNode
) => any;

export function isSubschemaConfig(value: any): value is SubschemaConfig {
  return Boolean((value as SubschemaConfig).schema);
}

export interface StitchingInfo {
  transformedSchemas: Map<GraphQLSchema | SubschemaConfig, GraphQLSchema>;
  fragmentsByField: Record<string, Record<string, InlineFragmentNode>>;
  selectionSetsByField: Record<string, Record<string, SelectionSetNode>>;
  selectionSetsByType: Record<string, SelectionSetNode>;
  mergedTypes: Record<string, MergedTypeInfo>;
}

export interface DelegationContext {
  subschema: GraphQLSchema | SubschemaConfig;
  targetSchema: GraphQLSchema;
  operation: OperationTypeNode;
  fieldName: string;
  args: Record<string, any>;
  context: Record<string, any>;
  info: GraphQLResolveInfo;
  stitchingInfo: StitchingInfo;
  returnType: GraphQLOutputType;
  transforms: Array<Transform>;
  transformedSchema: GraphQLSchema;
  transformedSchemas: Array<GraphQLSchema>;
  skipTypeMerging: boolean;
}

export type TransformationContext = Record<string, any>;

export interface Transformation {
  transform: Transform;
  context: TransformationContext;
}

export type SchemaTransform = (originalSchema: GraphQLSchema) => GraphQLSchema;
export type RequestTransform = (
  originalRequest: Request,
  transformationContext: TransformationContext,
  delegationContext: DelegationContext
) => Request;
export type ResultTransform = (
  originalResult: ExecutionResult,
  transformationContext: TransformationContext,
  delegationContext: DelegationContext
) => ExecutionResult;

export interface Transform {
  transformSchema?: SchemaTransform;
  transformRequest?: RequestTransform;
  transformResult?: ResultTransform;
}
