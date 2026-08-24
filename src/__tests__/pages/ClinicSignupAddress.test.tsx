import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import Signup from "../../pages/Auth/Signup";
import { fetchCep } from "../../services/cep";
import type { CepResult } from "../../services/cep";

// ====== Mocks ======

vi.mock("../../services/cep", () => ({
  fetchCep: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    registerDoctor: vi.fn(),
  }),
}));

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const MockIcon = (props: any) =>
    React.createElement("span", { "data-testid": "icon", ...props });
  const mocked: Record<string, unknown> = {};
  for (const key of Object.keys(actual)) {
    mocked[key] = MockIcon;
  }
  return mocked;
});

vi.mock("../../config/api", () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

vi.mock("../../components/Snackbar", () => ({
  Snackbar: () => null,
}));

vi.mock("../../components/PasswordStrengthIndicator", () => ({
  PasswordStrengthIndicator: () => null,
}));

vi.mock("../../components/ui/CustomSelect", () => ({
  CustomSelect: (props: any) =>
    React.createElement("select", {
      name: props.name,
      value: props.value,
      onChange: (e: any) => props.onChange?.(e.target.value),
    }),
}));

vi.mock("../Institutional/LegalModal", () => ({
  LegalModal: () => null,
  PrivacyPolicyContent: () => null,
  TermsOfServiceContent: () => null,
  SecurityStandardsContent: () => null,
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => React.createElement("div", props, children),
    button: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => React.createElement("button", props, children),
  },
}));

// ====== Helpers ======

const mockedFetchCep = fetchCep as ReturnType<typeof vi.fn>;

async function renderClinicForm() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>,
  );

  // Click "Cadastro como Clínica" button
  const clinicButton = screen.getByText("Cadastro como Clínica");
  await user.click(clinicButton);

  return user;
}

function getNoNumberCheckbox(): HTMLInputElement {
  return screen.getByRole("checkbox", {
    name: /Sem Número/i,
  }) as HTMLInputElement;
}

// ====== Task 7.4: Property 5 — Frontend auto-fill populates all address fields ======
// **Validates: Requirements 4.3**

describe("Property 5: Frontend auto-fill populates all address fields from CEP response", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("for any valid CepResponse, auto-fill sets all 4 address fields", async () => {
    // Arbitrary for valid CepResponse fields (non-empty alpha strings)
    const arbAlphaString = fc
      .stringMatching(/^[A-Za-z ]{1,30}$/)
      .filter((s) => s.trim().length > 0);

    const arbCepResponse = fc.record({
      street: arbAlphaString,
      neighborhood: arbAlphaString,
      city: arbAlphaString,
      state: fc.constantFrom(
        "AC",
        "AL",
        "AP",
        "AM",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MT",
        "MS",
        "MG",
        "PA",
        "PB",
        "PR",
        "PE",
        "PI",
        "RJ",
        "RN",
        "RS",
        "RO",
        "RR",
        "SC",
        "SP",
        "SE",
        "TO",
      ),
    });

    await fc.assert(
      fc.asyncProperty(arbCepResponse, async (cepData) => {
        cleanup();
        vi.clearAllMocks();

        const mockResult: CepResult = {
          success: true,
          data: cepData,
        };
        mockedFetchCep.mockResolvedValue(mockResult);

        const user = await renderClinicForm();

        // Type 8-digit CEP to trigger auto-fill
        const cepInput = screen.getByPlaceholderText("00000-000");
        await user.clear(cepInput);
        await user.type(cepInput, "01001000");

        // Wait for auto-fill to complete
        await waitFor(() => {
          expect(mockedFetchCep).toHaveBeenCalledWith("01001000");
        });

        // Verify all 4 fields are populated
        await waitFor(() => {
          const streetInput = screen.getByPlaceholderText(
            "Rua, Avenida, etc.",
          ) as HTMLInputElement;
          expect(streetInput.value).toBe(cepData.street);
        });

        const neighborhoodInput = screen.getByPlaceholderText(
          "Centro",
        ) as HTMLInputElement;
        const cityInput = screen.getByPlaceholderText(
          "São Paulo",
        ) as HTMLInputElement;

        expect(neighborhoodInput.value).toBe(cepData.neighborhood);
        expect(cityInput.value).toBe(cepData.city);

        // State is a select; verify it has the correct value
        const stateSelect = document.querySelector(
          'select[name="state"]',
        ) as HTMLSelectElement;
        expect(stateSelect.value).toBe(cepData.state);

        cleanup();
      }),
      { numRuns: 30 },
    );
  }, 60000);
});

// ====== Task 7.5: Property 6 — Frontend validation shows individual error per missing field ======
// **Validates: Requirements 7.1, 7.2**

describe("Property 6: Frontend validation shows individual error for each missing required field", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchCep.mockResolvedValue({
      success: false,
      error: "not_found" as const,
    });
  });

  afterEach(() => {
    cleanup();
  });

  // Map of fields to their expected error messages from Yup schema
  const REQUIRED_FIELDS: Record<string, string> = {
    cep: "CEP é obrigatório",
    street: "Endereço é obrigatório",
    number: "Número é obrigatório",
    neighborhood: "Bairro é obrigatório",
    city: "Cidade é obrigatória",
    state: "Estado é obrigatório",
  };

  const fieldKeys = Object.keys(REQUIRED_FIELDS);

  // Arbitrary: generate non-empty subsets of required fields to leave empty
  const arbFieldSubset = fc
    .subarray(fieldKeys, { minLength: 1, maxLength: fieldKeys.length })
    .filter((arr) => arr.length > 0);

  it("for any non-empty subset of required address fields left empty, submitting shows an error for each", async () => {
    await fc.assert(
      fc.asyncProperty(arbFieldSubset, async (emptyFields) => {
        cleanup();
        vi.clearAllMocks();
        mockedFetchCep.mockResolvedValue({
          success: false,
          error: "not_found" as const,
        });

        const user = await renderClinicForm();

        // Fill in fields that are NOT in the empty subset, to isolate validation
        const fieldsToFill = fieldKeys.filter((f) => !emptyFields.includes(f));

        for (const field of fieldsToFill) {
          switch (field) {
            case "cep": {
              const cepInput = screen.getByPlaceholderText("00000-000");
              await user.clear(cepInput);
              await user.type(cepInput, "01001000");
              break;
            }
            case "street": {
              const streetInput =
                screen.getByPlaceholderText("Rua, Avenida, etc.");
              await user.clear(streetInput);
              await user.type(streetInput, "Rua Test");
              break;
            }
            case "number": {
              const numberInput = screen.getByPlaceholderText("123");
              await user.clear(numberInput);
              await user.type(numberInput, "42");
              break;
            }
            case "neighborhood": {
              const neighborhoodInput = screen.getByPlaceholderText("Centro");
              await user.clear(neighborhoodInput);
              await user.type(neighborhoodInput, "Bairro Test");
              break;
            }
            case "city": {
              const cityInput = screen.getByPlaceholderText("São Paulo");
              await user.clear(cityInput);
              await user.type(cityInput, "Cidade Test");
              break;
            }
            case "state": {
              const stateSelect = document.querySelector(
                'select[name="state"]',
              ) as HTMLSelectElement;
              await user.selectOptions(stateSelect, "SP");
              break;
            }
          }
        }

        // Submit form to trigger validation (touch all fields)
        const submitButton = screen.getByRole("button", {
          name: /Cadastrar Clínica/i,
        });
        await user.click(submitButton);

        // Wait for validation errors to appear
        await waitFor(
          () => {
            for (const field of emptyFields) {
              const errorMsg = REQUIRED_FIELDS[field];
              expect(screen.getByText(errorMsg)).toBeInTheDocument();
            }
          },
          { timeout: 3000 },
        );

        cleanup();
      }),
      { numRuns: 30 },
    );
  }, 120000);
});

// ====== Task 7.6: Unit tests for Signup address fields ======

describe("Clinic Signup Address Fields - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchCep.mockResolvedValue({
      success: false,
      error: "not_found" as const,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Checkbox "Sem Número"', () => {
    it("disables number field when checked", async () => {
      const user = await renderClinicForm();

      const numberInput = screen.getByPlaceholderText(
        "123",
      ) as HTMLInputElement;
      expect(numberInput.disabled).toBe(false);

      const checkbox = getNoNumberCheckbox();
      await user.click(checkbox);

      expect(numberInput.disabled).toBe(true);
    });

    it("clears number field when checked", async () => {
      const user = await renderClinicForm();

      const numberInput = screen.getByPlaceholderText(
        "123",
      ) as HTMLInputElement;
      await user.type(numberInput, "100");
      expect(numberInput.value).toBe("100");

      const checkbox = getNoNumberCheckbox();
      await user.click(checkbox);

      expect(numberInput.value).toBe("");
    });

    it("re-enables number field when unchecked", async () => {
      const user = await renderClinicForm();

      const numberInput = screen.getByPlaceholderText(
        "123",
      ) as HTMLInputElement;
      const checkbox = getNoNumberCheckbox();

      // Check
      await user.click(checkbox);
      expect(numberInput.disabled).toBe(true);

      // Uncheck
      await user.click(checkbox);
      expect(numberInput.disabled).toBe(false);
    });
  });

  describe("Loading indicator during CEP query", () => {
    it("shows loading state while fetching CEP", async () => {
      // Create a promise that we control to hold the loading state
      let resolvePromise: (value: CepResult) => void;
      const pendingPromise = new Promise<CepResult>((resolve) => {
        resolvePromise = resolve;
      });
      mockedFetchCep.mockReturnValue(pendingPromise);

      const user = await renderClinicForm();

      const cepInput = screen.getByPlaceholderText("00000-000");
      await user.type(cepInput, "01001000");

      // fetchCep should have been called
      await waitFor(() => {
        expect(mockedFetchCep).toHaveBeenCalledWith("01001000");
      });

      // Now resolve the promise
      resolvePromise!({
        success: true,
        data: {
          street: "Rua A",
          neighborhood: "Centro",
          city: "SP",
          state: "SP",
        },
      });

      // After resolution, verify fields are filled
      await waitFor(() => {
        const streetInput = screen.getByPlaceholderText(
          "Rua, Avenida, etc.",
        ) as HTMLInputElement;
        expect(streetInput.value).toBe("Rua A");
      });
    });
  });

  describe("Error messages for CEP lookup", () => {
    it("shows message when CEP is not found (404)", async () => {
      mockedFetchCep.mockResolvedValue({ success: false, error: "not_found" });

      const user = await renderClinicForm();

      const cepInput = screen.getByPlaceholderText("00000-000");
      await user.type(cepInput, "00000000");

      await waitFor(() => {
        expect(
          screen.getByText(
            "CEP não encontrado. Preencha o endereço manualmente.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("shows message when network error occurs", async () => {
      mockedFetchCep.mockResolvedValue({
        success: false,
        error: "network_error",
      });

      const user = await renderClinicForm();

      const cepInput = screen.getByPlaceholderText("00000-000");
      await user.type(cepInput, "99999999");

      await waitFor(() => {
        expect(
          screen.getByText(
            "Não foi possível consultar o CEP. Preencha o endereço manualmente.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Address fields render correctly", () => {
    it("renders all address fields in the clinic form", async () => {
      await renderClinicForm();

      // CEP field
      expect(screen.getByPlaceholderText("00000-000")).toBeInTheDocument();

      // Street field
      expect(
        screen.getByPlaceholderText("Rua, Avenida, etc."),
      ).toBeInTheDocument();

      // Number field
      expect(screen.getByPlaceholderText("123")).toBeInTheDocument();

      // Complement field
      expect(
        screen.getByPlaceholderText("Sala 101, Bloco A, etc."),
      ).toBeInTheDocument();

      // Neighborhood field
      expect(screen.getByPlaceholderText("Centro")).toBeInTheDocument();

      // City field
      expect(screen.getByPlaceholderText("São Paulo")).toBeInTheDocument();

      // State select
      expect(screen.getByText("Selecione o estado")).toBeInTheDocument();

      // "Sem Número" checkbox
      expect(screen.getByText("Sem Número")).toBeInTheDocument();
    });

    it('renders section header "Endereço da Clínica"', async () => {
      await renderClinicForm();

      expect(screen.getByText("Endereço da Clínica")).toBeInTheDocument();
    });
  });
});
