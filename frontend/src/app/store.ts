import { configureStore } from "@reduxjs/toolkit";

import aiDraftReducer from "@/features/aiDraft/aiDraftSlice";
import aiPanelReducer from "@/features/aiPanel/aiPanelSlice";
import investigationReducer from "@/features/investigation/investigationSlice";
import reviewReducer from "@/features/review/reviewSlice";
import { api } from "@/services/api";

export const store = configureStore({
  reducer: {
    investigation: investigationReducer,
    aiDraft: aiDraftReducer,
    aiPanel: aiPanelReducer,
    review: reviewReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
