import dns from "dns/promises";

const USER_AGENT = "FireMudFM/1.0 (https://firemudfm.com)";
const FALLBACK_SERVER = "de1.api.radio-browser.info";

export interface RBStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  languagecodes: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  votes: number;
  clickcount: number;
  clicktrend: number;
  geo_lat: number | null;
  geo_long: number | null;
}

export interface RBTag {
  name: string;
  stationcount: number;
}

export interface RBCountry {
  name: string;
  iso_3166_1: string;
  stationcount: number;
}

export interface SearchParams {
  name?: string;
  tag?: string;
  countrycode?: string;
  limit?: number;
  offset?: number;
  order?: string;
  hidebroken?: boolean;
  reverse?: boolean;
}

class RadioBrowserService {
  private serverUrl: string = `https://${FALLBACK_SERVER}`;
  private resolved = false;

  async init(): Promise<void> {
    if (this.resolved) return;
    try {
      const records = await dns.lookup("all.api.radio-browser.info");
      // Pick a server based on the resolved IP — use HTTPS with the fallback hostname
      // since radio-browser uses hostname-based HTTPS
      this.serverUrl = `https://${FALLBACK_SERVER}`;
    } catch {
      this.serverUrl = `https://${FALLBACK_SERVER}`;
    }
    this.resolved = true;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    await this.init();
    const url = `${this.serverUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        ...(options?.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new Error(`Radio Browser API error: ${res.status} ${res.statusText} for ${url}`);
    }
    return res.json() as Promise<T>;
  }

  async searchStations(params: SearchParams): Promise<RBStation[]> {
    const qs = new URLSearchParams();
    if (params.name) qs.set("name", params.name);
    if (params.tag) qs.set("tag", params.tag);
    if (params.countrycode) qs.set("countrycode", params.countrycode);
    qs.set("limit", String(params.limit ?? 24));
    qs.set("offset", String(params.offset ?? 0));
    qs.set("order", params.order ?? "votes");
    qs.set("hidebroken", "true");
    if (params.reverse !== undefined) qs.set("reverse", params.reverse ? "true" : "false");
    return this.fetch<RBStation[]>(`/json/stations/search?${qs}`);
  }

  async getStationByUuid(uuid: string): Promise<RBStation | null> {
    const results = await this.fetch<RBStation[]>(`/json/stations/byuuid/${uuid}`);
    return results?.[0] ?? null;
  }

  async getStationsByUuids(uuids: string[]): Promise<RBStation[]> {
    if (!uuids.length) return [];
    return this.fetch<RBStation[]>(`/json/stations/byuuid`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ uuids: uuids.join(",") }).toString(),
    });
  }

  async getTopStations(limit = 20): Promise<RBStation[]> {
    const qs = new URLSearchParams({
      order: "clickcount",
      reverse: "true",
      limit: String(limit),
      hidebroken: "true",
    });
    return this.fetch<RBStation[]>(`/json/stations/search?${qs}`);
  }

  async getTags(limit = 200): Promise<RBTag[]> {
    const qs = new URLSearchParams({
      order: "stationcount",
      reverse: "true",
      limit: String(limit),
      hidebroken: "true",
    });
    return this.fetch<RBTag[]>(`/json/tags?${qs}`);
  }

  async getCountries(limit = 300): Promise<RBCountry[]> {
    const qs = new URLSearchParams({
      order: "stationcount",
      reverse: "true",
      limit: String(limit),
    });
    return this.fetch<RBCountry[]>(`/json/countries?${qs}`);
  }

  async reportClick(uuid: string): Promise<void> {
    try {
      await this.fetch<unknown>(`/json/url/${uuid}`);
    } catch {
      // best-effort — don't fail the user's request if click reporting fails
    }
  }
}

export const radioBrowser = new RadioBrowserService();
