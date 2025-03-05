// Step 3: Create Encryption Helper
  // helpers/encrypt.ts
  import * as jwt from "jsonwebtoken";
  import * as bcrypt from "bcrypt";
  import * as dotenv from "dotenv";
  
  dotenv.config();
  const { JWT_SECRET = "your_default_secret_key" } = process.env;
  
  export interface TokenPayload {
    id: number;
    email?: string;
  }

  export class Encrypt {
    static async hashPassword(password: string): Promise<string> {
      return bcrypt.hashSync(password, 12);
    }
    
    static comparePassword(hashPassword: string, password: string): boolean {
      return bcrypt.compareSync(password, hashPassword);
    }
  
    static generateToken(payload: TokenPayload): string {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
    }
  }