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

export const createWebhook = (owner, repo, name, events, url) => [
  "POST /repos/{owner}/{repo}/hooks",
  {
    owner,
    repo,
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
