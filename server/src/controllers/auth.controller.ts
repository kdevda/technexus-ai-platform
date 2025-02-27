import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto, LoginUserDto } from '../types/auth';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData: RegisterUserDto = req.body;
      const result = await authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const credentials: LoginUserDto = req.body;
      const result = await authService.login(credentials);
      res.status(200).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials';
      res.status(401).json({ message: errorMessage });
    }
  }
} 