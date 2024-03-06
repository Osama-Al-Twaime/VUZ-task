import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Shipment, User } from 'src/models';
import { Model } from 'mongoose';
import { CreateShipmentDto, ShipmentFeedBack } from 'src/dtos';
import { ShipmentStatus, ProducerTopics } from 'src/enums';
import { KafkaService } from './kafka';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Shipment.name) private shipmentModel: Model<Shipment>,
    private readonly kafkaProducer: KafkaService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async allShipments(
    email: string,
    limit: number,
    page: number,
  ): Promise<Shipment[]> {
    const cacheKey = `user-shipments-${email}-${parseInt(limit.toString())}-${page}`;
    const userShipments = await this.cacheService.get<Shipment[]>(cacheKey);

    if (userShipments) {
      return userShipments;
    }

    const offset = limit * (page - 1);

    const pipeline = [
      {
        $match: { email: email },
      },
      {
        $lookup: {
          from: 'shipments',
          localField: 'shipments',
          foreignField: '_id',
          as: 'shipments',
        },
      },
      {
        $unwind: '$shipments',
      },
      {
        $skip: offset,
      },
      {
        $limit: parseInt(limit.toString()),
      },
      {
        $group: {
          _id: '$_id',
          email: { $first: '$email' },
          fullName: { $first: '$fullName' },
          role: { $first: '$role' },
          status: { $first: '$status' },
          shipments: { $push: '$shipments' },
        },
      },
    ];

    const user = await this.userModel.aggregate(pipeline).exec();
    await this.cacheService.set(cacheKey, user[0].shipments, 60000);
    return user.length > 0 ? user[0].shipments : [];
  }

  async updateShipment(
    shipmentId: string,
    updateOptions: Partial<CreateShipmentDto>,
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

  async cancelShipment(shipmentId: string) {
    const shipment = await this.shipmentModel.findById(shipmentId);

    if (shipment.status !== ShipmentStatus.SCHEDULED) {
      throw new BadRequestException("Can't cancel this shipment");
    }
    const message = {
      shipmentId,
      updateOptions: {
        status: ShipmentStatus.CANCELLED,
      },
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

  async updateFeedBack(
    shipmentId: string,
    body: ShipmentFeedBack,
  ): Promise<Shipment> {
    return await this.shipmentModel.findByIdAndUpdate(
      shipmentId,
      {
        $set: { feedback: body },
      },
      {
        new: true,
      },
    );
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
}
