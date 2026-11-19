import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { api } from "./api";
import { storage } from "./storage";

const backing = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => backing.get(key) ?? null,
  setItem: (key: string, value: string) => void backing.set(key, String(value)),
  removeItem: (key: string) => void backing.delete(key),
  clear: () => backing.clear(),
};
const location = { href: "", origin: "http://localhost" };

vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("window", { localStorage: localStorageMock, location });

const apiMock = new MockAdapter(api);
const axiosMock = new MockAdapter(axios);

const refreshCalls = () =>
  axiosMock.history.post.filter((r) => r.url?.includes("/auth/refresh"));

const bearer = (config: { headers?: unknown }) => {
  const headers = config.headers as Record<string, string> & {
    get?: (name: string) => string | null;
  };
  return headers?.Authorization ?? headers?.get?.("Authorization") ?? null;
};

beforeEach(() => {
  backing.clear();
  location.href = "";
  apiMock.reset();
  axiosMock.reset();
});

describe("api refresh interceptor", () => {
  it("serves requests without refresh while the access token is valid", async () => {
    storage.setAccessToken("at-valid");
    storage.setRefreshToken("rt-1");
    apiMock.onGet("/me").reply(200, { ok: true });

    const res = await api.get("/me");

    expect(res.status).toBe(200);
    expect(refreshCalls()).toHaveLength(0);
  });

  it("refreshes via Authorization Bearer and retries with the new access token", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock.onGet("/me").replyOnce(401).onGet("/me").reply(200, { ok: true });
    axiosMock.onPost(/\/auth\/refresh$/).reply((config) => {
      expect(bearer(config)).toBe("Bearer rt-1");
      expect(config.data ?? null).toBeNull();
      return [200, { accessToken: "at-2", refreshToken: "rt-2" }];
    });

    const res = await api.get("/me");

    expect(res.status).toBe(200);
    expect(refreshCalls()).toHaveLength(1);
    expect(bearer(apiMock.history.get[1])).toBe("Bearer at-2");
    expect(storage.getAccessToken()).toBe("at-2");
    expect(storage.getRefreshToken()).toBe("rt-2");
  });

  it("sends the rotated refresh token on the next refresh", async () => {
    storage.setAccessToken("at-1");
    storage.setRefreshToken("rt-1");
    apiMock
      .onGet("/a").replyOnce(401).onGet("/a").reply(200)
      .onGet("/b").replyOnce(401).onGet("/b").reply(200);
    axiosMock
      .onPost(/\/auth\/refresh$/)
      .replyOnce((config) => {
        expect(bearer(config)).toBe("Bearer rt-1");
        return [200, { accessToken: "at-2", refreshToken: "rt-2" }];
      })
      .onPost(/\/auth\/refresh$/)
      .reply((config) => {
        expect(bearer(config)).toBe("Bearer rt-2");
        return [200, { accessToken: "at-3", refreshToken: "rt-3" }];
      });

    await api.get("/a");
    const res = await api.get("/b");

    expect(res.status).toBe(200);
    expect(refreshCalls()).toHaveLength(2);
    expect(storage.getRefreshToken()).toBe("rt-3");
  });

  it("clears authentication when the refresh token is rejected", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-bad");
    apiMock.onGet("/me").reply(401);
    axiosMock.onPost(/\/auth\/refresh$/).reply(401);

    await expect(api.get("/me")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshCalls()).toHaveLength(1);
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
    expect(location.href).toContain("/login");
  });

  it("does not attempt a refresh when no refresh token is stored", async () => {
    storage.setAccessToken("at-expired");
    apiMock.onGet("/me").reply(401);

    await expect(api.get("/me")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshCalls()).toHaveLength(0);
    expect(storage.getAccessToken()).toBeNull();
    expect(location.href).toContain("/login");
  });

  it("coalesces concurrent 401 responses into a single refresh", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock
      .onGet("/a").replyOnce(401).onGet("/a").reply(200, { r: "a" })
      .onGet("/b").replyOnce(401).onGet("/b").reply(200, { r: "b" });
    axiosMock.onPost(/\/auth\/refresh$/).reply(200, {
      accessToken: "at-2",
      refreshToken: "rt-2",
    });

    const [a, b] = await Promise.all([api.get("/a"), api.get("/b")]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(refreshCalls()).toHaveLength(1);
    expect(bearer(apiMock.history.get[2])).toBe("Bearer at-2");
    expect(bearer(apiMock.history.get[3])).toBe("Bearer at-2");
  });

  it("rejects once on refresh failure without a retry loop", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock.onGet("/me").reply(401);
    axiosMock.onPost(/\/auth\/refresh$/).reply(500);

    await expect(api.get("/me")).rejects.toMatchObject({
      response: { status: 500 },
    });

    expect(refreshCalls()).toHaveLength(1);
    expect(storage.getAccessToken()).toBeNull();
    expect(location.href).toContain("/login");
  });

  it("never refreshes for auth endpoints", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock.onPost("/auth/login").reply(401);
    apiMock.onPost("/auth/register").reply(401);

    await expect(api.post("/auth/login", {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    await expect(api.post("/auth/register", {})).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshCalls()).toHaveLength(0);
    expect(storage.getAccessToken()).toBeNull();
  });
});
