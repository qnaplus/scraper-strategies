import initCycleTLS, { CycleTLSClient } from "cycletls";
import { HeaderGenerator } from "header-generator";
import { Logger } from "pino";
import { FetchClient, FetchClientResponse } from "./fetch_client";

export type CycleTLSResponse = FetchClientResponse;

export class CycleTLSScrapingClient extends FetchClient<CycleTLSResponse> {
    private static instance: CycleTLSScrapingClient | null = null;
    private static logger?: Logger;
    private static client: CycleTLSClient;
    private static initialized: boolean = false;

    private constructor(logger?: Logger) {
        super(logger);
    }

    async fetch(url: string): Promise<CycleTLSResponse> {
        const client = CycleTLSScrapingClient.client;
        const headerGenerator = new HeaderGenerator();
        const options = {
            headers: headerGenerator.getHeaders(),
            ja3: "771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-51-57-47-53-10,0-23-65281-10-11-35-16-5-51-43-13-45-28-21,29-23-24-25-256-257,0"
        };
        const response = await client.get(url, options);
        return {
            body: response.body as string,
            ok: response.status === 200,
            url: response.finalUrl,
            status: response.status
        };
    }

    static async initialize(logger?: Logger): Promise<void> {
        if (CycleTLSScrapingClient.initialized) {
            return;
        }
        CycleTLSScrapingClient.logger = logger;
        CycleTLSScrapingClient.client = await initCycleTLS();
        CycleTLSScrapingClient.initialized = true;
    }

    static getInstance(): CycleTLSScrapingClient {
        if (!CycleTLSScrapingClient.initialized) {
            throw Error("Initialize was not called on CycleTLSScrapingClient.");
        }
        if (CycleTLSScrapingClient.instance === null) {
            CycleTLSScrapingClient.instance = new CycleTLSScrapingClient(CycleTLSScrapingClient.logger);
        }
        return CycleTLSScrapingClient.instance;
    }

    teardown(): Promise<void> | void {
        CycleTLSScrapingClient.logger?.trace("Tearing down CycleTLS");
        return CycleTLSScrapingClient.client.exit().then(() => {
            CycleTLSScrapingClient.initialized = false;
        });
    }
}
