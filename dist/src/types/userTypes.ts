export interface UserRow {
  id: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  password_hash: string;
  created_on: Date;
  updated_on: Date;
  last_logged_in?: Date;
}
