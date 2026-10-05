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

export interface partialUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  hashedPassword?: string;
}

export interface registerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface loginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  };
  token: string;
}
