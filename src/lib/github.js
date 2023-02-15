import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import loglevel from "loglevel";
import { GithubGraphqlQueries } from "../../src/lib";

loglevel.setLevel("info");

export const GithubClient = (function () {
  let graphqlClient;
  let restClient;

  function createGraphqlClient(token) {
    try {
      return graphql.defaults(GithubGraphqlQueries.auth(token));
    } catch (error) {
      loglevel.error(`[Github] Authentication error`, error.request);
      loglevel.error(`[Github] More info:`, error);
    }
  }

  async function createRestClient(token) {
    try {
      return new Octokit({
        auth: token,
      });
    } catch (error) {
      loglevel.error(`[Github] Authentication error`, error.request);
      loglevel.error(`[Github] More info:`, error);
    }
  }

  return {
    getClient: async function (token) {
      if (!graphqlClient) {
        graphqlClient = createGraphqlClient(token);
      }
      if (!restClient) {
        restClient = await createRestClient(token);
      }
      return [graphqlClient, restClient];
    },
  };
})();
