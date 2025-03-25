import { IResourceDataHandler } from "src/app/core/data/resources/resource-data-handler";

export interface EnvironmentApiOptions {
    endpoint: string;
}

export interface EnvironmentDataHandleOptions {
    baseUrl: string;
}

export interface EnvironmentDefinition {
    production: boolean,
    deploymentEnvironment: 'local' | 'production' | 'QA' | 'staging',
    currentDataHandler: IResourceDataHandler,
    dataHandlerParams: EnvironmentDataHandleOptions;
    redirectUnauthenticated: string,
    initialRoute: string,
    serverDomain: string,
    secure: boolean,
    timeRemaining: number,
    api: EnvironmentApiOptions;
    bluemedicalPaymentToken:string;
    bluemedicalPaymentVault:string;
    bluemedicalPaymentEnvironment:string;
    bluemedicalPaymentCommerceId: string;
    paymentService: string;
}
