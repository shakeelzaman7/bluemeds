import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

/**
 * Service for handling payment-related operations like fetching states and cities.
 */
@Injectable({
  providedIn: 'root'
})

export class PaymentService {

    constructor() { }

    /**
     * Fetches a list of states from the payment service API.
     * Uses the Fetch API and returns a promise.
     */
    async fetchStates() {
        const url = `${environment.paymentService}/api/v1/states?page=1&per_page=22&filter[country_id]=1`;
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${environment.bluemedicalPaymentToken}` }
            });
            const data = await this.processResponse(response);
            return data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Fetches a list of cities for a given state from the payment service API.
     * Uses the Fetch API and returns a promise.
     * @param {string} state - The ID of the state to fetch cities for.
     */
    async fetchCities(state) {
        if (!state) {
        throw new Error('State ID is required');
        }

        const url = `${environment.paymentService}/api/v1/cities?page=1&per_page=50&filter[state_id]=${state}`;
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${environment.bluemedicalPaymentToken}` }
            });
            const data = await this.processResponse(response);

            return data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async fetchZipcode(cityId) {
        if (!cityId) {
        throw new Error('City ID is required');
        }

        const url = `${environment.paymentService}/api/v1/cities/${cityId}/zip-codes`;
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${environment.bluemedicalPaymentToken}` }
            });
            const data = await this.processResponse(response);

            return data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Processes the HTTP response, checking for errors and parsing the JSON body.
     * @param {Response} response - The fetch response to process.
     */
    async processResponse(response): Promise<any> {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        return response.json().then(res => res.data);
    }

    /**
     * Handles errors that may occur during the API call.
     * @param {Error} error - The error object.
     */
    handleError(error) {
        throw error; // Rethrowing the error to be handled by the caller
    }

    /**
     * Retrieves payment data for a given payment medium token ID.
     *
     * @param paymentMediumTokenId - The ID of the payment medium token.
     * @returns A Promise that resolves to the payment data.
     */
    public async getPaymentData(paymentMediumTokenId: string): Promise<any> {
      const url = `${environment.paymentService}/api/v1/tokens/cards/${paymentMediumTokenId}?include[]=paymentTokens&include[]=defaultGateway`;
        try {
            const response = await fetch(url, {
              // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: {
                  'Authorization': `Bearer ${environment.bluemedicalPaymentToken}`,
                  'Accept-Language': 'es'
                }
            });
            return await this.processResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }

    public async updatePaymentMethod(paymentMethod: any) {
        const url = `${environment.paymentService}/api/v1/tokens/cards/${paymentMethod.payment_medium_token_id}`
    
        const data = {
          expiration_date: paymentMethod.expiration_date,
          card_holder_name: paymentMethod.card_holder_name,
        };

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${environment.bluemedicalPaymentToken}`,
                  'Accept-Language': 'es',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            return await this.processResponse(response);
        } catch (error) {
            this.handleError(error);
        }
      }
}
