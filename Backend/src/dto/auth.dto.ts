export interface LoginDTO {
    email: string;
    password: string;
  }
  
  export interface SignupDTO {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    picture?: string;
    biometric_fingerprint?: Buffer;
    category_id?: number;
    role_ids?: number[];
  }
  
  export interface TokenPayload {
    id: number;
    email?: string;
  }
  
  