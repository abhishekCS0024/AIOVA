import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Decision = "accepted" | "rejected";

/** Accept/reject decisions on AI suggestions and the approval state. */
interface ReviewState {
  causeDecisions: Record<string, Decision>;
  capaDecisions: Record<string, Decision>;
  approvalComment: string;
  submittedForApproval: boolean;
}

const initialState: ReviewState = {
  causeDecisions: {},
  capaDecisions: {},
  approvalComment: "",
  submittedForApproval: false,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    causeDecided(state, action: PayloadAction<{ id: string; decision: Decision }>) {
      state.causeDecisions[action.payload.id] = action.payload.decision;
    },
    capaDecided(state, action: PayloadAction<{ id: string; decision: Decision }>) {
      state.capaDecisions[action.payload.id] = action.payload.decision;
    },
    approvalCommentChanged(state, action: PayloadAction<string>) {
      state.approvalComment = action.payload;
    },
    submittedForApproval(state) {
      state.submittedForApproval = true;
    },
    reset: () => initialState,
  },
});

export const { causeDecided, capaDecided, approvalCommentChanged, submittedForApproval, reset } =
  reviewSlice.actions;
export default reviewSlice.reducer;
