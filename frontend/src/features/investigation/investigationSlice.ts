import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { InvestigationStatus } from "@/types/domain";
import type { FormData } from "@/types/investigation";

/** Current form data (what the human keeps) and status. */
interface InvestigationState {
  id: string | null;
  status: InvestigationStatus | null;
  formData: FormData;
  savedFormData: FormData;
  editedFields: string[]; // fields changed in this editing session ("Edited" marker)
  dirty: boolean;
}

const initialState: InvestigationState = {
  id: null,
  status: null,
  formData: {},
  savedFormData: {},
  editedFields: [],
  dirty: false,
};

const investigationSlice = createSlice({
  name: "investigation",
  initialState,
  reducers: {
    loaded(state, action: PayloadAction<{ id: string; status: InvestigationStatus; formData: FormData }>) {
      const { id, status, formData } = action.payload;
      // Never clobber unsaved edits when a background refetch lands.
      if (state.id === id && state.dirty) {
        state.status = status;
        return;
      }
      Object.assign(state, initialState, { id, status, formData, savedFormData: formData });
    },
    fieldEdited(state, action: PayloadAction<{ field: keyof FormData; value: string | null }>) {
      const { field, value } = action.payload;
      (state.formData as Record<string, unknown>)[field] = value;
      if (!state.editedFields.includes(field)) state.editedFields.push(field);
      state.dirty = true;
    },
    discarded(state) {
      state.formData = state.savedFormData;
      state.editedFields = [];
      state.dirty = false;
    },
    saved(state) {
      state.savedFormData = state.formData;
      state.dirty = false;
    },
    reset: () => initialState,
  },
});

export const { loaded, fieldEdited, discarded, saved, reset } = investigationSlice.actions;
export default investigationSlice.reducer;
