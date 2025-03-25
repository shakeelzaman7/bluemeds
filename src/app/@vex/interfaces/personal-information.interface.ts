export interface Personal {
  id: number;
  name: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  has_vivolife: boolean;
  has_vivo_id: boolean;
}

export interface PersonalDataProviderResponse {
  message: string;
  success?: boolean;
  data?: PersonalDataProvider;
}

interface PersonalDataProvider {
  names?: [{
    givenName: string;
    familyName: string;
  }];
  genders?: [{
    value: string;
  }];
  birthdays?: [{
    date: {
      day: number;
      month: number;
      year: number
    }
  }];
}