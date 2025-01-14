import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  /**
   * Handles user login.
   * Validates the credentials and returns a JWT if successful.
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username and password are required.',
        });
        return;
      }

      const token = await authService.login(username, password);

      if (!token) {
        res
          .status(401)
          .json({ success: false, message: 'Invalid credentials.' });
        return;
      }

      res.status(200).json({ success: true, token });
    } catch (error) {
      console.error('Login error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Handles user registration.
   * Creates a new user account and returns a success message.
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Username, email, and password are required.',
        });
        return;
      }

      const user = await authService.register(username, email, password);

      if (!user) {
        res
          .status(400)
          .json({ success: false, message: 'User already exists.' });
        return;
      }

      res
        .status(201)
        .json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
      console.error('Registration error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Refreshes an expired JWT token and provides a new one.
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ success: false, message: 'Token is required.' });
        return;
      }

      const newToken = await authService.refreshToken(token);

      if (!newToken) {
        res
          .status(401)
          .json({ success: false, message: 'Invalid or expired token.' });
        return;
      }

      res.status(200).json({ success: true, token: newToken });
    } catch (error) {
      console.error('Token refresh error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Handles user logout.
   * In stateless JWT systems, logout is client-side only.
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Invalidate token logic (optional if using token blacklists)
      res
        .status(200)
        .json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
      console.error('Logout error:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error.' });
    }
  }
}
