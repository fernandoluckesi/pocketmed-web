import { useEffect, type RefObject } from "react";
import { scrollToFirstFormError } from "../utils/scrollToFormError";

/**
 * Scrolls to the first invalid field whenever a submit attempt just failed —
 * whether that's client-side Yup validation (errors present right after
 * `submitCount` increments) or a server-side conflict/validation error
 * surfaced later via Formik's `setFieldError` from the submit handler's
 * catch block (errors change again after the same `submitCount`). Both
 * cases flow through the same `errors` object, so one effect covers both.
 *
 * `submitCount` increments on every `handleSubmit()` call regardless of
 * whether validation passed, which is what distinguishes "form loaded with
 * no errors yet" from "user just tried to submit and it failed" — without
 * it, this would fire (and steal scroll/focus) on first render too.
 */
export function useScrollToFirstFormError(
  formRef: RefObject<HTMLElement | null>,
  errors: Record<string, unknown>,
  submitCount: number,
) {
  useEffect(() => {
    if (submitCount === 0) return;
    if (Object.keys(errors).length === 0) return;
    scrollToFirstFormError(errors, formRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount, errors]);
}
