import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { UserInfo } from 'src/user/decorator/user.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

export const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bathrooms: true,
  number_of_bedrooms: true,
};

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) { }
  async getHomes(filters: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });
    if (!homes.length) {
      throw new NotFoundException();
    }
    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }
  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({ where: { id } });
    if (!home) {
      throw new NotFoundException();
    }
    return new HomeResponseDto(home);
  }

  async createHome(
    {
      address,
      numberOfBathrooms,
      numberOfBedrooms,
      city,
      landSize,
      price,
      propertyType,
      images,
    }: CreateHomeParams,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        realtor_id: userId,
        propertyType,
        price,
      },
    });
    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });
    await this.prismaService.image.createMany({ data: homeImages });
    return new HomeResponseDto(home);
  }
  async updateHomeById(id: number, data: UpdateHomeParams) {
    const home = await this.prismaService.home.findUnique({ where: { id } });
    if (!home) {
      throw new NotFoundException();
    }
    const updatedHome = await this.prismaService.home.update({
      where: { id },
      data,
    });
    return new HomeResponseDto(updatedHome);
  }
  async deleteHomeById(id: number) {
    const home = this.prismaService.home.findUnique({ where: { id } });
    if (!home) {
      throw new NotFoundException();
    }
    await this.prismaService.home.delete({ where: { id } });
  }
  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
      select: {
        realtor: { select: { name: true, id: true, email: true, phone: true } },
      },
    });
    if (!home) {
      throw new NotFoundException();
    }
    return home.realtor;
  }
  async inquire(buyer: UserInfo, homeId: number, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);
    return await this.prismaService.message.create({
      data: {
        realtor_id: realtor.id,
        home_id: homeId,
        buyer_id: buyer.id,
        message,
      },
    });
  }
  async getMessagesByHome(homeId: number) {
    return this.prismaService.message.findMany({
      where: { home_id: homeId },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }
}
