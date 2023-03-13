import { graphql } from "@octokit/graphql";

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${JSON.stringify(process.env.GITHUB_ACCESS_TOKEN)}`,
  },
});

export const getPullRequest = async (
  owner: string,
  repo: string,
  num: number
) =>
  await graphqlWithAuth(
    `
      query pullRequest($owner: String!, $repo: String!, $num: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $num) {
            changedFiles
            closed
            closedAt
            createdAt
            deletions
            files {
              totalCount
            }
            merged
            mergedAt
            number
            publishedAt
            state
            title
            totalCommentsCount
          }
        }
      }
  `,
    {
      owner,
      repo,
      num,
    }
  );
