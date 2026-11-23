import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type InputMode = "pdf" | "text" | "email";

export const PIPELINE_STEPS = ["ingest", "extract", "gaps", "analyze", "causes", "capa"] as const;
export type PanelStep = (typeof PIPELINE_STEPS)[number];

/** AI panel input, pipeline run state and errors. */
interface AiPanelState {
  mode: InputMode;
  pastedText: string;
  runningFor: string | null; // investigation id being analyzed
  startedAt: number | null;
  error: string | null;
}

const initialState: AiPanelState = {
  mode: "pdf",
  pastedText: "",
  runningFor: null,
  startedAt: null,
  error: null,
};

const aiPanelSlice = createSlice({
  name: "aiPanel",
  initialState,
  reducers: {
    modeChanged(state, action: PayloadAction<InputMode>) {
      state.mode = action.payload;
    },
    pastedTextChanged(state, action: PayloadAction<string>) {
      state.pastedText = action.payload;
    },
    runStarted(state, action: PayloadAction<string>) {
      state.runningFor = action.payload;
      state.startedAt = Date.now();
      state.error = null;
    },
    runFinished(state) {
      state.runningFor = null;
      state.startedAt = null;
    },
    runFailed(state, action: PayloadAction<string>) {
      state.runningFor = null;
      state.startedAt = null;
      state.error = action.payload;
    },
  },
});

export const { modeChanged, pastedTextChanged, runStarted, runFinished, runFailed } = aiPanelSlice.actions;
export default aiPanelSlice.reducer;
