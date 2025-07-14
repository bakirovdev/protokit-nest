import * as request from 'supertest';
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { IFeatureTest } from "./interfaces/feature-test-iterface";

export class FeatureTest 
{
    protected app: INestApplication;

    userId: Number|null;
    url: string = '';
    method: string = '';
    headers: Object = {};
    query: Array<any> = [];
    queryToString: string = '';
    body: Array<any> = [];
    response: any;

    private allHeaders: Object = {
        'Accept': 'application/json',
        'Accept-Language': 'en'
    };

    protected async setUp(): Promise<void>
    {
        this.app = await this.createTestApp();
    }

    protected async createTestApp(): Promise<INestApplication> {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        const app  = moduleFixture.createNestApplication();
        await app.init();

        return app;
    }

    getHttpServer()
    {
        return this.app.getHttpServer();
    }

    sendRequest({
            method = 'GET',
            path = '',
            query = [],
            body = [],
            expectStatus = 200
        }: {
            method?: string;
            path?: string;
            query?: any[];
            body?: any[];
            expectStatus?: number;
        }
    ): void
    {
        this.method = method
        this.url += path ? `/${path}` : ''
        this.body = body
        this.query = query

        this.response = this.sendRequestAndPrepareData()

        try {
            expect(this.response.status).toBe(expectStatus);
        } catch (error) {
            
        }
    }

    private async sendRequestAndPrepareData()
    {
        const updateMethods = ['PUT', 'PATCH'];
        if (updateMethods.some(method => method === this.method)) {
            this.query['_method'] = this.method;
            this.method = 'POST';
        }
        
        this.queryToString =  this.httpBuildQuery(this.query)
        this.allHeaders = {...this.allHeaders, ...this.headers}

        if (this.userId) {
            this.allHeaders['Authorization'] = '<TOKEN>'
        }

        const res = await request(this.app.getHttpServer())
            [this.method.toLowerCase()](this.url)
            .set(this.allHeaders as Record<string, string>)
            .send(this.body)
            .query(this.queryToString);

        return res;
    }

    private httpBuildQuery(data: any, prefix: string = ''): string 
    {
        const query: string[] = [];
        
        if (data === null || typeof data !== 'object') {
            // Handle primitive values (string, number, boolean, null, undefined)
            if (data !== undefined && data !== null) {
                query.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(data))}`);
            }
            return query.join('&');
        }

        // Handle arrays and objects
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key as keyof typeof data];
                const fullKey = prefix ? `${prefix}[${key}]` : key;
                
                if (value !== null && typeof value === 'object') {
                    // Recursively handle nested objects and arrays
                    const nestedQuery = this.httpBuildQuery(value, fullKey);
                    if (nestedQuery) {
                    query.push(nestedQuery);
                    }
                } else if (value !== undefined && value !== null) {
                    // Handle primitive values
                    query.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
                }
            }
        }
        
        return query.join('&');
    }


    static run (this: IFeatureTest)
    {
        const Suite = this;

        describe(Suite.name, () => {
            const instance = new Suite();

            beforeAll(async () => {
                await instance.setUp();
            })

             /* pick every method that looks like a test case */
            const methods = Object.getOwnPropertyNames(Suite.prototype)
                .filter(
                (name) =>
                    name !== 'constructor' &&
                    typeof (instance as any)[name] === 'function' &&
                    (/^test/.test(name) || name.includes('should'))
                );

            for (const name of methods) {
                const title = name.replace(/_/g, ' ').replace(/^test\s*/i, '').trim();
                it(title, async () => {
                    await (instance as any)[name](); // run the test method
                });
            }
        })
    }
}