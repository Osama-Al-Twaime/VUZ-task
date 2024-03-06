import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsEmail,
} from 'class-validator';
import { ShipmentStatus, DeliveryVehicleType } from 'src/enums';

class DeliveryTimeWindowsDto {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;
}

class DeliveryPreferencesDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryTimeWindowsDto)
  deliveryTimeWindows: DeliveryTimeWindowsDto;

  @IsString()
  @IsOptional()
  packagingInstructions: string;

  @IsOptional()
  deliveryVehicleTypePreferences: DeliveryVehicleType;
}

class Shipment {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsObject()
  @Type(() => DeliveryPreferencesDto)
  @ValidateNested()
  deliveryPreferences: DeliveryPreferencesDto;
}

export class CreateShipmentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  shipment: Shipment;
}

export class ShipmentFeedBack {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comments: string;
}

export class UpdateShipmentDto {
  @IsString()
  @IsOptional()
  origin: string;

  @IsString()
  @IsOptional()
  destination: string;

  @IsObject()
  @IsOptional()
  @Type(() => DeliveryPreferencesDto)
  @ValidateNested()
  deliveryPreferences: DeliveryPreferencesDto;

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status: ShipmentStatus;
}
