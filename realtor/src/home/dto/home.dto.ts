import { PropertyType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class HomeResponseDto {
  'id': number;
  'address': string;

  // change the return prop name
  @Exclude()
  'number_of_bedrooms': number;
  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }

  // change the return prop name
  @Exclude()
  'number_of_bathrooms': number;
  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  'city': string;

  @Exclude()
  'listed_date': Date;
  @Expose({ name: 'listedDate' })
  listedDate() {
    return this.listed_date;
  }

  'price': number;

  'image': string;

  @Exclude()
  'land_size': number;
  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }

  'propertyType': PropertyType;

  @Exclude()
  'realtor_id': number;

  @Exclude()
  'created_at': Date;

  @Exclude()
  'updated_at': Date;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}
