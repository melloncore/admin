import { leadsApi } from "@/lib/api/leads";

const inquiry = {
  id: "47fb3252-e8c1-4ebc-a17e-c3d39e45aa8f",
  name: "Avery Example",
  email: "avery@example.com",
  company: null,
  budget: "NGN 500,000",
  message: "We need help with a new website.",
  status: "NEW",
  createdAt: "2026-10-25T08:00:00.000Z",
};

const fetchMock = jest.fn();

describe("leadsApi", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  afterEach(() => fetchMock.mockReset());

  it("loads inquiries from the backend and maps them to admin leads", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [inquiry] }),
    });

    await expect(leadsApi.list()).resolves.toEqual([
      {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        company: "",
        estimatedBudget: inquiry.budget,
        projectDetails: inquiry.message,
        status: "new",
        submittedAt: inquiry.createdAt,
      },
    ]);
  });

  it("updates inquiry status through the backend", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { ...inquiry, status: "CONTACTED" } }),
    });

    await expect(leadsApi.updateStatus(inquiry.id, "contacted")).resolves.toMatchObject({
      id: inquiry.id,
      status: "contacted",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/contact\/inquiries\/.+\/status$/),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "CONTACTED" }),
      }),
    );
  });
});
