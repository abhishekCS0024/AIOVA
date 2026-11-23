import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Original AI output, kept untouched for the AI-vs-final comparison. */
interface AiDraftState {
  draft: Record<string, unknown> | null;
  generatedAt: string | null;
}

const initialState: AiDraftState = { draft: null, generatedAt: null };

const aiDraftSlice = createSlice({
  name: "aiDraft",
  initialState,
  reducers: {
    draftReceived(state, action: PayloadAction<Record<string, unknown>>) {
      state.draft = action.payload;
      state.generatedAt = new Date().toISOString();
    },
    cleared: () => initialState,
  },
});

export const { draftReceived, cleared } = aiDraftSlice.actions;
export default aiDraftSlice.reducer;
