import { Model } from "../core/data/resources/model";

export class PersonalInfo extends Model {
  id: number;
  name: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    id: number;
    id_type: string;
    sex: string;
    emergency_phone: string;
    nationality: string;
    id_code: string;
    id_issue_country: string;
    birth_date: string;
    birth_day: string;
    birth_month: string;
    birth_year: string;
  };
  has_vivolife: boolean;
  has_vivo_id: boolean;
  insurance_agent: string;
  insurance_agent_id: number;
  vivo_id: string;
  reference_code: string;
  insurance_warning: boolean;

  resourceName(): string {
    return "profile";
  }
}
