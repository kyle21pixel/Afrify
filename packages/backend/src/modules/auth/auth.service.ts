import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from './user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = UserRole.CUSTOMER,
  ): Promise<{ user: User; token: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      verificationToken,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    // Send welcome email
    await this.notificationsService.sendWelcomeEmail(
      email,
      `${firstName} ${lastName}`,
    );

    // Generate JWT token
    const token = this.generateToken(user);

    this.logger.log(`User registered: ${email}`);

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(user);

    this.logger.log(`User logged in: ${email}`);

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    // Send reset email
    await this.notificationsService.sendPasswordReset(email, resetToken);

    this.logger.log(`Password reset requested: ${email}`);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    // Find user with valid reset token
    const users = await this.userRepository.find({
      where: {
        resetPasswordExpires: new Date(),
      },
    });

    let user: User | null = null;

    for (const u of users) {
      if (u.resetPasswordToken) {
        const isValid = await bcrypt.compare(token, u.resetPasswordToken);
        if (isValid && u.resetPasswordExpires > new Date()) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    this.logger.log(`Password reset completed: ${user.email}`);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.emailVerified = true;
    user.verificationToken = null;

    await this.userRepository.save(user);

    this.logger.log(`Email verified: ${user.email}`);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    this.logger.log(`Password changed: ${user.email}`);
  }

  async updateProfile(
    userId: string,
    data: Partial<User>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update allowed fields
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.phone) user.phone = data.phone;

    await this.userRepository.save(user);

    delete user.password;
    return user;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Soft delete by deactivating
    user.isActive = false;
    await this.userRepository.save(user);

    this.logger.log(`Account deactivated: ${user.email}`);
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      storeId: user.storeId,
    };

    return this.jwtService.sign(payload);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
