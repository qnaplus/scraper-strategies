import { Logger } from "pino";
import { unleak } from "./utils";

export interface FetchClientOptions {
    /**
     * Optional logger to include
     */
    logger?: Logger;
}

export type FetchClientResponse = {
    /**
     * Whether the request was successful
     */
    ok: boolean;

    /**
     * The status of the request
     */
    status: number;

    /**
     * The response body
     */
    body: string;

    /**
     * The final url resolved for the request (e.g., redirect urls)
     */
    url: string;
};

export type FetchHtmlResponse = {
    /**
     * The HTML obtained from a request
     */
    html: string;

    /**
     * The final url resolved for the request.
     */
    url: string;
};

export abstract class FetchClient<FetchResponse extends FetchClientResponse> {
    constructor(protected logger?: Logger) {}

    abstract fetch(url: string): Promise<FetchResponse>;
    abstract teardown(): Promise<void> | void;

    /**
     * Utility method for checking if a page exists
     * @param url The url to ping
     * @returns boolean indicating whether the response was ok
     */
    async ping(url: string): Promise<boolean> {
        const response = await this.fetch(url);
        return response.ok;
    }
    /**
     *
     * @param url The url to get
     * @returns The html for the given url
     */
    async getHtml(url: string): Promise<FetchHtmlResponse | null> {
        this.logger?.trace(`Fetching HTML from ${url}.`);

        const response = await this.fetch(url);
        this.logger?.trace(
            {
                url,
                status: response.status
            },
            `Fetch for ${url} returned ${response.status}`
        );
        if (!response.ok) {
            return null;
        }
        return {
            url: response.url,
            html: unleak(response.body)
        };
    }
}
