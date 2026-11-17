import { createBackendCollectionApi, createBackendSettingsApi } from "@/lib/api/content";

const fetchMock = jest.fn();
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const apiRoot = configuredApiUrl
  ? configuredApiUrl.endsWith("/api/v1")
    ? configuredApiUrl
    : `${configuredApiUrl}/api/v1`
  : "/api/v1";

describe("backend content APIs", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  afterEach(() => fetchMock.mockReset());

  it("loads shared collection data from the backend", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [{ id: "service-1", title: "Strategy" }],
      }),
    });
    const api = createBackendCollectionApi<{ id: string; title: string }>("services");

    await expect(api.list()).resolves.toEqual([{ id: "service-1", title: "Strategy" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiRoot}/admin/content/services`,
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("migrates existing local collection data only when the backend is empty", async () => {
    window.localStorage.setItem(
      "nexlayer-admin:team",
      JSON.stringify([{ id: "member-1", name: "Avery" }]),
    );
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [{ id: "member-1", name: "Avery" }],
        }),
      });
    const api = createBackendCollectionApi<{ id: string; name: string }>("team");

    await expect(api.list()).resolves.toEqual([{ id: "member-1", name: "Avery" }]);
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${apiRoot}/admin/content/team/import`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ items: [{ id: "member-1", name: "Avery" }] }),
      }),
    );
    expect(window.localStorage.getItem("nexlayer-admin:team")).toBeNull();
  });

  it("uses the configured setting seed until the backend setting exists", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Content setting not found" }),
    });
    const seed = { primaryColor: "#123456" };
    const api = createBackendSettingsApi("appearance", seed);

    await expect(api.get()).resolves.toEqual(seed);
  });

  it("persists settings updates through the backend", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { primaryColor: "#654321" },
      }),
    });
    const api = createBackendSettingsApi("appearance", { primaryColor: "#123456" });

    await expect(api.replace({ primaryColor: "#654321" })).resolves.toEqual({
      primaryColor: "#654321",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiRoot}/admin/settings/appearance`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ primaryColor: "#654321" }),
      }),
    );
  });
});
