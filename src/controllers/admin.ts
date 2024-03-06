import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
  UpdateUserStatus,
} from 'src/dtos';
import { AdminInterceptor, AuthenticationInterceptor } from 'src/interceptors';
import { AdminService } from 'src/services';

@Controller('admin')
@UseInterceptors(AuthenticationInterceptor)
@UseInterceptors(AdminInterceptor)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Patch('/approve')
  @HttpCode(204)
  async approveUser(@Body() userEmail: UpdateUserStatus) {
    this.adminService.approveUser(userEmail.email);
  }

  @Patch('/disable')
  @HttpCode(204)
  async rejectUser(@Body() userEmail: UpdateUserStatus) {
    this.adminService.rejectUser(userEmail.email);
  }

  @Get('/shipments')
  async listShipments(
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    const shipments = await this.adminService.listShipments(limit, page);
    return shipments;
  }

  @Post('/shipment')
  async createShipment(@Body() body: CreateShipmentDto) {
    const shipment = await this.adminService.createShipment(body);
    return shipment;
  }

  @Patch('/shipment/:id')
  async updateShipment(
    @Param('id') shipmentId: string,
    @Body() body: Partial<UpdateShipmentDto>,
  ) {
    const shipment = await this.adminService.updateShipment(shipmentId, body);
    return shipment;
  }

  @Delete('/shipment/:id')
  @HttpCode(204)
  async deleteShipment(@Param('id') shipmentId: string) {
    this.adminService.deleteShipment(shipmentId);
  }
}
