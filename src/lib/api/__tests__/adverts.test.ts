import { advertsApi } from "@/lib/api/adverts";

const fetchMock = jest.fn();

describe("marketplace advert API", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  afterEach(() => fetchMock.mockReset());

  it("loads adverts from the admin endpoint", async () => {
    const advert = { id: "advert-1", title: "Sale" };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [advert] }),
    });

    await expect(advertsApi.list()).resolves.toEqual([advert]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/adverts\/admin$/),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("uploads image bytes through the authenticated advert upload endpoint", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: { url: "https://res.cloudinary.com/test/image.png", publicId: "advert-1" },
      }),
    });
    const file = new File(["image"], "ad.png", { type: "image/png" });

    await expect(advertsApi.uploadImage(file)).resolves.toEqual({
      url: "https://res.cloudinary.com/test/image.png",
      publicId: "advert-1",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/adverts\/admin\/uploads$/),
      expect.objectContaining({
        method: "POST",
        body: file,
        credentials: "include",
        headers: { "Content-Type": "image/png" },
      }),
    );
  });
});
