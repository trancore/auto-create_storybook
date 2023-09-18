import { cacheExchange, createClient, fetchExchange } from "urql";

export const githubClient = createClient({
  url: "https://api.github.com/graphql",
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = process.env.REACT_APP_GITHUB_ACCESS_TOKEN_KEY;

    return {
      headers: { authorization: token ? `Bearer ${token}` : "" },
    };
  },
});
