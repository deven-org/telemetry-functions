import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import loglevel from "loglevel";
import { GithubGraphqlQueries } from ".";

loglevel.setLevel("info");

export const GithubClients = (function () {
  let graphqlClient;
  let restClient;

  return {
    getClient: async function (token) {
      try {
        if (!graphqlClient) {
          graphqlClient = graphql.defaults(GithubGraphqlQueries.auth(token));
        }
        if (!restClient) {
          restClient = new Octokit({
            auth: token,
          });
        }
        return [graphqlClient, restClient];
      } catch (error) {
        if (error?.request) {
          loglevel.error(`[Github] Authentication error`, error.request);
        } else {
          loglevel.error(`[Github] More info:`, error);
        }
      }
    },
  };
})();
