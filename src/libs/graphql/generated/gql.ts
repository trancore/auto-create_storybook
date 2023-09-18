/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query RepositoryOwner {\n  repositoryOwner(login: \"trancore\") {\n    id\n    login\n    resourcePath\n    url\n    repositories(\n      last: 100\n      orderBy: {field: UPDATED_AT, direction: DESC}\n      privacy: PUBLIC\n    ) {\n      totalCount\n      edges {\n        node {\n          createdAt\n          description\n          id\n          name\n          updatedAt\n          url\n          owner {\n            id\n            login\n            resourcePath\n            url\n          }\n          object(expression: \"main:README.md\") {\n            id\n            oid\n            ... on Blob {\n              byteSize\n              id\n              oid\n              text\n            }\n          }\n          primaryLanguage {\n            color\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}": types.RepositoryOwnerDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query RepositoryOwner {\n  repositoryOwner(login: \"trancore\") {\n    id\n    login\n    resourcePath\n    url\n    repositories(\n      last: 100\n      orderBy: {field: UPDATED_AT, direction: DESC}\n      privacy: PUBLIC\n    ) {\n      totalCount\n      edges {\n        node {\n          createdAt\n          description\n          id\n          name\n          updatedAt\n          url\n          owner {\n            id\n            login\n            resourcePath\n            url\n          }\n          object(expression: \"main:README.md\") {\n            id\n            oid\n            ... on Blob {\n              byteSize\n              id\n              oid\n              text\n            }\n          }\n          primaryLanguage {\n            color\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query RepositoryOwner {\n  repositoryOwner(login: \"trancore\") {\n    id\n    login\n    resourcePath\n    url\n    repositories(\n      last: 100\n      orderBy: {field: UPDATED_AT, direction: DESC}\n      privacy: PUBLIC\n    ) {\n      totalCount\n      edges {\n        node {\n          createdAt\n          description\n          id\n          name\n          updatedAt\n          url\n          owner {\n            id\n            login\n            resourcePath\n            url\n          }\n          object(expression: \"main:README.md\") {\n            id\n            oid\n            ... on Blob {\n              byteSize\n              id\n              oid\n              text\n            }\n          }\n          primaryLanguage {\n            color\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;