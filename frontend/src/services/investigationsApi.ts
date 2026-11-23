import { api } from "@/services/api";
import type { PipelineStep } from "@/types/domain";
import type {
  AnalysisRunResponse,
  AuditEntry,
  CapaAction,
  InvestigationDetail,
  InvestigationSummary,
  RootCause,
} from "@/types/investigation";

export const investigationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listInvestigations: build.query<InvestigationSummary[], void>({
      query: () => "/investigations",
      providesTags: ["InvestigationList"],
    }),
    getInvestigation: build.query<InvestigationDetail, string>({
      query: (id) => `/investigations/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Investigation", id }],
    }),
    createInvestigation: build.mutation<InvestigationDetail, { deviation_no: string; title?: string }>({
      query: (body) => ({ url: "/investigations", method: "POST", body }),
      invalidatesTags: ["InvestigationList"],
    }),
    updateInvestigation: build.mutation<InvestigationDetail, { id: string } & Partial<InvestigationDetail>>({
      query: ({ id, ...body }) => ({ url: `/investigations/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Investigation", id }, { type: "Audit", id }],
    }),
    uploadDocument: build.mutation<void, { id: string; file: File }>({
      query: ({ id, file }) => {
        const form = new FormData();
        form.append("file", file);
        return { url: `/investigations/${id}/documents`, method: "POST", body: form };
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Investigation", id }],
    }),
    submitPastedText: build.mutation<void, { id: string; text: string; title?: string }>({
      query: ({ id, ...body }) => ({ url: `/investigations/${id}/documents/text`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Investigation", id }],
    }),
    runAnalysis: build.mutation<AnalysisRunResponse, string>({
      query: (id) => ({ url: `/investigations/${id}/analyze`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Investigation", id }, { type: "Audit", id }],
    }),
    rerunStep: build.mutation<AnalysisRunResponse, { id: string; step: PipelineStep }>({
      query: ({ id, step }) => ({ url: `/investigations/${id}/analyze/${step}`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Investigation", id }],
    }),
    updateRootCause: build.mutation<RootCause, { id: string; investigationId: string } & Partial<RootCause>>({
      query: ({ id, investigationId: _, ...body }) => ({ url: `/root-causes/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { investigationId }) => [
        { type: "Investigation", id: investigationId },
        { type: "Audit", id: investigationId },
      ],
    }),
    updateCapa: build.mutation<CapaAction, { id: string; investigationId: string } & Partial<CapaAction>>({
      query: ({ id, investigationId: _, ...body }) => ({ url: `/capa/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { investigationId }) => [
        { type: "Investigation", id: investigationId },
        { type: "Audit", id: investigationId },
      ],
    }),
    approveInvestigation: build.mutation<InvestigationDetail, { id: string; comment?: string }>({
      query: ({ id, ...body }) => ({ url: `/investigations/${id}/approve`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Investigation", id }, "InvestigationList", { type: "Audit", id }],
    }),
    getAuditTrail: build.query<AuditEntry[], string>({
      query: (id) => `/investigations/${id}/audit`,
      providesTags: (_r, _e, id) => [{ type: "Audit", id }],
    }),
  }),
});

export const {
  useListInvestigationsQuery,
  useGetInvestigationQuery,
  useCreateInvestigationMutation,
  useUpdateInvestigationMutation,
  useUploadDocumentMutation,
  useSubmitPastedTextMutation,
  useRunAnalysisMutation,
  useRerunStepMutation,
  useUpdateRootCauseMutation,
  useUpdateCapaMutation,
  useApproveInvestigationMutation,
  useGetAuditTrailQuery,
} = investigationsApi;
