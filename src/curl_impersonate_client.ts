import {
    BrowserPresets,
    BrowserType,
    ChromePresetVersion,
    CurlResultOk,
    FirefoxPresetVersion,
    getCompatibleBrowsers,
    RequestBuilder,
    RequestPreset,
    SafariPresetVersion
} from "@qnaplus/node-curl-impersonate";
import { FetchClient, FetchClientResponse } from "./fetch_client";

export class CurlImpersonateScrapingClient extends FetchClient<FetchClientResponse> {
    async fetch(url: string): Promise<FetchClientResponse> {
        const browsers = getCompatibleBrowsers();
        const badStatusCodes = [403];
        let latestResponse: FetchClientResponse = { ok: false, body: "", status: -1, url: "" };

        for (const browser of browsers) {
            for (const version of Object.keys(BrowserPresets[browser.name])) {
                const { response, details } = await this.doPresetRequest(url, {
                    name: browser.name,
                    version: version as ChromePresetVersion | FirefoxPresetVersion | SafariPresetVersion
                });
                latestResponse = {
                    body: response,
                    ok: details.response_code === 200,
                    url: details.url_effective,
                    status: details.response_code
                };
                if (!badStatusCodes.includes(details.response_code)) {
                    return latestResponse;
                } else {
                    this.logger?.trace(`Request did not return an accepted response code (preset: ${browser.name} v${version})`);
                }
            }
        }
        this.logger?.trace(`All presets failed (latest response: ${latestResponse}`);
        return latestResponse;
    }

    teardown(): Promise<void> | void {}

    private async doPresetRequest<T extends BrowserType>(url: string, preset: RequestPreset<T>): Promise<CurlResultOk> {
        const response = await new RequestBuilder().url(url).preset(preset).follow().send();
        if (response.stderr !== undefined) {
            throw new Error(response.stderr); // TODO figure out how to handle this
        }
        return response;
    }
}
