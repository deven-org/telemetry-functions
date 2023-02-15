export const auth = (token) => ({
  headers: {
    authorization: `token ${token}`,
  },
});

export const getRepository = (owner, repo) => ({
  path: "GET /repos/{owner}/{repo}",
  payload: {
    owner,
    repo,
  },
});

export const createWebhook = (org, name, events, url) => [
  "POST /orgs/{org}/hooks",
  {
    org,
    name,
    active: true,
    events,
    config: {
      url,
      content_type: "json",
      insecure_ssl: "0",
    },
  },
];
