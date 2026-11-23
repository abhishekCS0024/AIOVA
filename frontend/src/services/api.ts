import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getCurrentUserId } from "@/config/users";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      headers.set("X-User-Id", getCurrentUserId());
      return headers;
    },
  }),
  tagTypes: ["Investigation", "InvestigationList", "Audit"],
  endpoints: () => ({}),
});
