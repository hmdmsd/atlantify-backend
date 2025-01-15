import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { UserModel } from '../models/user.model';
import { jwtConfig } from '../config/jwt.config';

export class AuthService {
  async login(
    usernameOrEmail: string,
    password: string
  ): Promise<{ token: string; user: UserModel } | null> {
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
      }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as UserModel,
    };
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<UserModel | null> {
    const existingUser = await UserModel.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) return null;

    const hashedPassword = await bcrypt.hash(password, 10);

    return UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });
  }

  async refreshToken(token: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as jwt.JwtPayload;
      const user = await UserModel.findByPk(decoded.id);

      if (!user) return null;

      return jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );
    } catch {
      return null;
    }
  }

  async getCurrentUser(token: string): Promise<UserModel | null> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as jwt.JwtPayload;
      return UserModel.findByPk(decoded.id);
    } catch {
      return null;
    }
  }
}
