import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Shipment, User } from 'src/models';
import { Model } from 'mongoose';
import { ProducerTopics, ShipmentStatus, UserStatus } from 'src/enums';
import { CreateShipmentDto, UpdateShipmentDto } from 'src/dtos';
import { KafkaService } from './kafka';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Shipment.name) private shipmentModel: Model<Shipment>,
    private readonly kafkaProducer: KafkaService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async approveUser(email: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email },
      { $set: { status: UserStatus.ENABLED } },
    );
  }

  async rejectUser(email: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email },
      { $set: { status: UserStatus.DISABLED } },
    );
  }

  async listShipments(limit: number, page: number): Promise<Shipment[]> {
    const cacheKey = `all-shipment-${limit}-${page}`;
    let shipments = await this.cacheService.get<Shipment[]>(cacheKey);

    if (!shipments) {
      const offset = limit * (page - 1);
      shipments = await this.shipmentModel.find({}).limit(limit).skip(offset);

      await this.cacheService.set(cacheKey, shipments, 60000);
      return shipments;
    } else {
      return shipments;
    }
  }

  async createShipment(
    createShipmentDto: CreateShipmentDto,
  ): Promise<Shipment> {
    const shipment = await this.shipmentModel.create({
      ...createShipmentDto.shipment,
      history: {
        status: ShipmentStatus.SCHEDULED,
        createdAt: new Date(),
      },
    });

    await this.userModel.findOneAndUpdate(
      { email: createShipmentDto.email },
      { $push: { shipments: shipment._id } },
    );
    await this.cacheService.reset();
    return shipment;
  }

  async updateShipment(
    shipmentId: string,
    updateOptions: Partial<UpdateShipmentDto>,
  ) {
    const message = {
      shipmentId,
      updateOptions,
    };

    this.kafkaProducer.produce({
      topic: ProducerTopics.SHIPMENT_TRANSIT,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });

    await this.cacheService.reset();
  }

  async deleteShipment(shipmentId: string): Promise<void> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (
      shipment.status === ShipmentStatus.DELETED ||
      shipment.status === ShipmentStatus.IN_TRANSIT
    ) {
      throw new BadRequestException(
        `Failed to delete this shipping - reason: shipment status is ${shipment.status}`,
      );
    }

    await this.cacheService.reset();

    this.kafkaProducer.produce({
      topic: ProducerTopics.SHIPMENT_DELETED,
      messages: [{ value: shipmentId }],
    });
  }
}
