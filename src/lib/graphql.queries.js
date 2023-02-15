export const auth = (token) => ({
  headers: {
    authorization: `token ${token}`,
  },
});

export const getRepository = (owner, name) => `
{
  repository(owner: "${owner}", name: "${name}") {
    issues(last: 3) {
      edges {
        node {
          title
        }
      }
    }
  }
}
`;
