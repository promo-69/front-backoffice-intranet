import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios.js";
import { getAllPermissions, getAllPermissionsPaginated } from "../permissions.service";

vi.mock("../../api/axios.js", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("permissions service pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads every available page of permissions", async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 1 }],
          metadata: { total_pages: 2, current_page: 1, next_page: 2 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ id: 2 }],
          metadata: { total_pages: 2, current_page: 2, next_page: null },
        },
      });

    const result = await getAllPermissionsPaginated({ limit: 100 });

    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenNthCalledWith(1, "/permissions", {
      params: { page: 1, limit: 100 },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, "/permissions", {
      params: { page: 2, limit: 100 },
    });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("returns a single page payload for a one-page request", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [{ id: 3 }],
        metadata: { total_pages: 1, current_page: 1, next_page: null },
      },
    });

    const result = await getAllPermissions({ page: 1, limit: 100 });

    expect(api.get).toHaveBeenCalledWith("/permissions", {
      params: { page: 1, limit: 100 },
    });
    expect(result).toEqual({
      data: [{ id: 3 }],
      metadata: { total_pages: 1, current_page: 1, next_page: null },
    });
  });
});
