import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RoleGuard } from '@src/base/guards';
import { ApiBearerAuth, } from '@nestjs/swagger';
import { BaseController } from '@src/base/http/controllers';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleService } from './role.service';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('company/user/role')
export class RoleController extends BaseController(CreateRoleDto)
{  
  constructor(protected readonly roleService: RoleService) {
    super(roleService);
  }
}