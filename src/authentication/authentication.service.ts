import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StaffService } from 'src/staff/staff.service';
import { checkPassword } from 'src/utils';

@Injectable()
export class AuthenticationService {
  constructor(
    private staffService: StaffService,
    private jwtService: JwtService,
  ) { }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const staff = await this.staffService.findOneByEmail(email);

    const isPasswordCorrect = await checkPassword(pass, staff.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    const { password, ...staffWithoutPassword } = staff;
    const payload = { ...staffWithoutPassword };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
