import { Handler, HandlerEvent } from "@netlify/functions";
import loglevel from "loglevel";
import {
  GithubClient,
  GithubGraphqlQueries,
  GithubRestQueries,
} from "../../src/lib";

loglevel.setLevel("info");

const handler = async (event) => {
  const [graphqlClient, restClient] = await GithubClient.getClient(
    process.env.GITHUB_ACCESS_TOKEN
  );

  const { repository } = await graphqlClient(
    GithubGraphqlQueries.getRepository("r-l-d", "frontend-challenge")
  );

  loglevel.info(`[Graphql] ${repository}`);

  try {
    console.log("here");
    const { path, payload } = GithubRestQueries.getRepository(
      "r-l-d",
      "frontend-challenge"
    );

    const data = await restClient.request(
      ...GithubRestQueries.createWebhook(
        "deven-org",
        "web",
        ["push"],
        "https://deven-telemetry-functions.netlify.app/.netlify/functions/getandpush"
      )
    );
    console.log(data);

    //console.log(data);
  } catch (error) {
    console.log("here");
    console.log(error.response.data.errors);
  }

  return {
    statusCode: 200,
    body: "Hello, World",
  };
};

export { handler };
