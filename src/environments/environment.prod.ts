// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ApiDataService } from "src/app/data-handlers/api-data/api-data.service";
import { EnvironmentDefinition } from "./environment-definition";

const api_domain = "$API_DOMAIN";
const api_prefix = "$API_PREFIX";
const home_uri = "$HOME_URI";
const time_remaining = Number("$TIME_REMAINING");
const redirect_unauthenticated = "$REDIRECT_UNAUTHENTICATED";
var secure = "$SECURE"
var protocol = secure === "true" ? "https" : "http"
var rest_url = protocol + "://" + api_domain + api_prefix + "/"
var bluemedicalPaymentToken = "$BLUEMEDICAL_PAYMENT_TOKEN";
var bluemedicalPaymentVault = "$BLUEMEDICAL_PAYMENT_VAULT";
var bluemedicalPaymentEnvironment = "$BLUEMEDICAL_PAYMENT_ENVIRONMENT";
var bluemedicalPaymentCommerceId = "$BLUEMEDICAL_PAYMENT_COMMERCE_ID";
var deploymentEnvironment = "$CURRENT_ENVIRONMENT";
var paymentService = "$PAYMENT_SERVICE";
export const environment: EnvironmentDefinition = { 
  production: true,
  deploymentEnvironment: deploymentEnvironment as any,
  currentDataHandler: ApiDataService as any,
  dataHandlerParams: {
    baseUrl: rest_url
  },
  redirectUnauthenticated: redirect_unauthenticated,
  initialRoute: home_uri,
  serverDomain: api_domain,
  secure: secure === "true",
  timeRemaining: time_remaining,
  api: {
    endpoint: api_prefix
  },
  bluemedicalPaymentToken: bluemedicalPaymentToken,
  bluemedicalPaymentVault:bluemedicalPaymentVault,
  bluemedicalPaymentEnvironment:bluemedicalPaymentEnvironment,
  bluemedicalPaymentCommerceId:bluemedicalPaymentCommerceId,
  paymentService: paymentService
};
