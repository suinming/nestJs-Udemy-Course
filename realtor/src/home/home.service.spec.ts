import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeService, homeSelect } from './home.service';

const mockGetHomes = [
  {
    id: 1,
    address: '234 william str',
    city: 'Toronto',
    price: 1500,
    propertyType: PropertyType.RESIDENTIAL,
    image: 'img1',
    number_of_bedrooms: 3,
    number_of_bathrooms: 2,
    images: [{ url: 'src1' }],
  },
];
const mockHome = {
  id: 1,
  address: '234 william str',
  city: 'Toronto',
  price: 1500,
  propertyType: PropertyType.RESIDENTIAL,
  image: 'img1',
  number_of_bedrooms: 3,
  number_of_bathrooms: 2,
};
const mockImages = [
  {
    id: 1,
    url: 'src1',
  },
  { id: 2, url: 'src2' },
];
describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 1000,
        lte: 1500,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };
    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
      await service.getHomes(filters);
      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });
    it('should throw not found exception if not homes if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParam = {
      address: '111 tww',
      numberOfBathrooms: 2,
      numberOfBedrooms: 3,
      city: 'Vancouver',
      landSize: 444,
      price: 3000,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'src1',
        },
      ],
    };
    it('should call prisma home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);
      await service.createHome(mockCreateHomeParam, 5);
      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: '111 tww',
          number_of_bathrooms: 2,
          number_of_bedrooms: 3,
          city: 'Vancouver',
          land_size: 444,
          price: 3000,
          propertyType: PropertyType.RESIDENTIAL,
          realtor_id: 5,
        },
      });
    });
    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateImages = jest.fn().mockReturnValue(mockImages);
      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateImages);
      await service.createHome(mockCreateHomeParam, 5);
      expect(mockCreateImages).toBeCalledWith({
        data: [{ url: 'src1', home_id: 1 }],
      });
    });
  });
});
