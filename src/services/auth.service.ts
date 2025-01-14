import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { jwtConfig } from '../config/jwt.config';

export class AuthService {
  /**
   * Authenticates a user by validating their credentials and returns a JWT.
   * @param username - The user's username.
   * @param password - The user's password.
   * @returns The JWT if successful, or null if authentication fails.
   */
  async login(username: string, password: string): Promise<string | null> {
    const user = await UserModel.findOne({ where: { username } });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
      }
    );
  }

  /**
   * Registers a new user by hashing their password and saving their details.
   * @param username - The desired username.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns The created user, or null if the user already exists.
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<UserModel | null> {
    const existingUser = await UserModel.findOne({ where: { username } });

    if (existingUser) return null;

    const hashedPassword = await bcrypt.hash(password, 10);

    return UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: 'user', // Default role
    });
  }

  /**
   * Refreshes a JWT token by validating the old token and generating a new one.
   * @param token - The old token to refresh.
   * @returns A new token if the old one is valid, or null if invalid.
   */
  async refreshToken(token: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as jwt.JwtPayload;

      return jwt.sign(
        { sub: decoded.sub, username: decoded.username, role: decoded.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );
    } catch {
      return null;
    }
  }
}
