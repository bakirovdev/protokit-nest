import { INestApplication, Injectable } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from "@src/app.module";
import { AuthService } from "@src/modules/common/auth/auth.service";
import { UserProfileType } from "@src/modules/user/user/fields";
import { PrismaService } from "@src/prisma/prisma.service";
import { I18nService } from "nestjs-i18n";
import request from 'supertest';
import { setI18nService } from "../helpers/translator.helper";
import { useContainer } from "class-validator";
import { BaseSearch } from "../search/base.search";
import qs from 'qs';

export type RequestOptions = {
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    url: string;
    data?: any;
    query?: any;
    headers?: Record<string, string>;
}

@Injectable()
export abstract class E2ETestSetup {    
    userId: number;
    routePath: string = ''

    protected search: BaseSearch
    protected prisma: PrismaService
    protected app: INestApplication;
    protected moduleFixture: TestingModule;
    protected requestHeaders = [];    

    private allRequestHeaders = {
        'Accept': 'application/json',
        'Accept-Language': 'en'
    };
    private requestMethod: 'get' | 'post' | 'put' | 'patch' | 'delete' = 'get';
    private requestUrl: string;
    private requestQuery: any = {}
    private requestBody: any = {}
    private requestFiles: any = {}

    async setUp(): Promise<void> {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

        this.moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        this.app = this.moduleFixture.createNestApplication();

        // Apply global configurations (same as main.ts)
        this.configureApp();

        // IMPORTANT: Init must be called to trigger constructors
        await this.app.init();

        this.prisma = this.app.get<PrismaService>(PrismaService);

        // Run any custom setup
        await this.beforeSetup();
    }

    protected configureApp(): void {
        (this.app as NestExpressApplication).set('query parser', (str: string) =>
            qs.parse(str, { depth: 10, arrayLimit: 100 })
        );
        useContainer(this.app.select(AppModule), { fallbackOnErrors: true });
        const i18n = this.app.get<I18nService<Record<string, unknown>>>(I18nService);
        setI18nService(i18n);
    }

    protected async beforeSetup(): Promise<void> {
        // Hook for custom setup before tests
    }

    async tearDown(): Promise<void> {
        await this.beforeTeardown();
        await this.app.close();
    }

    protected async beforeTeardown(): Promise<void> {
        // Hook for custom teardown before app closes
    }

    protected getHttpServer() {
        return this.app.getHttpServer();
    }

    protected async sendRequest(options: RequestOptions): Promise<request.Test> {
        this.requestMethod = options.method;
        this.requestBody = options.data;
        this.requestUrl = options.url;
        this.requestQuery = options.query;
        return await this.sendRequestAndPrepareData();
    }

    protected async sendRequestAndPrepareData(): Promise<request.Test> {
        if (['put', 'patch'].includes(this.requestMethod)) {
            if (!this.requestQuery) {
                this.requestQuery = {};
            }
            this.requestQuery['_method'] = this.requestMethod.toUpperCase();
            this.requestMethod = 'post';
        }        
        
        const requestQueryToString = qs.stringify(this.requestQuery, { arrayFormat: 'repeat' });

        this.allRequestHeaders = { ...this.allRequestHeaders, ...this.requestHeaders };

        if (this.userId) {
            await this.loginAsUser();
        }
        try {            
            this.requestUrl = this.routePath + this.requestUrl;
            this.requestUrl = requestQueryToString ? this.requestUrl + '?' + requestQueryToString : this.requestUrl;
            return this[this.requestMethod](this.requestUrl);
        } catch (error) {            
            console.log(error);
            throw error;
        }        
    }

    protected async loginAsUser(): Promise<void> {
        const prisma = this.app.get(PrismaService);

        const user = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                type: true,
                password: true,
                profile: true
            },
            where: { id: this.userId }
        });

        const authService = await this.app.resolve<AuthService>(AuthService);        

        const tokenResponse = await authService.generateToken(user as UserProfileType)                

        this.allRequestHeaders['Authorization'] = `Bearer ${tokenResponse.access_token}`;        
    }

    /**
     * Make a GET request
     */
    private get(url: string) {
        return request(this.getHttpServer()).get(url).set(this.allRequestHeaders);
    }
    /**
     * Make a POST request
     */
    private async post(url: string): Promise<request.Test> {        
        return await request(this.getHttpServer()).post(url).set(this.allRequestHeaders).send(this.requestBody);
    }    

    /**
     * Make a DELETE request
     */
    private async delete(url: string): Promise<request.Test> {
        return await request(this.getHttpServer()).delete(url).set(this.allRequestHeaders);
    }

    protected assertValidationError(response: request.Response) {
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    }

    protected assertSuccess(response: request.Response, status = 200) {
        if (response.status !== status) {
            console.log(response.body);            
        }
        expect(response.status).toBe(status);
    }

    protected assertNotFound(response: request.Response) {
        expect(response.status).toBe(404);
    }

    protected assertUnauthorized(response: request.Response) {
        expect(response.status).toBe(401);
    }

    protected assertForbidden(response: request.Response) {
        expect(response.status).toBe(403);
    }    
}