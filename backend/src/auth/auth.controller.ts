import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterInviteDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.authService.login(loginDto, ip);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any) {
    return this.authService.verifySession(req.user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out successfully.' };
  }

  @Post('register-invite')
  @HttpCode(HttpStatus.CREATED)
  async registerInvite(@Body() dto: RegisterInviteDto) {
    return this.authService.registerInvite(dto);
  }

  // Example role-protected endpoints demonstrating backend enforcement
  @Get('student-portal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  getStudentOnlyData(@Req() req: any) {
    return { message: `Authorized student access: ${req.user.email}` };
  }

  @Get('guide-portal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GUIDE')
  getGuideOnlyData(@Req() req: any) {
    return { message: `Authorized faculty guide access: ${req.user.email}` };
  }

  @Get('admin-portal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAdminOnlyData(@Req() req: any) {
    return { message: `Authorized directorate access: ${req.user.email}` };
  }
}
