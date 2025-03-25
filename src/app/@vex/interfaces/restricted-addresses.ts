export interface RestrictedAddresses {
  success: boolean;
  message: string;
  data: RestrictedAddressesData;
}

interface RestrictedAddressesData {
  id: number;
  city_id: number;
  municipality_id: number | null;
  zip_code: string | null;
  details: RestrictedAddressesDataDetails;
}

interface RestrictedAddressesDataDetails {
  addresses: string[];
  comment: string | null;
}
