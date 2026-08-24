import { api, ApiError } from "./api";

export interface CepResponse {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type CepErrorType = "not_found" | "network_error";

export type CepResult =
  | { success: true; data: CepResponse }
  | { success: false; error: CepErrorType };

export async function fetchCep(cep: string): Promise<CepResult> {
  try {
    const data = await api("/cep/" + cep);
    return {
      success: true,
      data: {
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      },
    };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) {
        return { success: false, error: "not_found" };
      }
    }
    return { success: false, error: "network_error" };
  }
}
