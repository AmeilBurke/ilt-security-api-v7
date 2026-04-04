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

  async signIn(email: string, password: string): Promise<any> {
    const staff = await this.staffService.findOneByEmail(email);

    const isPasswordCorrect = await checkPassword(password, staff.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    const payload = { sub: staff.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
