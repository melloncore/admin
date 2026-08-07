import { createCollectionApi } from "@/lib/api/collection";

interface Item {
  id: string;
  name: string;
}

describe("createCollectionApi", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lists seed data on first read", async () => {
    const api = createCollectionApi<Item>("test-items", [{ id: "1", name: "Alpha" }], 0);
    const items = await api.list();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Alpha");
  });

  it("creates, updates and removes items", async () => {
    const api = createCollectionApi<Item>("test-items-2", [], 0);

    const created = await api.create({ name: "Beta" });
    expect(created.id).toBeTruthy();

    const updated = await api.update(created.id, { name: "Beta v2" });
    expect(updated?.name).toBe("Beta v2");

    await api.remove(created.id);
    const remaining = await api.list();
    expect(remaining).toHaveLength(0);
  });
});
