import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { api, beginSession } from "./api";
import { storage } from "./storage";
import { logoutSession } from "./logout";

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

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  beginSession();
  backing.clear();
  location.href = "";
  delete api.defaults.headers.common.Authorization;
  apiMock.reset();
  axiosMock.reset();
});

describe("logoutSession", () => {
  it("sends the current refresh token in the body with the access token attached", async () => {
    storage.setAccessToken("at-1");
    storage.setRefreshToken("rt-1");
    apiMock.onPost("/auth/logout").reply((config) => {
      expect(JSON.parse(config.data)).toEqual({ refreshToken: "rt-1" });
      expect(bearer(config)).toBe("Bearer at-1");
      return [200, { success: true }];
    });

    await logoutSession();

    expect(apiMock.history.post).toHaveLength(1);
  });

  it("skips the remote request when no refresh token is stored", async () => {
    storage.setAccessToken("at-1");

    await logoutSession();

    expect(apiMock.history.post).toHaveLength(0);
    expect(storage.getAccessToken()).toBeNull();
  });

  it("clears local authentication state after a successful logout", async () => {
    storage.setAccessToken("at-1");
    storage.setRefreshToken("rt-1");
    api.defaults.headers.common.Authorization = "Bearer at-1";
    apiMock.onPost("/auth/logout").reply(200, { success: true });

    await logoutSession();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
  });

  it("clears local state even when the remote logout fails", async () => {
    storage.setAccessToken("at-1");
    storage.setRefreshToken("rt-1");
    apiMock.onPost("/auth/logout").reply(500);

    await logoutSession();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
  });

  it("does not trigger a refresh or retry when the logout request returns 401", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock.onPost("/auth/logout").reply(401);
    axiosMock.onPost(/\/auth\/refresh$/).reply(200, {
      accessToken: "at-2",
      refreshToken: "rt-2",
    });

    await logoutSession();

    expect(apiMock.history.post).toHaveLength(1);
    expect(refreshCalls()).toHaveLength(0);
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it("does not persist refreshed tokens while the remote logout is still pending", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock.onGet("/me").reply(401);

    let resolveRefresh: (value: [number, unknown]) => void = () => {};
    axiosMock.onPost(/\/auth\/refresh$/).reply(
      () =>
        new Promise<[number, unknown]>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    let resolveLogout: (value: [number, unknown]) => void = () => {};
    apiMock.onPost("/auth/logout").reply(
      () =>
        new Promise<[number, unknown]>((resolve) => {
          resolveLogout = resolve;
        }),
    );

    const request = api.get("/me").catch((err) => err);
    await vi.waitFor(() => expect(refreshCalls()).toHaveLength(1));

    const logout = logoutSession();
    await vi.waitFor(() => expect(apiMock.history.post).toHaveLength(1));

    resolveRefresh([200, { accessToken: "at-2", refreshToken: "rt-2" }]);
    await request;

    expect(storage.getAccessToken()).toBe("at-expired");
    expect(storage.getRefreshToken()).toBe("rt-1");

    resolveLogout([200, { success: true }]);
    await logout;

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it("does not start a refresh for a 401 that arrives during logout", async () => {
    storage.setAccessToken("at-1");
    storage.setRefreshToken("rt-1");

    let resolveLogout: (value: [number, unknown]) => void = () => {};
    apiMock.onPost("/auth/logout").reply(
      () =>
        new Promise<[number, unknown]>((resolve) => {
          resolveLogout = resolve;
        }),
    );
    apiMock.onGet("/other").reply(401);

    const logout = logoutSession();
    await vi.waitFor(() => expect(apiMock.history.post).toHaveLength(1));

    await expect(api.get("/other")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshCalls()).toHaveLength(0);
    expect(apiMock.history.post.filter((r) => r.url === "/auth/logout")).toHaveLength(1);

    resolveLogout([200, { success: true }]);
    await logout;
  });

  it("rejects queued requests when logout begins while a refresh is in flight", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock.onGet("/a").reply(401).onGet("/b").reply(401);
    apiMock.onPost("/auth/logout").reply(200, { success: true });

    let resolveRefresh: (value: [number, unknown]) => void = () => {};
    axiosMock.onPost(/\/auth\/refresh$/).reply(
      () =>
        new Promise<[number, unknown]>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const a = api.get("/a").catch((err) => err);
    const b = api.get("/b").catch((err) => err);
    await vi.waitFor(() => expect(refreshCalls()).toHaveLength(1));

    await logoutSession();
    resolveRefresh([200, { accessToken: "at-2", refreshToken: "rt-2" }]);
    const [ra, rb] = await Promise.all([a, b]);

    expect(ra.response.status).toBe(401);
    expect(rb.response.status).toBe(401);
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it("lets a subsequent login session refresh normally", async () => {
    storage.setAccessToken("at-1");
    storage.setRefreshToken("rt-1");
    apiMock.onPost("/auth/logout").reply(200, { success: true });

    await logoutSession();

    beginSession();
    storage.setAccessToken("at-new");
    storage.setRefreshToken("rt-new");

    apiMock.onGet("/me").replyOnce(401).onGet("/me").reply(200, { ok: true });
    axiosMock.onPost(/\/auth\/refresh$/).reply(200, {
      accessToken: "at-newer",
      refreshToken: "rt-newer",
    });

    const res = await api.get("/me");

    expect(res.status).toBe(200);
    expect(refreshCalls()).toHaveLength(1);
    expect(storage.getAccessToken()).toBe("at-newer");
    expect(storage.getRefreshToken()).toBe("rt-newer");
  });

  it("prevents an in-flight refresh from restoring tokens after logout", async () => {
    storage.setAccessToken("at-expired");
    storage.setRefreshToken("rt-1");
    apiMock.onGet("/me").reply(401);

    let resolveRefresh: (value: [number, unknown]) => void = () => {};
    axiosMock.onPost(/\/auth\/refresh$/).reply(
      () =>
        new Promise<[number, unknown]>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const request = api.get("/me").catch((err) => err);
    await vi.waitFor(() => expect(refreshCalls()).toHaveLength(1));

    await logoutSession();
    resolveRefresh([200, { accessToken: "at-2", refreshToken: "rt-2" }]);
    await request;
    await flush();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });
});
