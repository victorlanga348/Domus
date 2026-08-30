declare global {
  namespace Express {
    interface Request {
      userId?: string;
      houseId?: string;
      user?: {
        userId: string;
        email: string;
        role: string;
        houseId?: string | null;
      };
    }
  }
}

export {};
