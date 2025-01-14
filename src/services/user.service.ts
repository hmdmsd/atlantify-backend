import { UserModel } from '../models/user.model';
import bcrypt from 'bcryptjs';

export class UserService {
  /**
   * Retrieves a user by their ID.
   * @param userId - The ID of the user.
   * @returns The user or null if not found.
   */
  async getUserById(userId: string): Promise<UserModel | null> {
    return UserModel.findByPk(userId);
  }

  /**
   * Retrieves a user by their username.
   * @param username - The username of the user.
   * @returns The user or null if not found.
   */
  async getUserByUsername(username: string): Promise<UserModel | null> {
    return UserModel.findOne({ where: { username } });
  }

  /**
   * Updates user information.
   * @param userId - The ID of the user.
   * @param updates - The fields to update (partial user object).
   * @returns The updated user or null if the user does not exist.
   */
  async updateUser(
    userId: string,
    updates: Partial<UserModel>
  ): Promise<UserModel | null> {
    const user = await UserModel.findByPk(userId);
    if (!user) return null;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    Object.assign(user, updates);
    await user.save();
    return user;
  }

  /**
   * Deletes a user by their ID.
   * @param userId - The ID of the user.
   * @returns True if the user was deleted, false otherwise.
   */
  async deleteUser(userId: string): Promise<boolean> {
    const user = await UserModel.findByPk(userId);
    if (!user) return false;

    await user.destroy();
    return true;
  }

  /**
   * Retrieves all users.
   * @returns A list of all users.
   */
  async getAllUsers(): Promise<UserModel[]> {
    return UserModel.findAll();
  }

  /**
   * Creates a new user.
   * @param username - The username of the new user.
   * @param email - The email of the new user.
   * @param password - The password of the new user.
   * @param role - The role of the new user (default: 'user').
   * @returns The newly created user.
   */
  async createUser({
    username,
    email,
    password,
    role = 'user',
  }: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<UserModel> {
    const hashedPassword = await bcrypt.hash(password, 10);

    return UserModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
  }

  /**
   * Verifies a user's password.
   * @param userId - The ID of the user.
   * @param password - The password to verify.
   * @returns True if the password is valid, false otherwise.
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await UserModel.findByPk(userId);
    if (!user) return false;

    return bcrypt.compare(password, user.password);
  }
}
