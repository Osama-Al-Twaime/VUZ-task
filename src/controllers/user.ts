import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateShipmentDto, ShipmentFeedBack } from 'src/dtos';
import { AuthenticationInterceptor } from 'src/interceptors';
import { UserService } from 'src/services';

@Controller('user')
//@UseInterceptors(AuthenticationInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/shipments')
  async ListShipments(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('email') email: string,
  ) {
    const shipments = await this.userService.allShipments(email, limit, page);
    return shipments;
  }

  @Post('/shipment')
  async createShipment(@Body() body: CreateShipmentDto) {
    const shipment = await this.userService.createShipment(body);
    return shipment;
  }

  @Patch('/shipment/:shipmentId')
  @UseInterceptors(AuthenticationInterceptor)
  async updateShipment(
    @Param('shipmentId') shipmentId: string,
    @Body() body: Partial<CreateShipmentDto>,
  ) {
    const shipments = await this.userService.updateShipment(shipmentId, body);
    return shipments;
  }

  @Delete('/shipment/:shipmentId')
  @UseInterceptors(AuthenticationInterceptor)
  async cancelShipment(@Param('shipmentId') shipmentId: string) {
    const shipments = await this.userService.cancelShipment(shipmentId);
    return shipments;
  }

  @Post('/shipment/:shipmentId/feedback')
  @UseInterceptors(AuthenticationInterceptor)
  async addShipmentFeedback(
    @Param('shipmentId') shipmentId: string,
    @Body() body: ShipmentFeedBack,
  ) {
    const shipments = await this.userService.updateFeedBack(shipmentId, body);
    return shipments;
  }
}
